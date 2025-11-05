from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count
from .models import *
from .serializers import *
import uuid

class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillCategory.objects.filter(is_active=True, parent_category=None)
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        category = self.get_object()
        subcategories = category.subcategories.filter(is_active=True)
        serializer = self.get_serializer(subcategories, many=True)
        return Response(serializer.data)

class SkillSetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillSet.objects.filter(is_active=True)
    serializer_class = SkillSetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        
        if category:
            queryset = queryset.filter(category_id=category)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def resources(self, request, pk=None):
        skill_set = self.get_object()
        resources = skill_set.resources.all()
        serializer = LearningResourceSerializer(resources, many=True)
        return Response(serializer.data)

class SkillAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = SkillAssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SkillAssessment.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def start_assessment(self, request):
        skill_set_id = request.data.get('skill_set_id')
        
        try:
            skill_set = SkillSet.objects.get(id=skill_set_id, is_active=True)
        except SkillSet.DoesNotExist:
            return Response({'error': 'Skill set not found'}, status=404)
        
        # Get attempt number
        attempt_number = SkillAssessment.objects.filter(
            user=request.user,
            skill_set=skill_set
        ).count() + 1
        
        # Calculate max score
        max_score = skill_set.questions.filter(is_active=True).aggregate(
            total=models.Sum('points')
        )['total'] or 0
        
        assessment = SkillAssessment.objects.create(
            user=request.user,
            skill_set=skill_set,
            status='in-progress',
            started_at=timezone.now(),
            max_score=max_score,
            attempt_number=attempt_number
        )
        
        serializer = self.get_serializer(assessment)
        return Response(serializer.data, status=201)
    
    @action(detail=True, methods=['get'])
    def get_question(self, request, pk=None):
        assessment = self.get_object()
        
        if assessment.status != 'in-progress':
            return Response({'error': 'Assessment is not in progress'}, status=400)
        
        answered_questions = assessment.answers.values_list('question_id', flat=True)
        questions = assessment.skill_set.questions.filter(
            is_active=True
        ).exclude(id__in=answered_questions)
        
        if not questions.exists():
            return Response({'message': 'No more questions'}, status=404)
        
        question = questions.first()
        serializer = AssessmentQuestionSerializer(question)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        assessment = self.get_object()
        question_id = request.data.get('question_id')
        selected_option_id = request.data.get('selected_option_id')
        text_answer = request.data.get('text_answer', '')
        code_answer = request.data.get('code_answer', '')
        time_taken = request.data.get('time_taken', 0)
        
        try:
            question = AssessmentQuestion.objects.get(id=question_id)
        except AssessmentQuestion.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)
        
        is_correct = False
        points_earned = 0
        feedback = ""
        
        if question.question_type == 'mcq' and selected_option_id:
            try:
                selected_option = question.options.get(id=selected_option_id)
                is_correct = selected_option.is_correct
                if is_correct:
                    points_earned = question.points
                feedback = question.explanation
            except AssessmentOption.DoesNotExist:
                pass
        
        answer = AssessmentAnswer.objects.create(
            assessment=assessment,
            question=question,
            selected_option_id=selected_option_id if selected_option_id else None,
            text_answer=text_answer,
            code_answer=code_answer,
            is_correct=is_correct,
            points_earned=points_earned,
            time_taken=time_taken,
            feedback=feedback
        )
        
        assessment.total_score += points_earned
        assessment.time_taken += time_taken
        assessment.save()
        
        correct_option = question.options.filter(is_correct=True).first()
        
        return Response({
            'is_correct': is_correct,
            'points_earned': points_earned,
            'correct_option_id': correct_option.id if correct_option else None,
            'feedback': feedback,
            'total_score': assessment.total_score
        })
    
    @action(detail=True, methods=['post'])
    def complete_assessment(self, request, pk=None):
        assessment = self.get_object()
        assessment.status = 'completed'
        assessment.completed_at = timezone.now()
        assessment.calculate_percentage()
        
        if assessment.passed:
            self._award_badge(assessment)
        
        self._generate_skill_gaps(assessment)
        self._generate_peer_comparison(assessment)
        
        serializer = self.get_serializer(assessment)
        return Response({
            'assessment': serializer.data,
            'message': 'Assessment completed successfully'
        })
    
    @action(detail=True, methods=['get'])
    def detailed_report(self, request, pk=None):
        assessment = self.get_object()
        answers = assessment.answers.all()
        
        skill_gaps = SkillGap.objects.filter(assessment=assessment)
        peer_comparison = PeerComparison.objects.filter(
            user=request.user,
            skill_set=assessment.skill_set
        ).first()
        
        return Response({
            'assessment': SkillAssessmentSerializer(assessment).data,
            'answers': AssessmentAnswerSerializer(answers, many=True).data,
            'skill_gaps': SkillGapSerializer(skill_gaps, many=True).data,
            'peer_comparison': PeerComparisonSerializer(peer_comparison).data if peer_comparison else None
        })
    
    def _award_badge(self, assessment):
        UserSkillBadge.objects.create(
            user=assessment.user,
            skill_set=assessment.skill_set,
            assessment=assessment
        )
    
    def _generate_skill_gaps(self, assessment):
        incorrect_answers = assessment.answers.filter(is_correct=False)
        weaknesses = []
        
        for answer in incorrect_answers:
            weaknesses.append(answer.question.question_text[:50])
        
        resources = LearningResource.objects.filter(
            skill_set=assessment.skill_set
        )[:5]
        
        recommended_resources = [{
            'title': r.title,
            'url': r.url,
            'type': r.resource_type
        } for r in resources]
        
        SkillGap.objects.create(
            user=assessment.user,
            skill_set=assessment.skill_set,
            assessment=assessment,
            identified_weaknesses=weaknesses,
            recommended_resources=recommended_resources
        )
    
    def _generate_peer_comparison(self, assessment):
        peer_assessments = SkillAssessment.objects.filter(
            skill_set=assessment.skill_set,
            status='completed'
        ).exclude(user=assessment.user)
        
        if peer_assessments.exists():
            stats = peer_assessments.aggregate(
                avg_score=Avg('percentage'),
                count=Count('id')
            )
            
            better_than = peer_assessments.filter(
                percentage__lt=assessment.percentage
            ).count()
            percentile = (better_than / stats['count']) * 100 if stats['count'] > 0 else 0
            
            PeerComparison.objects.create(
                user=assessment.user,
                skill_set=assessment.skill_set,
                user_score=assessment.percentage,
                peer_average=stats['avg_score'] or 0,
                percentile=percentile,
                total_peers=stats['count']
            )

class UserSkillBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSkillBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkillBadge.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        badge = self.get_object()
        return Response({
            'verified': True,
            'badge': UserSkillBadgeSerializer(badge).data
        })