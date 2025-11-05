from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, PortfolioTemplateViewSet

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'templates', PortfolioTemplateViewSet, basename='portfolio-template')

urlpatterns = [
    path('', include(router.urls)),
]
