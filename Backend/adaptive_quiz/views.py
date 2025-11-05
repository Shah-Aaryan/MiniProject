# adaptive_quiz/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from .models import (
    QuizCategory, Question, QuestionOption,
    AdaptiveQuiz, QuizAttempt, UserSkillProfile
)
from .serializers import (
    QuizCategorySerializer, QuestionSerializer, QuestionDetailSerializer,
    AdaptiveQuizSerializer, AdaptiveQuizDetailSerializer,
    QuizAttemptSerializer, UserSkillProfileSerializer,
    StartQuizSerializer, SubmitAnswerSerializer, CompleteQuizSerializer,
    QuestionOptionReviewSerializer
)


class QuizCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing quiz categories.
    Read-only to prevent unauthorized category creation.
    """
    queryset = QuizCategory.objects.all()
    serializer_class = QuizCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all active questions for a category"""
        category = self.get_object()
        questions = category.questions.filter(is_active=True)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for a category"""
        category = self.get_object()
        total_questions = category.questions.filter(is_active=True).count()
        total_quizzes = AdaptiveQuiz.objects.filter(category=category).count()
        avg_score = AdaptiveQuiz.objects.filter(
            category=category, is_completed=True
        ).aggregate(avg=Avg('total_score'))['avg'] or 0
        
        return Response({
            'category_id': category.id,
            'category_name': category.name,
            'total_questions': total_questions,
            'total_quizzes': total_quizzes,
            'average_score': round(avg_score, 2)
        })


class AdaptiveQuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing adaptive quizzes.
    """
    serializer_class = AdaptiveQuizSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return quizzes for the authenticated user"""
        return AdaptiveQuiz.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return AdaptiveQuizDetailSerializer
        return AdaptiveQuizSerializer
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """Start a new adaptive quiz"""
        serializer = StartQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        category_id = serializer.validated_data['category_id']
        category = get_object_or_404(QuizCategory, id=category_id)
        
        # Check if user has an incomplete quiz for this category
        incomplete_quiz = AdaptiveQuiz.objects.filter(
            user=request.user,
            category=category,
            is_completed=False
        ).first()
        
        if incomplete_quiz:
            return Response({
                'message': 'You have an incomplete quiz for this category.',
                'quiz_id': incomplete_quiz.id,
                'quiz': AdaptiveQuizSerializer(incomplete_quiz).data
            }, status=status.HTTP_200_OK)
        
        # Create new quiz
        quiz = AdaptiveQuiz.objects.create(
            user=request.user,
            category=category,
            current_difficulty='easy'
        )
        
        # Get first question
        first_question = self._get_next_question(quiz)
        
        return Response({
            'quiz': AdaptiveQuizSerializer(quiz).data,
            'question': QuestionSerializer(first_question).data if first_question else None,
            'message': 'Quiz started successfully'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def get_question(self, request, pk=None):
        """Get the next question for the quiz"""
        quiz = self.get_object()
        
        if quiz.is_completed:
            return Response(
                {'error': 'Quiz is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get next unanswered question
        answered_question_ids = quiz.attempts.values_list('question_id', flat=True)
        next_question = self._get_next_question(quiz, exclude_ids=answered_question_ids)
        
        if not next_question:
            return Response({
                'message': 'No more questions available.',
                'quiz_complete': True
            }, status=status.HTTP_200_OK)
        
        serializer = QuestionSerializer(next_question)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Submit an answer for a question"""
        quiz = self.get_object()
        
        if quiz.is_completed:
            return Response(
                {'error': 'Quiz is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SubmitAnswerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        question_id = serializer.validated_data['question_id']
        selected_option_id = serializer.validated_data['selected_option_id']
        time_taken = serializer.validated_data['time_taken']
        
        question = get_object_or_404(Question, id=question_id, is_active=True)
        selected_option = get_object_or_404(QuestionOption, id=selected_option_id)
        
        # Check if already answered
        if quiz.attempts.filter(question=question).exists():
            return Response(
                {'error': 'This question has already been answered.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if option belongs to question
        if selected_option.question != question:
            return Response(
                {'error': 'Selected option does not belong to this question.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine if answer is correct
        is_correct = selected_option.is_correct
        points_earned = question.points if is_correct else 0
        
        # Create attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            question=question,
            selected_option=selected_option,
            is_correct=is_correct,
            points_earned=points_earned,
            time_taken=time_taken
        )
        
        # Update quiz statistics
        quiz.total_score += points_earned
        quiz.max_possible_score += question.points
        quiz.total_questions += 1
        quiz.correct_answers += 1 if is_correct else 0
        quiz.time_taken += time_taken
        
        # Update difficulty based on performance
        quiz.current_difficulty = self._update_difficulty(quiz)
        quiz.save()
        
        # Update user skill profile
        self._update_skill_profile(quiz, question, is_correct)
        
        # Get correct answer for response
        correct_option = question.options.filter(is_correct=True).first()
        
        return Response({
            'attempt': QuizAttemptSerializer(attempt).data,
            'is_correct': is_correct,
            'points_earned': points_earned,
            'correct_option_id': correct_option.id if correct_option else None,
            'explanation': selected_option.explanation if selected_option.explanation else None,
            'quiz': AdaptiveQuizSerializer(quiz).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete the quiz"""
        quiz = self.get_object()
        
        if quiz.is_completed:
            return Response(
                {'error': 'Quiz is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quiz.is_completed = True
        quiz.completed_at = timezone.now()
        quiz.save()
        
        # Update user skill profile statistics
        self._update_user_quiz_stats(quiz)
        
        serializer = AdaptiveQuizDetailSerializer(quiz)
        return Response({
            'quiz': serializer.data,
            'message': 'Quiz completed successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get detailed results for a completed quiz"""
        quiz = self.get_object()
        
        if not quiz.is_completed:
            return Response(
                {'error': 'Quiz is not yet completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attempts = quiz.attempts.all()
        serializer = AdaptiveQuizDetailSerializer(quiz)
        
        # Calculate performance by difficulty
        difficulty_stats = {}
        for difficulty in ['easy', 'medium', 'hard', 'expert']:
            difficulty_attempts = attempts.filter(question__difficulty=difficulty)
            if difficulty_attempts.exists():
                difficulty_stats[difficulty] = {
                    'total': difficulty_attempts.count(),
                    'correct': difficulty_attempts.filter(is_correct=True).count(),
                    'accuracy': round(
                        (difficulty_attempts.filter(is_correct=True).count() / 
                         difficulty_attempts.count()) * 100, 2
                    )
                }
        
        return Response({
            'quiz': serializer.data,
            'difficulty_stats': difficulty_stats,
            'performance_summary': {
                'accuracy': quiz.calculate_accuracy(),
                'score_percentage': quiz.calculate_score_percentage(),
                'total_time': quiz.time_taken,
                'average_time_per_question': round(
                    quiz.time_taken / quiz.total_questions if quiz.total_questions > 0 else 0, 2
                )
            }
        })
    
    @action(detail=True, methods=['get'])
    def review(self, request, pk=None):
        """Review all questions and answers for a completed quiz"""
        quiz = self.get_object()
        
        if not quiz.is_completed:
            return Response(
                {'error': 'Quiz must be completed before review.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attempts = quiz.attempts.select_related('question', 'selected_option').all()
        review_data = []
        
        for attempt in attempts:
            question = attempt.question
            correct_option = question.options.filter(is_correct=True).first()
            
            review_data.append({
                'question': QuestionDetailSerializer(question).data,
                'attempt': QuizAttemptSerializer(attempt).data,
                'correct_option': QuestionOptionReviewSerializer(correct_option).data if correct_option else None
            })
        
        return Response({
            'quiz': AdaptiveQuizSerializer(quiz).data,
            'review': review_data
        })
    
    def _get_next_question(self, quiz, exclude_ids=None):
        """Get the next question based on adaptive algorithm"""
        if exclude_ids is None:
            exclude_ids = []
        
        # Get available questions from the category
        available_questions = quiz.category.questions.filter(
            is_active=True
        ).exclude(id__in=exclude_ids)
        
        if not available_questions.exists():
            return None
        
        # Simple adaptive algorithm: select question based on current difficulty
        # In a more sophisticated implementation, this would use IRT
        difficulty_order = ['easy', 'medium', 'hard', 'expert']
        current_difficulty_index = difficulty_order.index(quiz.current_difficulty)
        
        # Try to get question at current difficulty level
        question = available_questions.filter(
            difficulty=quiz.current_difficulty
        ).first()
        
        # If no question at current difficulty, get closest available
        if not question:
            for diff in difficulty_order[current_difficulty_index:]:
                question = available_questions.filter(difficulty=diff).first()
                if question:
                    break
        
        # Fallback to any available question
        if not question:
            question = available_questions.first()
        
        return question
    
    def _update_difficulty(self, quiz):
        """Update quiz difficulty based on recent performance"""
        if quiz.total_questions == 0:
            return 'easy'
        
        recent_accuracy = quiz.calculate_accuracy()
        
        # Adjust difficulty based on accuracy
        if recent_accuracy >= 80 and quiz.current_difficulty != 'expert':
            difficulty_order = ['easy', 'medium', 'hard', 'expert']
            current_index = difficulty_order.index(quiz.current_difficulty)
            if current_index < len(difficulty_order) - 1:
                return difficulty_order[current_index + 1]
        elif recent_accuracy < 50 and quiz.current_difficulty != 'easy':
            difficulty_order = ['easy', 'medium', 'hard', 'expert']
            current_index = difficulty_order.index(quiz.current_difficulty)
            if current_index > 0:
                return difficulty_order[current_index - 1]
        
        return quiz.current_difficulty
    
    def _update_skill_profile(self, quiz, question, is_correct):
        """Update user skill profile based on question performance"""
        profile, created = UserSkillProfile.objects.get_or_create(
            user=quiz.user
        )
        
        # Update skills based on question tags
        if question.skill_tags:
            performance = 100 if is_correct else 0
            for skill_tag in question.skill_tags:
                if isinstance(skill_tag, str):
                    profile.update_skill(skill_tag, performance)
    
    def _update_user_quiz_stats(self, quiz):
        """Update user's overall quiz statistics"""
        profile, created = UserSkillProfile.objects.get_or_create(
            user=quiz.user
        )
        
        # Update total quizzes taken
        profile.total_quizzes_taken = AdaptiveQuiz.objects.filter(
            user=quiz.user,
            is_completed=True
        ).count()
        
        # Update average score
        completed_quizzes = AdaptiveQuiz.objects.filter(
            user=quiz.user,
            is_completed=True
        )
        if completed_quizzes.exists():
            avg_score = completed_quizzes.aggregate(
                avg=Avg('total_score')
            )['avg'] or 0
            profile.average_score = round(avg_score, 2)
        
        profile.save()


class UserSkillProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user skill profiles.
    Users can only view their own profile.
    """
    serializer_class = UserSkillProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return skill profile for the authenticated user"""
        return UserSkillProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's skill profile"""
        profile, created = UserSkillProfile.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get user's quiz progress and statistics"""
        user = request.user
        profile, created = UserSkillProfile.objects.get_or_create(user=user)
        
        # Get quiz statistics
        total_quizzes = AdaptiveQuiz.objects.filter(user=user, is_completed=True).count()
        in_progress_quizzes = AdaptiveQuiz.objects.filter(user=user, is_completed=False).count()
        
        # Get category-wise statistics
        category_stats = AdaptiveQuiz.objects.filter(
            user=user, is_completed=True
        ).values('category__name').annotate(
            count=Count('id'),
            avg_score=Avg('total_score'),
            avg_accuracy=Avg('correct_answers')
        )
        
        return Response({
            'profile': UserSkillProfileSerializer(profile).data,
            'statistics': {
                'total_quizzes_completed': total_quizzes,
                'quizzes_in_progress': in_progress_quizzes,
                'average_score': profile.average_score,
                'category_breakdown': list(category_stats)
            }
        })

