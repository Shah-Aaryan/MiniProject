# adaptive_quiz/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import json

class QuizCategory(models.Model):
    """Categories for organizing quizzes"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    difficulty_level = models.IntegerField(
        default=1, 
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Quiz Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Question(models.Model):
    """Individual quiz questions"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert')
    ]
    
    category = models.ForeignKey(
        QuizCategory, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    points = models.IntegerField(default=10)
    time_limit = models.IntegerField(default=60, help_text="Time in seconds")
    skill_tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['category', 'difficulty']
    
    def __str__(self):
        return f"{self.question_text[:50]}... ({self.difficulty})"


class QuestionOption(models.Model):
    """Answer options for questions"""
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name='options'
    )
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.option_text[:30]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class AdaptiveQuiz(models.Model):
    """Main adaptive quiz instance"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='adaptive_quizzes'
    )
    category = models.ForeignKey(QuizCategory, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    current_difficulty = models.CharField(max_length=10, default='easy')
    total_score = models.IntegerField(default=0)
    max_possible_score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    time_taken = models.IntegerField(default=0, help_text="Total time in seconds")
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = "Adaptive Quiz"
        verbose_name_plural = "Adaptive Quizzes"
    
    def __str__(self):
        return f"{self.user.username} - {self.category.name} ({self.started_at.date()})"
    
    def calculate_accuracy(self):
        """Calculate quiz accuracy percentage"""
        if self.total_questions == 0:
            return 0
        return round((self.correct_answers / self.total_questions) * 100, 2)
    
    def calculate_score_percentage(self):
        """Calculate score percentage"""
        if self.max_possible_score == 0:
            return 0
        return round((self.total_score / self.max_possible_score) * 100, 2)


class QuizAttempt(models.Model):
    """Individual question attempts in a quiz"""
    quiz = models.ForeignKey(
        AdaptiveQuiz, 
        on_delete=models.CASCADE, 
        related_name='attempts'
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(
        QuestionOption, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)
    time_taken = models.IntegerField(help_text="Time in seconds")
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['answered_at']
    
    def __str__(self):
        return f"{self.quiz.user.username} - Q{self.question.id} - {'✓' if self.is_correct else '✗'}"


class UserSkillProfile(models.Model):
    """User's skill profile based on quiz performance"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='skill_profile'
    )
    skill_data = models.JSONField(
        default=dict, 
        help_text="Stores skill levels dynamically as JSON"
    )
    total_quizzes_taken = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "User Skill Profile"
        verbose_name_plural = "User Skill Profiles"
    
    def __str__(self):
        return f"{self.user.username} - Skill Profile"
    
    def update_skill(self, skill_name, performance):
        """
        Update skill level based on quiz performance
        Performance should be a value between 0-100
        """
        if not isinstance(self.skill_data, dict):
            self.skill_data = {}
        
        if skill_name not in self.skill_data:
            self.skill_data[skill_name] = {
                'level': 0, 
                'attempts': 0,
                'last_score': 0
            }
        
        current_level = self.skill_data[skill_name]['level']
        attempts = self.skill_data[skill_name]['attempts'] + 1
        
        # Adaptive learning algorithm - weighted average
        new_level = (current_level * (attempts - 1) + performance) / attempts
        
        self.skill_data[skill_name] = {
            'level': round(new_level, 2),
            'attempts': attempts,
            'last_score': performance
        }
        self.save()
    
    def get_top_skills(self, limit=5):
        """Get user's top skills by level"""
        if not self.skill_data:
            return []
        
        sorted_skills = sorted(
            self.skill_data.items(), 
            key=lambda x: x[1].get('level', 0), 
            reverse=True
        )
        return sorted_skills[:limit]
    
    def get_weak_skills(self, threshold=40, limit=5):
        """Get skills below threshold that need improvement"""
        if not self.skill_data:
            return []
        
        weak_skills = [
            (skill, data) for skill, data in self.skill_data.items()
            if data.get('level', 0) < threshold
        ]
        return sorted(weak_skills, key=lambda x: x[1].get('level', 0))[:limit]