from django.urls import path
from .views import (
    PredictionView, SentimentAnalysisView, SignUpView, SignInView, UserDetailsView,
    AdaptiveQuizView, LearningPathView, MilestoneProgressView, UserProfileView, ReminderView
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
    path('milestone-progress/', MilestoneProgressView.as_view(), name='milestone_progress'),
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('reminders/', ReminderView.as_view(), name='reminders'),
]
