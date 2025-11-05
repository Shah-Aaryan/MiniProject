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

# ============================================================================
# PORTFOLIO & PROJECT TEMPLATES
# ============================================================================

class ProjectTemplate(models.Model):
    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    role = models.CharField(max_length=100)  # Target career role
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS)
    estimated_hours = models.IntegerField()
    skills_required = models.JSONField(default=list)  # List of required skills
    skills_taught = models.JSONField(default=list)  # Skills this project teaches
    rubric = models.JSONField(default=dict)  # Evaluation rubric
    project_structure = models.JSONField(default=list)  # Suggested folder structure
    starter_code = models.TextField(blank=True)  # Initial code template
    requirements_file = models.TextField(blank=True)  # Dependencies
    readme_template = models.TextField(blank=True)  # README scaffold
    deployment_links = models.JSONField(default=dict)  # Codesandbox, Render templates
    resources = models.JSONField(default=list)  # Helpful resources
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.role} - {self.title}"

class UserProject(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('reviewed', 'Reviewed'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='user_projects')
    template = models.ForeignKey(ProjectTemplate, on_delete=models.CASCADE, related_name='user_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    repository_url = models.URLField(blank=True)
    deployment_url = models.URLField(blank=True)
    code_sandbox_url = models.URLField(blank=True)
    progress_percentage = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    rubric_scores = models.JSONField(default=dict)  # Scores from rubric evaluation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"

# ============================================================================
# SKILL ASSESSMENTS
# ============================================================================

class Assessment(models.Model):
    ASSESSMENT_TYPES = [
        ('mcq', 'Multiple Choice Questions'),
        ('coding', 'Coding Challenge'),
        ('mixed', 'Mixed (MCQ + Coding)'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    skill_tested = models.CharField(max_length=100)
    duration_minutes = models.IntegerField()  # Time limit
    questions = models.JSONField(default=list)  # Questions with answers
    passing_score = models.IntegerField(default=70)  # Percentage
    badge_name = models.CharField(max_length=100, blank=True)  # Badge earned on completion
    certificate_template = models.JSONField(default=dict)  # Certificate data
    plagiarism_detection = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.skill_tested}"

class UserAssessment(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='user_assessments')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='user_assessments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    score = models.FloatField(null=True, blank=True)
    max_score = models.FloatField(null=True, blank=True)
    answers = models.JSONField(default=dict)  # User's answers
    plagiarism_score = models.FloatField(null=True, blank=True)  # Plagiarism detection score
    llm_assist_detected = models.BooleanField(default=False)
    time_spent_minutes = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    badge_earned = models.BooleanField(default=False)
    certificate_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.assessment.title}"

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon_url = models.URLField(blank=True)
    category = models.CharField(max_length=50)  # skill, project, assessment, etc.
    criteria = models.JSONField(default=dict)  # Requirements to earn badge
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(auto_now_add=True)
    shareable_certificate_url = models.URLField(blank=True)
    
    class Meta:
        unique_together = ['user', 'badge']
    
    def __str__(self):
        return f"{self.user.name} - {self.badge.name}"

# ============================================================================
# LABOR MARKET INTELLIGENCE
# ============================================================================

class JobTrend(models.Model):
    role = models.CharField(max_length=100)
    job_title = models.CharField(max_length=200)
    skills_required = models.JSONField(default=list)
    avg_salary_min = models.FloatField()
    avg_salary_max = models.FloatField()
    region = models.CharField(max_length=100)
    experience_level = models.CharField(max_length=50)
    demand_score = models.FloatField(default=0.0)  # 0-1 scale
    trend_direction = models.CharField(max_length=20)  # increasing, stable, decreasing
    data_source = models.CharField(max_length=100)  # Where data came from
    collected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-collected_at']
    
    def __str__(self):
        return f"{self.role} - {self.region} - {self.collected_at.strftime('%Y-%m-%d')}"

class SalaryBand(models.Model):
    role = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    experience_level = models.CharField(max_length=50)
    salary_min = models.FloatField()
    salary_median = models.FloatField()
    salary_max = models.FloatField()
    currency = models.CharField(max_length=10, default='USD')
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['role', 'region', 'experience_level']
    
    def __str__(self):
        return f"{self.role} - {self.region} - {self.experience_level}"

class SkillGapAnalysis(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='skill_gaps')
    target_role = models.CharField(max_length=100)
    current_skills = models.JSONField(default=dict)  # User's current skill levels
    required_skills = models.JSONField(default=dict)  # Required skills for target role
    skill_gaps = models.JSONField(default=dict)  # Gap analysis results
    priority_skills = models.JSONField(default=list)  # Skills to learn first
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.target_role} Gap Analysis"

# ============================================================================
# JOB BOARD INTEGRATION
# ============================================================================

class JobListing(models.Model):
    SOURCES = [
        ('indeed', 'Indeed'),
        ('linkedin', 'LinkedIn'),
        ('glassdoor', 'Glassdoor'),
        ('monster', 'Monster'),
        ('internal', 'Internal'),
    ]
    
    job_title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)  # Predicted role category
    location = models.CharField(max_length=200)
    remote_available = models.BooleanField(default=False)
    salary_min = models.FloatField(null=True, blank=True)
    salary_max = models.FloatField(null=True, blank=True)
    description = models.TextField()
    requirements = models.JSONField(default=list)  # Required skills, experience
    skills_required = models.JSONField(default=list)
    experience_level = models.CharField(max_length=50)
    job_type = models.CharField(max_length=50)  # full-time, part-time, contract
    application_url = models.URLField()
    source = models.CharField(max_length=20, choices=SOURCES)
    posted_date = models.DateTimeField()
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-posted_date']
    
    def __str__(self):
        return f"{self.job_title} - {self.company_name}"

