# ========================================
# PORTFOLIO - views.py (PART 1)
# ========================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg
from .models import *
from .serializers import *

class PortfolioTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PortfolioTemplate.objects.filter(is_active=True)
    serializer_class = PortfolioTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        template_type = self.request.query_params.get('type')
        if template_type:
            queryset = queryset.filter(template_type=template_type)
        return queryset

class PortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'public_view']:
            return PortfolioDetailSerializer
        return PortfolioSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_view(self, request):
        slug = request.query_params.get('slug')
        if not slug:
            return Response({'error': 'Slug required'}, status=400)
        
        portfolio = get_object_or_404(Portfolio, slug=slug, is_public=True)
        portfolio.view_count += 1
        portfolio.save()
        
        # Track analytics
        self._track_analytics(portfolio, request)
        
        serializer = PortfolioDetailSerializer(portfolio)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        portfolio = self.get_object()
        portfolio.pk = None
        portfolio.slug = None
        portfolio.title = f"{portfolio.title} (Copy)"
        portfolio.save()
        
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data, status=201)
    
    @action(detail=True, methods=['patch'])
    def update_personal_info(self, request, pk=None):
        portfolio = self.get_object()
        info, _ = PersonalInfo.objects.get_or_create(portfolio=portfolio)
        serializer = PersonalInfoSerializer(info, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_social_link(self, request, pk=None):
        portfolio = self.get_object()
        serializer = SocialLinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_project(self, request, pk=None):
        portfolio = self.get_object()
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_experience(self, request, pk=None):
        portfolio = self.get_object()
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_education(self, request, pk=None):
        portfolio = self.get_object()
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_skill(self, request, pk=None):
        portfolio = self.get_object()
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_certification(self, request, pk=None):
        portfolio = self.get_object()
        serializer = CertificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_testimonial(self, request, pk=None):
        portfolio = self.get_object()
        serializer = TestimonialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        portfolio = self.get_object()
        days = int(request.query_params.get('days', 30))
        
        analytics = portfolio.analytics.all()[:days]
        
        total_views = sum(a.page_views for a in analytics)
        total_visitors = sum(a.unique_visitors for a in analytics)
        avg_time = sum(a.avg_time_on_page for a in analytics) / len(analytics) if analytics else 0
        
        return Response({
            'total_views': total_views,
            'total_visitors': total_visitors,
            'avg_time_on_page': round(avg_time, 2),
            'daily_stats': [{
                'date': a.date,
                'views': a.page_views,
                'visitors': a.unique_visitors
            } for a in analytics]
        })
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def contact(self, request, pk=None):
        portfolio = get_object_or_404(Portfolio, slug=pk, is_public=True)
        serializer = ContactMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            ip = self._get_client_ip(request)
            serializer.save(portfolio=portfolio, ip_address=ip)
            return Response({'message': 'Message sent successfully'}, status=201)
        return Response(serializer.errors, status=400)
    
    def _track_analytics(self, portfolio, request):
        from datetime import date
        today = date.today()
        
        analytics, created = PortfolioAnalytics.objects.get_or_create(
            portfolio=portfolio,
            date=today
        )
        analytics.page_views += 1
        analytics.unique_visitors += 1
        analytics.save()
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

# Separate ViewSets for managing individual components
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(portfolio__user=self.request.user)

class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Experience.objects.filter(portfolio__user=self.request.user)

class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(portfolio__user=self.request.user)

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(portfolio__user=self.request.user)