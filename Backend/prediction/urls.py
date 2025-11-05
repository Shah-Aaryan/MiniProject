from django.urls import path
from .views import (
    PredictionView, SentimentAnalysisView, SignUpView, SignInView, UserDetailsView,
    AdaptiveQuizView, LearningPathView, MilestoneProgressView, UserProfileView, ReminderView,
    AIExplanationsView
)
from .views_advanced import (
    ProjectTemplatesView, UserProjectsView, AssessmentsView, UserAssessmentsView,
    LaborMarketView, SkillGapAnalysisView, JobBoardView, TailoredResumeView,
    ResumeBuilderView, STARRewriteView, AnalyticsDashboardView
)

urlpatterns = [
    # Authentication
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/signin/', SignInView.as_view(), name='signin'),
    
    # Original features
    path('get/quiz/', PredictionView.as_view(), name='predict'),
    path('get/sentiment/', SentimentAnalysisView.as_view(), name='get_sentiment'),
    path('get/user/', UserDetailsView.as_view(), name='user'),
    
    # Advanced features
    path('adaptive-quiz/', AdaptiveQuizView.as_view(), name='adaptive_quiz'),
    path('learning-path/', LearningPathView.as_view(), name='learning_path'),
    # Aliases as requested
    path('quiz/', PredictionView.as_view(), name='quiz'),
    path('learning-paths/', LearningPathView.as_view(), name='learning_paths'),
    path('ai-explanations/', AIExplanationsView.as_view(), name='ai_explanations'),
    path('portfolio/', UserProjectsView.as_view(), name='portfolio'),
    path('skill-assessments/', AssessmentsView.as_view(), name='skill_assessments'),
    path('labor-insights/', LaborMarketView.as_view(), name='labor_insights'),
    path('user/', UserProfileView.as_view(), name='user_profile_alias'),
    path('milestone-progress/', MilestoneProgressView.as_view(), name='milestone_progress'),
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('reminders/', ReminderView.as_view(), name='reminders'),
    
    # Portfolio & Projects
    path('project-templates/', ProjectTemplatesView.as_view(), name='project_templates'),
    path('user-projects/', UserProjectsView.as_view(), name='user_projects'),
    
    # Skill Assessments
    path('assessments/', AssessmentsView.as_view(), name='assessments'),
    path('user-assessments/', UserAssessmentsView.as_view(), name='user_assessments'),
    
    # Labor Market Intelligence
    path('labor-market/', LaborMarketView.as_view(), name='labor_market'),
    path('skill-gap-analysis/', SkillGapAnalysisView.as_view(), name='skill_gap_analysis'),
    
    # Job Board
    path('job-board/', JobBoardView.as_view(), name='job_board'),
    path('tailored-resume/', TailoredResumeView.as_view(), name='tailored_resume'),
    
    # Resume Builder
    path('resume-builder/', ResumeBuilderView.as_view(), name='resume_builder'),
    path('star-rewrite/', STARRewriteView.as_view(), name='star_rewrite'),
    
    # Analytics Dashboard
    path('analytics/', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
]