class SavedJobSearch(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=200)
    filters = models.JSONField(default=dict)  # Role, location, salary, etc.
    email_alerts = models.BooleanField(default=True)
    frequency = models.CharField(max_length=20, default='daily')  # daily, weekly, etc.
    last_searched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.name}"

class SavedJob(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='saved_jobs')
    job_listing = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='saved_by_users')
    notes = models.TextField(blank=True)
    applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(null=True, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'job_listing']
    
    def __str__(self):
        return f"{self.user.name} - {self.job_listing.job_title}"

class TailoredResume(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='tailored_resumes')
    job_listing = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='tailored_resumes')
    original_resume = models.TextField()  # Original resume content
    tailored_resume = models.TextField()  # Tailored version
    changes_made = models.JSONField(default=list)  # List of changes
    ats_score = models.FloatField(null=True, blank=True)  # ATS compatibility score
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.job_listing.job_title}"

# ============================================================================
# RESUME/CV BUILDER
# ============================================================================

class ResumeTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    template_type = models.CharField(max_length=50)  # modern, classic, creative
    html_template = models.TextField()
    css_template = models.TextField()
    sections = models.JSONField(default=list)  # Available sections
    ats_friendly = models.BooleanField(default=True)
    preview_image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserResume(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='user_resumes')
    template = models.ForeignKey(ResumeTemplate, on_delete=models.CASCADE, related_name='user_resumes')
    title = models.CharField(max_length=200, default='My Resume')
    personal_info = models.JSONField(default=dict)  # Name, contact, etc.
    summary = models.TextField(blank=True)
    experience = models.JSONField(default=list)  # Work experience entries
    education = models.JSONField(default=list)  # Education entries
    skills = models.JSONField(default=list)  # Skills list
    projects = models.JSONField(default=list)  # Project entries
    certifications = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    custom_sections = models.JSONField(default=dict)
    ats_score = models.FloatField(null=True, blank=True)
    pdf_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"

class STARBullet(models.Model):
    user_resume = models.ForeignKey(UserResume, on_delete=models.CASCADE, related_name='star_bullets')
    original_text = models.TextField()
    star_text = models.TextField()  # Rewritten using STAR method
    situation = models.TextField(blank=True)
    task = models.TextField(blank=True)
    action = models.TextField(blank=True)
    result = models.TextField(blank=True)
    role_context = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user_resume.user.name} - STAR Bullet"

# ============================================================================
# MENTOR/COMMUNITY LAYER
# ============================================================================

class MentorProfile(models.Model):
    user = models.OneToOneField(UserModel, on_delete=models.CASCADE, related_name='mentor_profile')
    bio = models.TextField()
    expertise_areas = models.JSONField(default=list)  # Career roles
    years_experience = models.IntegerField()
    current_role = models.CharField(max_length=100)
    company = models.CharField(max_length=200, blank=True)
    region = models.CharField(max_length=100)
    availability_hours = models.JSONField(default=list)  # Available time slots
    hourly_rate = models.FloatField(null=True, blank=True)
    rating = models.FloatField(default=0.0)
    total_sessions = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - Mentor"

