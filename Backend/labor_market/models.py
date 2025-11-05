from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class Industry(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    parent_industry = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='sub_industries'
    )
    growth_rate = models.FloatField(default=0.0)
    total_jobs = models.IntegerField(default=0)
    icon = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name_plural = "Industries"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class JobRole(models.Model):
    title = models.CharField(max_length=200)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE, related_name='job_roles')
    description = models.TextField()
    alternate_titles = models.JSONField(default=list)
    required_skills = models.JSONField(default=list)
    preferred_skills = models.JSONField(default=list)
    education_requirements = models.JSONField(default=list)
    experience_level = models.CharField(max_length=50)
    remote_friendly = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
    
    def __str__(self):
        return self.title

class SalaryData(models.Model):
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name='salary_data')
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    min_salary = models.DecimalField(max_digits=12, decimal_places=2)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2)
    median_salary = models.DecimalField(max_digits=12, decimal_places=2)
    avg_salary = models.DecimalField(max_digits=12, decimal_places=2)
    experience_level = models.CharField(max_length=50)
    data_source = models.CharField(max_length=200)
    last_updated = models.DateField()
    sample_size = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['job_role', 'country', 'state', 'city', 'experience_level']
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"{self.job_role.title} - {self.city} - {self.median_salary} {self.currency}"

class JobMarketTrend(models.Model):
    TREND_TYPES = [
        ('demand', 'Job Demand'),
        ('salary', 'Salary Trend'),
        ('skill', 'Skill Demand'),
        ('automation', 'Automation Risk')
    ]
    
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name='market_trends')
    trend_type = models.CharField(max_length=20, choices=TREND_TYPES)
    period_start = models.DateField()
    period_end = models.DateField()
    trend_value = models.FloatField()
    growth_rate = models.FloatField()
    trend_direction = models.CharField(max_length=20)
    confidence_score = models.FloatField(validators=[MinValueValidator(0)])
    data_points = models.JSONField(default=list)
    insights = models.TextField()
    
    class Meta:
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.job_role.title} - {self.trend_type}"

class SkillDemand(models.Model):
    skill_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    job_postings_count = models.IntegerField(default=0)
    growth_rate = models.FloatField(default=0.0)
    avg_salary_premium = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    related_jobs = models.ManyToManyField(JobRole, related_name='skill_demands')
    trending_rank = models.IntegerField(default=0)
    region = models.CharField(max_length=100, blank=True)
    last_updated = models.DateField()
    
    class Meta:
        ordering = ['trending_rank']
    
    def __str__(self):
        return f"{self.skill_name} - Rank {self.trending_rank}"

class CompanyInsight(models.Model):
    COMPANY_SIZES = [
        ('startup', '1-50'),
        ('small', '51-200'),
        ('medium', '201-1000'),
        ('large', '1001-5000'),
        ('enterprise', '5000+')
    ]
    
    company_name = models.CharField(max_length=200)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    active_job_openings = models.IntegerField(default=0)
    hiring_trend = models.CharField(max_length=20)
    popular_roles = models.JSONField(default=list)
    employee_satisfaction = models.FloatField(null=True, blank=True)
    growth_stage = models.CharField(max_length=50, blank=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['company_name']
    
    def __str__(self):
        return self.company_name

class EmergingRole(models.Model):
    title = models.CharField(max_length=200)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE)
    description = models.TextField()
    emergence_score = models.FloatField()
    growth_projection = models.FloatField()
    required_skills = models.JSONField(default=list)
    avg_salary_range = models.CharField(max_length=100)
    related_roles = models.ManyToManyField(JobRole, related_name='emerging_alternatives')
    identified_date = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['-emergence_score']
    
    def __str__(self):
        return self.title

class CareerPathRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='career_recommendations')
    current_role = models.ForeignKey(
        JobRole, 
        on_delete=models.CASCADE, 
        related_name='current_recommendations', 
        null=True
    )
    recommended_role = models.ForeignKey(
        JobRole, 
        on_delete=models.CASCADE, 
        related_name='target_recommendations'
    )
    match_score = models.FloatField()
    skill_gap_analysis = models.JSONField(default=dict)
    estimated_transition_time = models.CharField(max_length=100)
    salary_potential = models.CharField(max_length=100)
    market_demand_score = models.FloatField()
    reasoning = models.TextField()
    recommended_courses = models.JSONField(default=list)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-match_score']
    
    def __str__(self):
        return f"{self.user.username} -> {self.recommended_role.title}"