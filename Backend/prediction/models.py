from django.db import models
from django.contrib.auth.models import User
import json
from datetime import datetime, timedelta

# Create your models here.
class UserModel(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    email = models.EmailField(max_length=100,unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    EXPERIENCE_LEVELS = [
        ('student', 'Student'),
        ('junior', 'Junior (0-2 years)'),
        ('mid', 'Mid-level (2-5 years)'),
        ('senior', 'Senior (5+ years)'),
    ]
    
    user = models.OneToOneField(UserModel, on_delete=models.CASCADE, related_name='profile')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default='student')
    skills = models.JSONField(default=dict)  # Store skill ratings
    preferences = models.JSONField(default=dict)  # Store user preferences
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - {self.experience_level}"

class QuizSession(models.Model):
    SESSION_TYPES = [
        ('standard', 'Standard Quiz'),
        ('adaptive', 'Adaptive Quiz'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='quiz_sessions')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, default='standard')
    responses = models.JSONField(default=dict)  # Store all responses
    predicted_role = models.CharField(max_length=100, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    feature_importance = models.JSONField(default=dict)  # Store feature importance scores
    counterfactual_tips = models.JSONField(default=list)  # Store counterfactual suggestions
    calibration_data = models.JSONField(default=dict)  # Store calibration plot data
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.session_type} - {self.created_at.strftime('%Y-%m-%d')}"

class AdaptiveQuizQuestion(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('rating', 'Rating Scale'),
        ('boolean', 'Yes/No'),
    ]
    
    question_id = models.CharField(max_length=50, unique=True)
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    options = models.JSONField(default=list)  # For multiple choice questions
    difficulty_level = models.FloatField(default=0.0)  # IRT difficulty parameter
    discrimination = models.FloatField(default=1.0)  # IRT discrimination parameter
    experience_level = models.CharField(max_length=20, blank=True)  # Target experience level
    category = models.CharField(max_length=100)  # Question category (technical, interests, etc.)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.question_id}: {self.question_text[:50]}..."

class ABTestVariant(models.Model):
    question = models.ForeignKey(AdaptiveQuizQuestion, on_delete=models.CASCADE, related_name='variants')
    variant_name = models.CharField(max_length=50)
    question_text = models.TextField()
    options = models.JSONField(default=list)
    weight = models.FloatField(default=1.0)  # For weighted random selection
    performance_score = models.FloatField(default=0.0)  # Track performance metrics
    
    def __str__(self):
        return f"{self.question.question_id} - {self.variant_name}"

class LearningPath(models.Model):
    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='learning_paths')
    target_role = models.CharField(max_length=100)
    current_role = models.CharField(max_length=100, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS)
    estimated_duration_weeks = models.IntegerField()
    roadmap = models.JSONField(default=list)  # List of learning milestones
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.name} - Path to {self.target_role}"

class LearningMilestone(models.Model):
    MILESTONE_TYPES = [
        ('course', 'Online Course'),
        ('project', 'Hands-on Project'),
        ('certification', 'Certification'),
        ('reading', 'Reading Material'),
        ('practice', 'Practice Exercise'),
    ]
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    milestone_type = models.CharField(max_length=20, choices=MILESTONE_TYPES)
    order = models.IntegerField()
    estimated_hours = models.IntegerField()
    resources = models.JSONField(default=list)  # Links, materials, etc.
    prerequisites = models.JSONField(default=list)  # Required previous milestones
    skills_gained = models.JSONField(default=list)  # Skills this milestone teaches
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    progress_percentage = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.learning_path.target_role} - {self.title}"

class MilestoneProgress(models.Model):
    milestone = models.ForeignKey(LearningMilestone, on_delete=models.CASCADE, related_name='progress_logs')
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    progress_notes = models.TextField(blank=True)
    time_spent_minutes = models.IntegerField(default=0)
    completion_percentage = models.IntegerField(default=0)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.milestone.title} - {self.completion_percentage}%"

class SkillAssessment(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='skill_assessments')
    skill_name = models.CharField(max_length=100)
    assessment_type = models.CharField(max_length=50)  # 'quiz', 'project', 'peer_review'
    score = models.FloatField()
    max_score = models.FloatField()
    assessment_data = models.JSONField(default=dict)  # Store detailed assessment results
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.skill_name}: {self.score}/{self.max_score}"

class UserReminder(models.Model):
    REMINDER_TYPES = [
        ('milestone_due', 'Milestone Due'),
        ('learning_streak', 'Learning Streak'),
        ('skill_practice', 'Skill Practice'),
        ('assessment_available', 'Assessment Available'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=30, choices=REMINDER_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_object_id = models.IntegerField(null=True, blank=True)  # ID of related milestone, assessment, etc.
    scheduled_for = models.DateTimeField()
    sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"
    