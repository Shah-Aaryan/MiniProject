# labor_market/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg, Count
from .models import *
from .serializers import *

class IndustryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def job_roles(self, request, pk=None):
        industry = self.get_object()
        roles = industry.job_roles.all()
        serializer = JobRoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        industries = self.queryset.order_by('-growth_rate')[:10]
        serializer = self.get_serializer(industries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def sub_industries(self, request, pk=None):
        industry = self.get_object()
        subs = industry.sub_industries.all()
        serializer = self.get_serializer(subs, many=True)
        return Response(serializer.data)

class JobRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        industry = self.request.query_params.get('industry')
        search = self.request.query_params.get('search')
        experience = self.request.query_params.get('experience')
        remote = self.request.query_params.get('remote')
        
        if industry:
            queryset = queryset.filter(industry_id=industry)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        if experience:
            queryset = queryset.filter(experience_level=experience)
        if remote == 'true':
            queryset = queryset.filter(remote_friendly=True)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def salary_insights(self, request, pk=None):
        job_role = self.get_object()
        location = request.query_params.get('location')
        experience = request.query_params.get('experience')
        
        salary_query = job_role.salary_data.all()
        
        if location:
            salary_query = salary_query.filter(
                Q(city__icontains=location) | 
                Q(state__icontains=location)
            )
        if experience:
            salary_query = salary_query.filter(experience_level=experience)
        
        if salary_query.exists():
            stats = {
                'min_salary': float(salary_query.order_by('min_salary').first().min_salary),
                'max_salary': float(salary_query.order_by('-max_salary').first().max_salary),
                'avg_median': float(salary_query.aggregate(avg=Avg('median_salary'))['avg']),
                'data': SalaryDataSerializer(salary_query, many=True).data
            }
        else:
            stats = {'message': 'No salary data available', 'data': []}
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def market_trends(self, request, pk=None):
        job_role = self.get_object()
        trends = job_role.market_trends.all()[:12]
        serializer = JobMarketTrendSerializer(trends, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def required_skills(self, request, pk=None):
        job_role = self.get_object()
        return Response({
            'required_skills': job_role.required_skills,
            'preferred_skills': job_role.preferred_skills,
            'education_requirements': job_role.education_requirements
        })
    
    @action(detail=False, methods=['get'])
    def popular_roles(self, request):
        # Get roles with most salary data entries (indicator of popularity)
        roles = JobRole.objects.annotate(
            salary_count=Count('salary_data')
        ).order_by('-salary_count')[:20]
        
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)

class SkillDemandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillDemand.objects.all()
    serializer_class = SkillDemandSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def trending_skills(self, request):
        region = request.query_params.get('region')
        category = request.query_params.get('category')
        
        queryset = self.queryset
        if region:
            queryset = queryset.filter(region=region)
        if category:
            queryset = queryset.filter(category=category)
        
        skills = queryset.order_by('trending_rank')[:20]
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def fastest_growing(self, request):
        skills = self.queryset.order_by('-growth_rate')[:15]
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_paying(self, request):
        skills = self.queryset.order_by('-avg_salary_premium')[:15]
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        categories = self.queryset.values('category').annotate(
            skill_count=Count('id'),
            avg_growth=Avg('growth_rate')
        ).order_by('-skill_count')
        
        return Response(list(categories))

class CompanyInsightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompanyInsight.objects.all()
    serializer_class = CompanyInsightSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        industry = self.request.query_params.get('industry')
        location = self.request.query_params.get('location')
        size = self.request.query_params.get('size')
        hiring = self.request.query_params.get('hiring')
        
        if industry:
            queryset = queryset.filter(industry_id=industry)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if size:
            queryset = queryset.filter(company_size=size)
        if hiring == 'active':
            queryset = queryset.filter(active_job_openings__gt=0)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def top_hiring(self, request):
        companies = self.queryset.order_by('-active_job_openings')[:20]
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        location = request.query_params.get('location')
        if not location:
            return Response({'error': 'Location parameter required'}, status=400)
        
        companies = self.queryset.filter(location__icontains=location)
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)

class EmergingRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmergingRole.objects.all()
    serializer_class = EmergingRoleSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def top_emerging(self, request):
        industry = request.query_params.get('industry')
        
        queryset = self.queryset
        if industry:
            queryset = queryset.filter(industry_id=industry)
        
        roles = queryset.order_by('-emergence_score')[:15]
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def highest_growth(self, request):
        roles = self.queryset.order_by('-growth_projection')[:15]
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)

class CareerRecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = CareerPathRecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Allow unauthenticated access to market_insights and skill_gap_analysis
        """
        if self.action in ['market_insights', 'skill_gap_analysis']:
            return [AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        return CareerPathRecommendation.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_recommendations(self, request):
        user = request.user
        current_role_id = request.data.get('current_role_id')
        user_skills = request.data.get('skills', [])
        target_salary = request.data.get('target_salary')
        preferred_location = request.data.get('preferred_location')
        
        try:
            current_role = JobRole.objects.get(id=current_role_id) if current_role_id else None
        except JobRole.DoesNotExist:
            return Response({'error': 'Current role not found'}, status=404)
        
        recommendations = self._generate_recommendations(
            user, current_role, user_skills, target_salary, preferred_location
        )
        
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def market_insights(self, request):
        trending_skills = SkillDemand.objects.order_by('trending_rank')[:10]
        emerging_roles = EmergingRole.objects.order_by('-emergence_score')[:10]
        growing_industries = Industry.objects.order_by('-growth_rate')[:10]
        top_companies = CompanyInsight.objects.order_by('-active_job_openings')[:10]
        
        return Response({
            'trending_skills': SkillDemandSerializer(trending_skills, many=True).data,
            'emerging_roles': EmergingRoleSerializer(emerging_roles, many=True).data,
            'growing_industries': IndustrySerializer(growing_industries, many=True).data,
            'top_hiring_companies': CompanyInsightSerializer(top_companies, many=True).data
        })
    
    @action(detail=False, methods=['post'])
    def skill_gap_analysis(self, request):
        target_role_id = request.data.get('target_role_id')
        user_skills = request.data.get('current_skills', [])
        
        try:
            target_role = JobRole.objects.get(id=target_role_id)
        except JobRole.DoesNotExist:
            return Response({'error': 'Target role not found'}, status=404)
        
        required_skills = set(target_role.required_skills)
        user_skill_set = set(user_skills)
        
        missing_skills = list(required_skills - user_skill_set)
        matching_skills = list(required_skills.intersection(user_skill_set))
        
        gap_percentage = (len(missing_skills) / len(required_skills)) * 100 if required_skills else 0
        
        return Response({
            'target_role': target_role.title,
            'missing_skills': missing_skills,
            'matching_skills': matching_skills,
            'gap_percentage': round(gap_percentage, 2),
            'estimated_time': self._estimate_transition_time(gap_percentage),
            'recommended_actions': self._get_recommended_actions(missing_skills)
        })
    
    def _generate_recommendations(self, user, current_role, user_skills, target_salary, location):
        recommendations = []
        
        if current_role:
            similar_roles = JobRole.objects.filter(
                industry=current_role.industry
            ).exclude(id=current_role.id)
        else:
            similar_roles = JobRole.objects.all()
        
        if location:
            # Filter by roles available in preferred location
            similar_roles = similar_roles.filter(
                Q(salary_data__city__icontains=location) |
                Q(salary_data__state__icontains=location)
            ).distinct()
        
        for role in similar_roles[:20]:
            match_score = self._calculate_match_score(role, user_skills)
            skill_gap = self._calculate_skill_gap(role, user_skills)
            
            recommendation = CareerPathRecommendation.objects.create(
                user=user,
                current_role=current_role,
                recommended_role=role,
                match_score=match_score,
                skill_gap_analysis=skill_gap,
                estimated_transition_time=self._estimate_transition_time(
                    skill_gap.get('gap_percentage', 0)
                ),
                salary_potential=self._get_salary_potential(role, location),
                market_demand_score=self._calculate_demand_score(role),
                reasoning=self._generate_reasoning(match_score, skill_gap, role),
                recommended_courses=self._get_recommended_courses(skill_gap)
            )
            recommendations.append(recommendation)
        
        return sorted(recommendations, key=lambda x: x.match_score, reverse=True)[:10]
    
    def _calculate_match_score(self, role, user_skills):
        required_skills = set(role.required_skills)
        user_skill_set = set(user_skills)
        
        if not required_skills:
            return 50.0
        
        matching_skills = required_skills.intersection(user_skill_set)
        match_percentage = (len(matching_skills) / len(required_skills)) * 100
        
        return round(match_percentage, 2)
    
    def _calculate_skill_gap(self, role, user_skills):
        required_skills = set(role.required_skills)
        user_skill_set = set(user_skills)
        
        missing_skills = list(required_skills - user_skill_set)
        matching_skills = list(required_skills.intersection(user_skill_set))
        
        gap_percentage = (len(missing_skills) / len(required_skills)) * 100 if required_skills else 0
        
        return {
            'missing_skills': missing_skills,
            'matching_skills': matching_skills,
            'gap_percentage': round(gap_percentage, 2)
        }
    
    def _estimate_transition_time(self, gap_percentage):
        if gap_percentage < 20:
            return "1-3 months"
        elif gap_percentage < 40:
            return "3-6 months"
        elif gap_percentage < 60:
            return "6-12 months"
        else:
            return "12+ months"
    
    def _get_salary_potential(self, role, location):
        salary_data = role.salary_data.all()
        if location:
            salary_data = salary_data.filter(
                Q(city__icontains=location) | Q(state__icontains=location)
            )
        
        if salary_data.exists():
            avg_salary = salary_data.aggregate(avg=Avg('median_salary'))['avg']
            return f"${avg_salary:,.0f} average"
        return "Data not available"
    
    def _calculate_demand_score(self, role):
        # Simple demand score based on salary data entries
        salary_count = role.salary_data.count()
        return min(100, salary_count * 5)
    
    def _generate_reasoning(self, match_score, skill_gap, role):
        if match_score >= 80:
            return f"Excellent match! You have {match_score}% of required skills for {role.title}."
        elif match_score >= 60:
            return f"Good match with {match_score}% skills alignment. Focus on {len(skill_gap['missing_skills'])} missing skills."
        else:
            return f"Potential career path requiring skill development in {len(skill_gap['missing_skills'])} areas."
    
    def _get_recommended_courses(self, skill_gap):
        # Placeholder for course recommendations
        courses = []
        for skill in skill_gap['missing_skills'][:3]:
            courses.append({
                'skill': skill,
                'course_suggestion': f"Online courses for {skill}",
                'platforms': ['Coursera', 'Udemy', 'LinkedIn Learning']
            })
        return courses
    
    def _get_recommended_actions(self, missing_skills):
        actions = []
        for skill in missing_skills[:5]:
            actions.append({
                'skill': skill,
                'action': f"Learn {skill}",
                'priority': 'High' if missing_skills.index(skill) < 3 else 'Medium',
                'resources': ['Online courses', 'Practice projects', 'Certifications']
            })
        return actions