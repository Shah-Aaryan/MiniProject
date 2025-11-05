# skill_assessments/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class SkillCategory(models.Model):
    """Categories for organizing skills"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    parent_category = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subcategories'
    )
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Skill Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class SkillSet(models.Model):
    """Collection of skills to be assessed"""
    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert')
    ]
    
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        SkillCategory, 
        on_delete=models.CASCADE, 
        related_name='skill_sets'
    )
    description = models.TextField()
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS)
    estimated_time = models.IntegerField(help_text="Estimated time in minutes")
    passing_score = models.IntegerField(
        default=70, 
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    badge_image = models.ImageField(
        upload_to='skill_badges/', 
        null=True, 
        blank=True
    )
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'difficulty_level']
    
    def __str__(self):
        return f"{self.name} - {self.difficulty_level}"


class AssessmentQuestion(models.Model):
    """Questions for skill assessments"""
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('coding', 'Coding Challenge'),
        ('true-false', 'True/False'),
        ('fill-blank', 'Fill in the Blank'),
        ('practical', 'Practical Task')
    ]
    
    skill_set = models.ForeignKey(
        SkillSet, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True)
    expected_output = models.TextField(blank=True)
    time_limit = models.IntegerField(default=300, help_text="Time in seconds")
    points = models.IntegerField(default=10)
    difficulty_weight = models.FloatField(default=1.0)
    explanation = models.TextField(blank=True)
    hints = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['skill_set', 'question_type']
    
    def __str__(self):
        return f"{self.skill_set.name} - {self.question_type} - Q{self.id}"


class AssessmentOption(models.Model):
    """Options for MCQ questions"""
    question = models.ForeignKey(
        AssessmentQuestion, 
        on_delete=models.CASCADE, 
        related_name='options'
    )
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.option_text[:50]}..."


class SkillAssessment(models.Model):
    """User's assessment attempt"""
    STATUS_CHOICES = [
        ('not-started', 'Not Started'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired')
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='skill_assessments'
    )
    skill_set = models.ForeignKey(SkillSet, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not-started')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    time_taken = models.IntegerField(default=0, help_text="Time in seconds")
    attempt_number = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['-started_at']
        unique_together = ['user', 'skill_set', 'attempt_number']
    
    def __str__(self):
        return f"{self.user.username} - {self.skill_set.name} (Attempt {self.attempt_number})"
    
    def calculate_percentage(self):
        if self.max_score > 0:
            self.percentage = (self.total_score / self.max_score) * 100
            self.passed = self.percentage >= self.skill_set.passing_score
            self.save()
        return self.percentage


class AssessmentAnswer(models.Model):
    """User's answer to assessment question"""
    assessment = models.ForeignKey(
        SkillAssessment, 
        on_delete=models.CASCADE, 
        related_name='answers'
    )
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(
        AssessmentOption, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    text_answer = models.TextField(blank=True)
    code_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)
    time_taken = models.IntegerField(default=0)
    feedback = models.TextField(blank=True)
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['answered_at']
    
    def __str__(self):
        return f"{self.assessment.user.username} - Q{self.question.id}"


class UserSkillBadge(models.Model):
    """Badges earned by users"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='skill_badges'
    )
    skill_set = models.ForeignKey(SkillSet, on_delete=models.CASCADE)
    assessment = models.ForeignKey(SkillAssessment, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    verification_code = models.CharField(max_length=100, unique=True)
    is_public = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.skill_set.name} Badge"
    
    def save(self, *args, **kwargs):
        if not self.verification_code:
            self.verification_code = str(uuid.uuid4())
        super().save(*args, **kwargs)


class SkillGap(models.Model):
    """Identified skill gaps for users"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='skill_gaps'
    )
    skill_set = models.ForeignKey(SkillSet, on_delete=models.CASCADE)
    assessment = models.ForeignKey(SkillAssessment, on_delete=models.CASCADE)
    identified_weaknesses = models.JSONField(default=list)
    recommended_resources = models.JSONField(default=list)
    improvement_plan = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Skill Gap - {self.user.username} - {self.skill_set.name}"


class LearningResource(models.Model):
    """Learning resources for skill development"""
    RESOURCE_TYPES = [
        ('course', 'Online Course'),
        ('tutorial', 'Tutorial'),
        ('video', 'Video'),
        ('book', 'Book'),
        ('article', 'Article'),
        ('practice', 'Practice Platform'),
        ('documentation', 'Documentation')
    ]
    
    skill_set = models.ForeignKey(
        SkillSet, 
        on_delete=models.CASCADE, 
        related_name='resources'
    )
    title = models.CharField(max_length=300)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    url = models.URLField()
    description = models.TextField()
    provider = models.CharField(max_length=200)
    difficulty_level = models.CharField(max_length=20, choices=SkillSet.DIFFICULTY_LEVELS)
    estimated_duration = models.CharField(max_length=100)
    is_free = models.BooleanField(default=True)
    rating = models.FloatField(
        default=0.0, 
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    thumbnail = models.ImageField(upload_to='resource_thumbnails/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-rating', 'title']
    
    def __str__(self):
        return self.title


class PeerComparison(models.Model):
    """Peer comparison data"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='peer_comparisons'
    )
    skill_set = models.ForeignKey(SkillSet, on_delete=models.CASCADE)
    user_score = models.FloatField()
    peer_average = models.FloatField()
    percentile = models.FloatField()
    industry_average = models.FloatField(null=True, blank=True)
    comparison_date = models.DateField(auto_now_add=True)
    total_peers = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-comparison_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.skill_set.name} Comparison"