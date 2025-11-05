# adaptive_quiz/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    QuizCategory, Question, QuestionOption, 
    AdaptiveQuiz, QuizAttempt, UserSkillProfile
)


class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer for question options (hides correct answers)"""
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'is_correct', 'explanation', 'order']
        extra_kwargs = {
            'is_correct': {'write_only': True},  # Hide correct answer in responses
            'explanation': {'write_only': True}  # Hide explanation until answered
        }


class QuestionOptionReviewSerializer(serializers.ModelSerializer):
    """Serializer for question options in review mode (shows correct answers)"""
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'is_correct', 'explanation', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    options = QuestionOptionSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'category', 'category_name', 'question_text', 
            'difficulty', 'points', 'time_limit', 'skill_tags', 
            'is_active', 'created_at', 'updated_at', 'options'
        ]
        read_only_fields = ['created_at', 'updated_at']


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for questions with correct answers (for review)"""
    options = QuestionOptionReviewSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'category', 'category_name', 'question_text', 
            'difficulty', 'points', 'time_limit', 'skill_tags', 
            'is_active', 'created_at', 'updated_at', 'options'
        ]


class QuizCategorySerializer(serializers.ModelSerializer):
    """Serializer for quiz categories"""
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizCategory
        fields = [
            'id', 'name', 'description', 'difficulty_level', 
            'created_at', 'updated_at', 'question_count'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_question_count(self, obj):
        """Get count of active questions in this category"""
        return obj.questions.filter(is_active=True).count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for individual quiz attempts"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_id = serializers.IntegerField(source='question.id', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.option_text', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'question', 'question_id', 'question_text',
            'selected_option', 'selected_option_text', 'is_correct',
            'points_earned', 'time_taken', 'answered_at'
        ]
        read_only_fields = ['answered_at']


class AdaptiveQuizSerializer(serializers.ModelSerializer):
    """Serializer for adaptive quiz instances"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    accuracy = serializers.SerializerMethodField()
    score_percentage = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AdaptiveQuiz
        fields = [
            'id', 'user', 'username', 'category', 'category_name',
            'started_at', 'completed_at', 'current_difficulty',
            'total_score', 'max_possible_score', 'total_questions',
            'correct_answers', 'is_completed', 'time_taken',
            'accuracy', 'score_percentage', 'attempts_count'
        ]
        read_only_fields = [
            'user', 'started_at', 'completed_at', 'total_score',
            'max_possible_score', 'total_questions', 'correct_answers',
            'is_completed', 'time_taken'
        ]
    
    def get_accuracy(self, obj):
        """Calculate and return accuracy percentage"""
        return obj.calculate_accuracy()
    
    def get_score_percentage(self, obj):
        """Calculate and return score percentage"""
        return obj.calculate_score_percentage()
    
    def get_attempts_count(self, obj):
        """Get count of question attempts"""
        return obj.attempts.count()


class AdaptiveQuizDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for adaptive quiz with attempts"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    accuracy = serializers.SerializerMethodField()
    score_percentage = serializers.SerializerMethodField()
    attempts = QuizAttemptSerializer(many=True, read_only=True)
    
    class Meta:
        model = AdaptiveQuiz
        fields = [
            'id', 'user', 'username', 'category', 'category_name',
            'started_at', 'completed_at', 'current_difficulty',
            'total_score', 'max_possible_score', 'total_questions',
            'correct_answers', 'is_completed', 'time_taken',
            'accuracy', 'score_percentage', 'attempts'
        ]
    
    def get_accuracy(self, obj):
        """Calculate and return accuracy percentage"""
        return obj.calculate_accuracy()
    
    def get_score_percentage(self, obj):
        """Calculate and return score percentage"""
        return obj.calculate_score_percentage()


class UserSkillProfileSerializer(serializers.ModelSerializer):
    """Serializer for user skill profiles"""
    username = serializers.CharField(source='user.username', read_only=True)
    top_skills = serializers.SerializerMethodField()
    weak_skills = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSkillProfile
        fields = [
            'id', 'user', 'username', 'skill_data', 
            'total_quizzes_taken', 'average_score',
            'last_updated', 'created_at', 'top_skills', 'weak_skills'
        ]
        read_only_fields = [
            'user', 'total_quizzes_taken', 'average_score',
            'last_updated', 'created_at'
        ]
    
    def get_top_skills(self, obj):
        """Get top skills by level"""
        top_skills = obj.get_top_skills(limit=5)
        return [
            {
                'skill_name': skill,
                'level': data.get('level', 0),
                'attempts': data.get('attempts', 0),
                'last_score': data.get('last_score', 0)
            }
            for skill, data in top_skills
        ]
    
    def get_weak_skills(self, obj):
        """Get weak skills that need improvement"""
        weak_skills = obj.get_weak_skills(threshold=40, limit=5)
        return [
            {
                'skill_name': skill,
                'level': data.get('level', 0),
                'attempts': data.get('attempts', 0),
                'last_score': data.get('last_score', 0)
            }
            for skill, data in weak_skills
        ]


class StartQuizSerializer(serializers.Serializer):
    """Serializer for starting a new quiz"""
    category_id = serializers.IntegerField(required=True)
    
    def validate_category_id(self, value):
        """Validate that category exists and has questions"""
        try:
            category = QuizCategory.objects.get(id=value)
            if not category.questions.filter(is_active=True).exists():
                raise serializers.ValidationError(
                    "This category has no active questions."
                )
            return value
        except QuizCategory.DoesNotExist:
            raise serializers.ValidationError("Category not found.")


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an answer"""
    question_id = serializers.IntegerField(required=True)
    selected_option_id = serializers.IntegerField(required=True)
    time_taken = serializers.IntegerField(required=True, min_value=0)
    
    def validate_question_id(self, value):
        """Validate that question exists"""
        try:
            Question.objects.get(id=value, is_active=True)
            return value
        except Question.DoesNotExist:
            raise serializers.ValidationError("Question not found or inactive.")
    
    def validate_selected_option_id(self, value):
        """Validate that option exists"""
        try:
            QuestionOption.objects.get(id=value)
            return value
        except QuestionOption.DoesNotExist:
            raise serializers.ValidationError("Option not found.")


class CompleteQuizSerializer(serializers.Serializer):
    """Serializer for completing a quiz"""
    pass  # No additional fields needed, quiz ID is in URL

