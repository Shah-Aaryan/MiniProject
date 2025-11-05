from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from backend.views_auth import signup, signin

# --- Import viewsets from feature apps ---
from adaptive_quiz.views import AdaptiveQuizViewSet, QuizCategoryViewSet, UserSkillProfileViewSet
from portfolio.views import PortfolioViewSet, PortfolioTemplateViewSet
from skill_assessments.views import (
    SkillCategoryViewSet, SkillSetViewSet, 
    SkillAssessmentViewSet, UserSkillBadgeViewSet
)
from labor_market.views import (
    IndustryViewSet, JobRoleViewSet, SkillDemandViewSet,
    CompanyInsightViewSet, 
    EmergingRoleViewSet, CareerRecommendationViewSet
)

# --- Create API Router ---
router = DefaultRouter()

# Adaptive Quiz routes
router.register(r'adaptive-quiz/quizzes', AdaptiveQuizViewSet, basename='adaptive-quiz')
router.register(r'adaptive-quiz/categories', QuizCategoryViewSet, basename='quiz-category')
router.register(r'adaptive-quiz/skill-profiles', UserSkillProfileViewSet, basename='skill-profile')

# Portfolio routes
router.register(r'portfolio/portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'portfolio/templates', PortfolioTemplateViewSet, basename='portfolio-template')

# Skill Assessment routes
router.register(r'assessments/categories', SkillCategoryViewSet, basename='skill-category')
router.register(r'assessments/skill-sets', SkillSetViewSet, basename='skill-set')
router.register(r'assessments/assessments', SkillAssessmentViewSet, basename='skill-assessment')
router.register(r'assessments/badges', UserSkillBadgeViewSet, basename='skill-badge')

# Labor Market Intelligence routes
router.register(r'labor-market/industries', IndustryViewSet, basename='industry')
router.register(r'labor-market/job-roles', JobRoleViewSet, basename='job-role')
router.register(r'labor-market/skill-demand', SkillDemandViewSet, basename='skill-demand')
router.register(r'labor-market/companies', CompanyInsightViewSet, basename='company-insight')
#router.register(r'labor-market/reports', JobMarketReportViewSet, basename='market-report')
router.register(r'labor-market/emerging-roles', EmergingRoleViewSet, basename='emerging-role')
router.register(r'labor-market/recommendations', CareerRecommendationViewSet, basename='career-recommendation')

# --- URL Patterns ---
urlpatterns = [
    path('admin/', admin.site.urls),

    # DRF Router-based APIs
    path('api/', include(router.urls)),

    # Django REST Framework built-in auth
    path('api/auth/', include('rest_framework.urls')),

    # JSON auth endpoints
    path('api/signup/', signup, name='api-signup'),
    path('api/signin/', signin, name='api-signin'),

    # App-specific APIs
    path('api/', include('prediction.urls')),
    path('api/', include('chatapp.urls')),
    path('api/', include('voiceapp.urls')),
]

# --- Media file handling in DEBUG mode ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
