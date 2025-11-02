from rest_framework import serializers
from .models import (
    UserModel, UserProfile, QuizSession, AdaptiveQuizQuestion, 
    ABTestVariant, LearningPath, LearningMilestone, MilestoneProgress,
    SkillAssessment, UserReminder
)



class PredictionSerializer(serializers.Serializer):
    question1 = serializers.CharField(max_length=100)
    question2 = serializers.CharField(max_length=100)
    question3 = serializers.CharField(max_length=100)
    question4 = serializers.CharField(max_length=100)
    question5 = serializers.CharField(max_length=100)
    question6 = serializers.CharField(max_length=100)
    question7 = serializers.CharField(max_length=100)
    question8 = serializers.CharField(max_length=100)
    question9 = serializers.CharField(max_length=100)
    question10 = serializers.CharField(max_length=100)
    question11 = serializers.CharField(max_length=100)
    question12 = serializers.CharField(max_length=100)
    question13 = serializers.CharField(max_length=100)
    question14 = serializers.CharField(max_length=100)
    question15 = serializers.CharField(max_length=100)
    question16 = serializers.CharField(max_length=100)
    question17 = serializers.CharField(max_length=100)
    question18 = serializers.CharField(max_length=100)
    question19 = serializers.CharField(max_length=100)



class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        # fields = ["name","age","email","password"]
        fields = '__all__'



class SignInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['name', 'age', 'email']

# New serializers for advanced features

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class QuizSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSession
        fields = '__all__'

class AdaptiveQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdaptiveQuizQuestion
        fields = '__all__'

class ABTestVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABTestVariant
        fields = '__all__'

class LearningPathSerializer(serializers.ModelSerializer):
    milestones = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningPath
        fields = '__all__'
    
    def get_milestones(self, obj):
        milestones = obj.milestones.all()
        return LearningMilestoneSerializer(milestones, many=True).data

class LearningMilestoneSerializer(serializers.ModelSerializer):
    progress_logs = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningMilestone
        fields = '__all__'
    
    def get_progress_logs(self, obj):
        logs = obj.progress_logs.all()[:5]  # Latest 5 progress logs
        return MilestoneProgressSerializer(logs, many=True).data

class MilestoneProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilestoneProgress
        fields = '__all__'

class SkillAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillAssessment
        fields = '__all__'

class UserReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReminder
        fields = '__all__'

# Specialized serializers for API responses

class ExplainableAIResponseSerializer(serializers.Serializer):
    predicted_role = serializers.CharField()
    confidence = serializers.FloatField()
    feature_importance = serializers.JSONField()
    counterfactual_tips = serializers.JSONField()
    calibration_data = serializers.JSONField()

class AdaptiveQuizResponseSerializer(serializers.Serializer):
    question = serializers.JSONField()
    session_id = serializers.IntegerField()
    progress = serializers.JSONField()
    completed = serializers.BooleanField(default=False)

class LearningPathGenerationSerializer(serializers.Serializer):
    target_role = serializers.CharField()
    current_skills = serializers.JSONField()
    experience_level = serializers.ChoiceField(choices=['beginner', 'intermediate', 'advanced'])
    preferences = serializers.JSONField(required=False)

class MilestoneUpdateSerializer(serializers.Serializer):
    milestone_id = serializers.IntegerField()
    progress_percentage = serializers.IntegerField(min_value=0, max_value=100)
    time_spent_minutes = serializers.IntegerField(min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True)
    feedback = serializers.CharField(required=False, allow_blank=True)