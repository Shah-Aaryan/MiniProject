from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdaptiveQuizViewSet, QuizCategoryViewSet, UserSkillProfileViewSet

router = DefaultRouter()
router.register(r'quizzes', AdaptiveQuizViewSet, basename='adaptive-quiz')
router.register(r'categories', QuizCategoryViewSet, basename='quiz-category')
router.register(r'skill-profiles', UserSkillProfileViewSet, basename='skill-profile')

urlpatterns = [
    path('', include(router.urls)),
]
