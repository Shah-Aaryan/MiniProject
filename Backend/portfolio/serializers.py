# ========================================
# PORTFOLIO - serializers.py
# ========================================
from rest_framework import serializers
from .models import *

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'display_name', 'order']

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption', 'order']

class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
    
    def get_duration(self, obj):
        if obj.is_ongoing:
            return "Ongoing"
        elif obj.end_date:
            months = (obj.end_date.year - obj.start_date.year) * 12
            months += obj.end_date.month - obj.start_date.month
            return f"{months} months"
        return "N/A"

class ExperienceSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Experience
        fields = '__all__'
    
    def get_duration(self, obj):
        end = obj.end_date if not obj.is_current else timezone.now().date()
        if end and obj.start_date:
            months = (end.year - obj.start_date.year) * 12
            months += end.month - obj.start_date.month
            years = months // 12
            remaining_months = months % 12
            if years > 0:
                return f"{years} yr {remaining_months} mo"
            return f"{remaining_months} months"
        return "N/A"

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class CertificationSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Certification
        fields = '__all__'
    
    def get_is_valid(self, obj):
        if obj.expiry_date:
            return obj.expiry_date >= timezone.now().date()
        return True

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = '__all__'
        read_only_fields = ['portfolio']

class PortfolioTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioTemplate
        fields = '__all__'

class PortfolioSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = '__all__'
        read_only_fields = ['user', 'slug', 'view_count']

class PortfolioDetailSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer(read_only=True)
    social_links = SocialLinkSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    testimonials = TestimonialSerializer(many=True, read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['portfolio', 'is_read', 'is_replied', 'created_at']