class MentorSession(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    mentee = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='mentee_sessions')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='mentor_sessions')
    topic = models.CharField(max_length=200)
    description = models.TextField()
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    meeting_link = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    rating = models.IntegerField(null=True, blank=True)  # 1-5
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.mentee.name} - {self.mentor.user.name} - {self.topic}"

class MentorMatch(models.Model):
    mentee = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='mentor_matches')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='mentee_matches')
    match_score = models.FloatField()  # Compatibility score
    match_reasons = models.JSONField(default=list)  # Why they were matched
    status = models.CharField(max_length=20, default='pending')  # pending, accepted, declined
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['mentee', 'mentor']
    
    def __str__(self):
        return f"{self.mentee.name} - {self.mentor.user.name}"

class CommunityPost(models.Model):
    POST_TYPES = [
        ('question', 'Question'),
        ('answer', 'Answer'),
        ('discussion', 'Discussion'),
        ('resource', 'Resource'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='community_posts')
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    tags = models.JSONField(default=list)
    category = models.CharField(max_length=100)  # career, technical, general
    parent_post = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    upvotes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)  # For questions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"

class PeerReview(models.Model):
    REVIEW_TYPES = [
        ('project', 'Project Review'),
        ('resume', 'Resume Review'),
        ('code', 'Code Review'),
    ]
    
    reviewer = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='reviews_received')
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPES)
    item_id = models.IntegerField()  # ID of project, resume, etc.
    rating = models.IntegerField()  # 1-5 stars
    feedback = models.TextField()
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.reviewer.name} reviews {self.reviewee.name}'s {self.review_type}"

class OfficeHours(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='office_hours')
    title = models.CharField(max_length=200)
    description = models.TextField()
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_participants = models.IntegerField(default=20)
    meeting_link = models.URLField(blank=True)
    participants = models.ManyToManyField(UserModel, related_name='office_hours_attending', blank=True)
    is_live = models.BooleanField(default=False)
    recording_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.mentor.user.name} - {self.title}"

# ============================================================================
# ANALYTICS DASHBOARD
# ============================================================================

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('quiz_started', 'Quiz Started'),
        ('quiz_completed', 'Quiz Completed'),
        ('prediction_viewed', 'Prediction Viewed'),
        ('learning_path_created', 'Learning Path Created'),
        ('milestone_completed', 'Milestone Completed'),
        ('job_applied', 'Job Applied'),
        ('assessment_started', 'Assessment Started'),
        ('assessment_completed', 'Assessment Completed'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    metadata = models.JSONField(default=dict)  # Additional context
    session_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.activity_type}"

class FunnelMetrics(models.Model):
    date = models.DateField()
    quiz_starts = models.IntegerField(default=0)
    quiz_completions = models.IntegerField(default=0)
    predictions_generated = models.IntegerField(default=0)
    learning_paths_created = models.IntegerField(default=0)
    job_applications = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Funnel Metrics - {self.date}"

class ModelPerformance(models.Model):
    cohort_name = models.CharField(max_length=100)  # e.g., "Q1_2024", "Students"
    total_predictions = models.IntegerField(default=0)
    accuracy_score = models.FloatField(null=True, blank=True)
    precision_score = models.FloatField(null=True, blank=True)
    recall_score = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    avg_confidence = models.FloatField(null=True, blank=True)
    user_feedback_score = models.FloatField(null=True, blank=True)
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Model Performance - {self.cohort_name}"

class ContentEffectiveness(models.Model):
    content_type = models.CharField(max_length=100)  # quiz_question, learning_milestone, etc.
    content_id = models.IntegerField()
    impressions = models.IntegerField(default=0)  # Times shown
    completions = models.IntegerField(default=0)  # Times completed
    success_rate = models.FloatField(default=0.0)  # Completion rate
    user_satisfaction = models.FloatField(default=0.0)
    outcomes_achieved = models.IntegerField(default=0)  # Positive outcomes
    effectiveness_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.content_type} #{self.content_id} - {self.effectiveness_score}"
    