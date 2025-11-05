from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (SkillCategoryViewSet, SkillSetViewSet, 
                    SkillAssessmentViewSet, UserSkillBadgeViewSet)

router = DefaultRouter()
router.register(r'categories', SkillCategoryViewSet, basename='skill-category')
router.register(r'skill-sets', SkillSetViewSet, basename='skill-set')
router.register(r'assessments', SkillAssessmentViewSet, basename='skill-assessment')
router.register(r'badges', UserSkillBadgeViewSet, basename='skill-badge')

urlpatterns = [
    path('', include(router.urls)),
]