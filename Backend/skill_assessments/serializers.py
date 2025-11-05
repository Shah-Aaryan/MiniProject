from rest_framework import serializers
from .models import *

class SkillCategorySerializer(serializers.ModelSerializer):
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillCategory
        fields = '__all__'
    
    def get_subcategories_count(self, obj):
        return obj.subcategories.count()

class AssessmentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentOption
        fields = ['id', 'option_text', 'is_correct', 'explanation', 'order']
        extra_kwargs = {
            'is_correct': {'write_only': True},
            'explanation': {'write_only': True}
        }

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    options = AssessmentOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'question_type', 'question_text', 'code_snippet',
                  'time_limit', 'points', 'hints', 'options']

class SkillSetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillSet
        fields = '__all__'
    
    def get_question_count(self, obj):
        return obj.questions.filter(is_active=True).count()

class SkillAssessmentSerializer(serializers.ModelSerializer):
    skill_set_name = serializers.CharField(source='skill_set.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SkillAssessment
        fields = '__all__'
        read_only_fields = ['user', 'started_at']

class AssessmentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = AssessmentAnswer
        fields = '__all__'

class UserSkillBadgeSerializer(serializers.ModelSerializer):
    skill_set_name = serializers.CharField(source='skill_set.name', read_only=True)
    badge_image = serializers.ImageField(source='skill_set.badge_image', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserSkillBadge
        fields = '__all__'

class SkillGapSerializer(serializers.ModelSerializer):
    skill_set_name = serializers.CharField(source='skill_set.name', read_only=True)
    
    class Meta:
        model = SkillGap
        fields = '__all__'

class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = '__all__'

class PeerComparisonSerializer(serializers.ModelSerializer):
    skill_set_name = serializers.CharField(source='skill_set.name', read_only=True)
    
    class Meta:
        model = PeerComparison
        fields = '__all__'