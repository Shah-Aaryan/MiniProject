# labor_market/serializers.py
from rest_framework import serializers
from .models import *

class IndustrySerializer(serializers.ModelSerializer):
    sub_industries_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Industry
        fields = '__all__'
    
    def get_sub_industries_count(self, obj):
        return obj.sub_industries.count()

class JobRoleSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    
    class Meta:
        model = JobRole
        fields = '__all__'

class SalaryDataSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_role.title', read_only=True)
    location_display = serializers.SerializerMethodField()
    
    class Meta:
        model = SalaryData
        fields = '__all__'
    
    def get_location_display(self, obj):
        location_parts = [obj.city, obj.state, obj.country]
        return ', '.join([part for part in location_parts if part])

class JobMarketTrendSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_role.title', read_only=True)
    
    class Meta:
        model = JobMarketTrend
        fields = '__all__'

class SkillDemandSerializer(serializers.ModelSerializer):
    related_jobs_count = serializers.IntegerField(source='related_jobs.count', read_only=True)
    
    class Meta:
        model = SkillDemand
        fields = '__all__'

class CompanyInsightSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    
    class Meta:
        model = CompanyInsight
        fields = '__all__'

class EmergingRoleSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    
    class Meta:
        model = EmergingRole
        fields = '__all__'

class CareerPathRecommendationSerializer(serializers.ModelSerializer):
    current_role_title = serializers.CharField(source='current_role.title', read_only=True)
    recommended_role_title = serializers.CharField(source='recommended_role.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CareerPathRecommendation
        fields = '__all__'

