from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (IndustryViewSet, JobRoleViewSet, SkillDemandViewSet,
                    CompanyInsightViewSet, 
                    EmergingRoleViewSet, CareerRecommendationViewSet)

router = DefaultRouter()
router.register(r'industries', IndustryViewSet, basename='industry')
router.register(r'job-roles', JobRoleViewSet, basename='job-role')
router.register(r'skill-demand', SkillDemandViewSet, basename='skill-demand')
router.register(r'companies', CompanyInsightViewSet, basename='company-insight')
#router.register(r'reports', JobMarketReportViewSet, basename='market-report')
router.register(r'emerging-roles', EmergingRoleViewSet, basename='emerging-role')
router.register(r'recommendations', CareerRecommendationViewSet, basename='career-recommendation')

urlpatterns = [
    path('', include(router.urls)),
]