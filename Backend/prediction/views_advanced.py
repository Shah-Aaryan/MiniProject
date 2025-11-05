"""
Advanced Features Views
Portfolio, Assessments, Job Board, Resume Builder, Mentor, Analytics
"""
import json
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone

from .models import (
    UserModel, ProjectTemplate, UserProject, Assessment, UserAssessment,
    Badge, UserBadge, JobTrend, SalaryBand, SkillGapAnalysis,
    JobListing, SavedJobSearch, SavedJob, TailoredResume,
    ResumeTemplate, UserResume, STARBullet, MentorProfile, MentorSession,
    MentorMatch, CommunityPost, PeerReview, OfficeHours,
    UserActivity, FunnelMetrics, ModelPerformance, ContentEffectiveness
)

from utils.portfolio_generator import PortfolioGenerator
from utils.resume_builder import ResumeBuilder
from utils.labor_market import LaborMarketIntelligence
from utils.assessment_engine import AssessmentEngine

# ============================================================================
# PORTFOLIO & PROJECT TEMPLATES
# ============================================================================

class ProjectTemplatesView(APIView):
    """Get project templates by role"""
    
    def get(self, request):
        role = request.query_params.get('role', '')
        
        try:
            if role:
                templates = ProjectTemplate.objects.filter(role=role)
            else:
                templates = ProjectTemplate.objects.all()[:50]
            
            data = [{
                'id': t.id,
                'role': t.role,
                'title': t.title,
                'description': t.description,
                'difficulty_level': t.difficulty_level,
                'estimated_hours': t.estimated_hours,
                'skills_required': t.skills_required if isinstance(t.skills_required, list) else [],
                'skills_taught': t.skills_taught if isinstance(t.skills_taught, list) else []
            } for t in templates]
            
            return Response({'templates': data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e), 'templates': []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProjectsView(APIView):
    """Manage user projects"""
    
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            projects = UserProject.objects.filter(user=user)
            
            data = [{
                'id': p.id,
                'title': p.title,
                'status': p.status,
                'progress_percentage': p.progress_percentage,
                'repository_url': p.repository_url,
                'deployment_url': p.deployment_url,
                'template': p.template.title if p.template else None
            } for p in projects]
            
            return Response({'projects': data}, status=status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create project from template"""
        user_id = request.data.get('user_id')
        template_id = request.data.get('template_id')
        
        if not user_id or not template_id:
            return Response({'error': 'User ID and Template ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            template = ProjectTemplate.objects.get(id=template_id)
            
            # Generate project from template
            generator = PortfolioGenerator()
            project_data = generator.generate_project_from_template(template.role, {
                'title': template.title,
                'description': template.description,
                'rubric': template.rubric
            })
            
            project = UserProject.objects.create(
                user=user,
                template=template,
                title=template.title,
                description=template.description,
                status='not_started'
            )
            
            # Track activity
            UserActivity.objects.create(
                user=user,
                activity_type='project_created',
                metadata={'project_id': project.id, 'template_id': template_id}
            )
            
            return Response({
                'project': {
                    'id': project.id,
                    'title': project.title,
                    'readme_template': project_data['readme_template'],
                    'starter_code': project_data['starter_code'],
                    'deployment_links': project_data['deployment_links']
                }
            }, status=status.HTTP_201_CREATED)
        except (UserModel.DoesNotExist, ProjectTemplate.DoesNotExist):
            return Response({'error': 'User or Template not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================================================
# SKILL ASSESSMENTS
# ============================================================================

class AssessmentsView(APIView):
    """Get available assessments"""
    
    def get(self, request):
        try:
            skill = request.query_params.get('skill', '')
            assessment_type = request.query_params.get('type', '')
            
            assessments = Assessment.objects.all()
            
            if skill:
                assessments = assessments.filter(skill_tested=skill)
            if assessment_type:
                assessments = assessments.filter(assessment_type=assessment_type)
            
            data = [{
                'id': a.id,
                'title': a.title,
                'description': a.description,
                'assessment_type': a.assessment_type,
                'skill_tested': a.skill_tested,
                'duration_minutes': a.duration_minutes,
                'passing_score': a.passing_score,
                'badge_name': a.badge_name
            } for a in assessments[:50]]
            
            return Response({'assessments': data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e), 'assessments': []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserAssessmentsView(APIView):
    """Manage user assessments"""
    
    def post(self, request):
        """Start assessment"""
        user_id = request.data.get('user_id')
        assessment_id = request.data.get('assessment_id')
        
        if not user_id or not assessment_id:
            return Response({'error': 'User ID and Assessment ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            assessment = Assessment.objects.get(id=assessment_id)
            
            user_assessment, created = UserAssessment.objects.get_or_create(
                user=user,
                assessment=assessment,
                defaults={
                    'status': 'in_progress',
                    'started_at': timezone.now()
                }
            )
            
            if not created:
                return Response({'error': 'Assessment already started'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Track activity
            UserActivity.objects.create(
                user=user,
                activity_type='assessment_started',
                metadata={'assessment_id': assessment_id}
            )
            
            return Response({
                'user_assessment_id': user_assessment.id,
                'questions': assessment.questions,
                'duration_minutes': assessment.duration_minutes,
                'started_at': user_assessment.started_at.isoformat() if user_assessment.started_at else None
            }, status=status.HTTP_201_CREATED)
        except (UserModel.DoesNotExist, Assessment.DoesNotExist):
            return Response({'error': 'User or Assessment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        """Submit assessment"""
        user_assessment_id = request.data.get('user_assessment_id')
        answers = request.data.get('answers', {})
        time_spent_minutes = request.data.get('time_spent_minutes', 0)
        
        if not user_assessment_id or not answers:
            return Response({'error': 'Assessment ID and answers required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_assessment = UserAssessment.objects.get(id=user_assessment_id)
            assessment = user_assessment.assessment
            
            # Check plagiarism and LLM assist
            engine = AssessmentEngine()
            plagiarism_check = engine.check_plagiarism(str(answers))
            llm_check = engine.detect_llm_assist(str(answers))
            
            # Grade assessment
            correct_answers = {q['id']: q.get('correct_answer') for q in assessment.questions if 'correct_answer' in q}
            grade_result = engine.grade_assessment(answers, correct_answers, assessment.assessment_type)
            
            # Update user assessment
            user_assessment.answers = answers
            user_assessment.score = grade_result['total_score']
            user_assessment.max_score = grade_result['max_score']
            user_assessment.plagiarism_score = plagiarism_check['plagiarism_score']
            user_assessment.llm_assist_detected = llm_check['llm_assist_detected']
            user_assessment.time_spent_minutes = time_spent_minutes
            user_assessment.submitted_at = timezone.now()
            user_assessment.status = 'passed' if grade_result['passed'] else 'failed'
            
            # Award badge if passed
            if grade_result['passed'] and assessment.badge_name:
                badge, _ = Badge.objects.get_or_create(name=assessment.badge_name)
                UserBadge.objects.get_or_create(user=user_assessment.user, badge=badge)
                user_assessment.badge_earned = True
            
            user_assessment.save()
            
            # Track activity
            UserActivity.objects.create(
                user=user_assessment.user,
                activity_type='assessment_completed',
                metadata={
                    'assessment_id': assessment.id,
                    'score': grade_result['percentage_score'],
                    'passed': grade_result['passed']
                }
            )
            
            return Response({
                'user_assessment': {
                    'id': user_assessment.id,
                    'score': user_assessment.score,
                    'max_score': user_assessment.max_score,
                    'percentage': grade_result['percentage_score'],
                    'grade': grade_result['grade'],
                    'passed': grade_result['passed'],
                    'badge_earned': user_assessment.badge_earned,
                    'plagiarism_check': plagiarism_check,
                    'llm_check': llm_check
                }
            }, status=status.HTTP_200_OK)
        except UserAssessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================================================
# LABOR MARKET INTELLIGENCE
# ============================================================================

class LaborMarketView(APIView):
    """Labor market intelligence"""
    
    def get(self, request):
        """Get job trends and salary bands"""
        role = request.query_params.get('role', '')
        region = request.query_params.get('region', 'US')
        experience_level = request.query_params.get('experience_level', 'mid')
        
        if not role:
            return Response({'error': 'Role required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            intelligence = LaborMarketIntelligence()
            
            # Get salary band
            salary_band_raw = intelligence.get_salary_band(role, region, experience_level)
            
            # Format salary band for frontend (convert salary_min/max to min/max)
            salary_band = {
                'min': salary_band_raw.get('salary_min', 0),
                'max': salary_band_raw.get('salary_max', 0),
                'median': salary_band_raw.get('salary_median', 0),
                'currency': salary_band_raw.get('currency', 'USD'),
                'region': salary_band_raw.get('region', region),
                'experience_level': salary_band_raw.get('experience_level', experience_level)
            }
            
            # Get job trends
            job_trends = intelligence.get_job_trends(role, region)
            
            # Format job trends as a list for frontend
            trends_list = []
            if isinstance(job_trends, dict):
                trends_list = [
                    f"Demand trend: {job_trends.get('trend_direction', 'stable')}",
                    f"Growth rate: {job_trends.get('growth_rate', 0)*100:.1f}% annually",
                    f"Hot skills: {', '.join(job_trends.get('hot_skills', [])[:3])}"
                ]
            
            return Response({
                'salary_band': salary_band,
                'job_trends': trends_list if trends_list else ['No trend data available for this role']
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e),
                'salary_band': {},
                'job_trends': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SkillGapAnalysisView(APIView):
    """Skill gap analysis"""
    
    def post(self, request):
        user_id = request.data.get('user_id')
        target_role = request.data.get('target_role')
        current_skills = request.data.get('current_skills', {})
        
        if not user_id or not target_role:
            return Response({'error': 'User ID and Target Role required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            
            intelligence = LaborMarketIntelligence()
            gap_analysis = intelligence.analyze_skill_gap(current_skills, target_role)
            
            # Save gap analysis
            saved_analysis, created = SkillGapAnalysis.objects.get_or_create(
                user=user,
                target_role=target_role,
                defaults={
                    'current_skills': current_skills,
                    'skill_gaps': gap_analysis['skill_gaps'],
                    'priority_skills': gap_analysis['priority_skills']
                }
            )
            
            if not created:
                saved_analysis.current_skills = current_skills
                saved_analysis.skill_gaps = gap_analysis['skill_gaps']
                saved_analysis.priority_skills = gap_analysis['priority_skills']
                saved_analysis.updated_at = timezone.now()
                saved_analysis.save()
            
            return Response({
                'gap_analysis': gap_analysis,
                'saved_analysis_id': saved_analysis.id
            }, status=status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================================================
# JOB BOARD INTEGRATION
# ============================================================================

class JobBoardView(APIView):
    """Job board with listings"""
    
    def get(self, request):
        """Get job listings"""
        role = request.query_params.get('role', '')
        location = request.query_params.get('location', '')
        experience_level = request.query_params.get('experience_level', '')
        remote = request.query_params.get('remote', '').lower() == 'true'
        
        listings = JobListing.objects.filter(is_active=True)
        
        if role:
            listings = listings.filter(role=role)
        if location:
            listings = listings.filter(location__icontains=location)
        if experience_level:
            listings = listings.filter(experience_level=experience_level)
        if remote:
            listings = listings.filter(remote_available=True)
        
        data = [{
            'id': j.id,
            'job_title': j.job_title,
            'company_name': j.company_name,
            'location': j.location,
            'remote_available': j.remote_available,
            'salary_min': j.salary_min,
            'salary_max': j.salary_max,
            'experience_level': j.experience_level,
            'skills_required': j.skills_required,
            'application_url': j.application_url,
            'posted_date': j.posted_date.isoformat()
        } for j in listings[:100]]
        
        return Response({'jobs': data}, status=status.HTTP_200_OK)

class TailoredResumeView(APIView):
    """Generate tailored resume for job"""
    
    def post(self, request):
        user_id = request.data.get('user_id')
        job_id = request.data.get('job_id')
        resume_content = request.data.get('resume_content', '')
        
        if not user_id or not job_id or not resume_content:
            return Response({'error': 'User ID, Job ID, and Resume Content required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            job = JobListing.objects.get(id=job_id)
            
            # Generate tailored resume
            builder = ResumeBuilder()
            tailored = builder.tailor_resume_for_job(resume_content, job.description, job.role)
            
            # Save tailored resume
            tailored_resume = TailoredResume.objects.create(
                user=user,
                job_listing=job,
                original_resume=resume_content,
                tailored_resume=tailored['tailored_resume'],
                changes_made=tailored['changes_made'],
                ats_score=tailored['tailored_ats_score']
            )
            
            return Response({
                'tailored_resume': {
                    'id': tailored_resume.id,
                    'tailored_content': tailored['tailored_resume'],
                    'original_ats_score': tailored['original_ats_score'],
                    'tailored_ats_score': tailored['tailored_ats_score'],
                    'improvement': tailored['improvement'],
                    'changes_made': tailored['changes_made']
                }
            }, status=status.HTTP_201_CREATED)
        except (UserModel.DoesNotExist, JobListing.DoesNotExist):
            return Response({'error': 'User or Job not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================================================
# RESUME BUILDER
# ============================================================================

class ResumeBuilderView(APIView):
    """Resume builder with STAR method and ATS scoring"""
    
    def post(self, request):
        """Build or update resume"""
        user_id = request.data.get('user_id')
        resume_data = request.data.get('resume_data', {})
        
        if not user_id:
            return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserModel.objects.get(id=user_id)
            template_id = resume_data.get('template_id', 1)  # Default template
            
            template = ResumeTemplate.objects.get(id=template_id)
            
            # Create or update resume
            resume, created = UserResume.objects.get_or_create(
                user=user,
                defaults={
                    'template': template,
                    'personal_info': resume_data.get('personal_info', {}),
                    'summary': resume_data.get('summary', ''),
                    'experience': resume_data.get('experience', []),
                    'education': resume_data.get('education', []),
                    'skills': resume_data.get('skills', []),
                    'projects': resume_data.get('projects', [])
                }
            )
            
            if not created:
                resume.personal_info = resume_data.get('personal_info', resume.personal_info)
                resume.summary = resume_data.get('summary', resume.summary)
                resume.experience = resume_data.get('experience', resume.experience)
                resume.education = resume_data.get('education', resume.education)
                resume.skills = resume_data.get('skills', resume.skills)
                resume.projects = resume_data.get('projects', resume.projects)
                resume.save()
            
            # Calculate ATS score
            builder = ResumeBuilder()
            resume_text = self._resume_to_text(resume)
            target_role = resume_data.get('target_role', 'Software Developer')
            ats_score = builder.calculate_ats_score(resume_text, target_role)
            
            resume.ats_score = ats_score['ats_score']
            resume.save()
            
            return Response({
                'resume': {
                    'id': resume.id,
                    'title': resume.title,
                    'ats_score': ats_score
                }
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except ResumeTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def _resume_to_text(self, resume):
        """Convert resume object to text"""
        text_parts = []
        
        if resume.personal_info:
            text_parts.append(str(resume.personal_info))
        
        if resume.summary:
            text_parts.append(resume.summary)
        
        if resume.experience:
            text_parts.append(str(resume.experience))
        
        if resume.skills:
            text_parts.append(str(resume.skills))
        
        return ' '.join(text_parts)

class STARRewriteView(APIView):
    """Rewrite bullets using STAR method"""
    
    def post(self, request):
        original_text = request.data.get('original_text', '')
        role_context = request.data.get('role_context', '')
        
        if not original_text:
            return Response({'error': 'Original text required'}, status=status.HTTP_400_BAD_REQUEST)
        
        builder = ResumeBuilder()
        star_result = builder.rewrite_with_star(original_text, role_context)
        
        return Response({
            'star_rewrite': star_result
        }, status=status.HTTP_200_OK)

# ============================================================================
# ANALYTICS DASHBOARD
# ============================================================================

class AnalyticsDashboardView(APIView):
    """Analytics dashboard with funnels and metrics"""
    
    def get(self, request):
        """Get analytics dashboard data"""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Funnel metrics
        funnel_data = self._get_funnel_metrics(start_date, days)
        
        # Model performance
        model_performance = self._get_model_performance()
        
        # Content effectiveness
        content_effectiveness = self._get_content_effectiveness(start_date)
        
        return Response({
            'funnel': funnel_data,
            'model_performance': model_performance,
            'content_effectiveness': content_effectiveness,
            'date_range': {
                'start': start_date.isoformat(),
                'end': timezone.now().isoformat(),
                'days': days
            }
        }, status=status.HTTP_200_OK)
    
    def _get_funnel_metrics(self, start_date, days):
        """Calculate funnel metrics"""
        activities = UserActivity.objects.filter(created_at__gte=start_date)
        
        quiz_starts = activities.filter(activity_type='quiz_started').count()
        quiz_completions = activities.filter(activity_type='quiz_completed').count()
        predictions = activities.filter(activity_type='prediction_viewed').count()
        learning_paths = activities.filter(activity_type='learning_path_created').count()
        job_applications = activities.filter(activity_type='job_applied').count()
        
        # Calculate conversion rates
        conversion_to_quiz_completion = (quiz_completions / quiz_starts * 100) if quiz_starts > 0 else 0
        conversion_to_prediction = (predictions / quiz_completions * 100) if quiz_completions > 0 else 0
        conversion_to_learning_path = (learning_paths / predictions * 100) if predictions > 0 else 0
        conversion_to_job_application = (job_applications / learning_paths * 100) if learning_paths > 0 else 0
        
        return {
            'quiz_starts': quiz_starts,
            'quiz_completions': quiz_completions,
            'predictions_generated': predictions,
            'learning_paths_created': learning_paths,
            'job_applications': job_applications,
            'conversion_rates': {
                'quiz_start_to_completion': round(conversion_to_quiz_completion, 2),
                'quiz_to_prediction': round(conversion_to_prediction, 2),
                'prediction_to_learning_path': round(conversion_to_learning_path, 2),
                'learning_path_to_application': round(conversion_to_job_application, 2)
            },
            'overall_conversion': round((job_applications / quiz_starts * 100) if quiz_starts > 0 else 0, 2)
        }
    
    def _get_model_performance(self):
        """Get model performance metrics"""
        performance = ModelPerformance.objects.all().order_by('-calculated_at').first()
        
        if performance:
            return {
                'cohort': performance.cohort_name,
                'total_predictions': performance.total_predictions,
                'accuracy': performance.accuracy_score,
                'precision': performance.precision_score,
                'recall': performance.recall_score,
                'f1_score': performance.f1_score,
                'avg_confidence': performance.avg_confidence,
                'user_feedback': performance.user_feedback_score
            }
        
        return {}
    
    def _get_content_effectiveness(self, start_date):
        """Get content effectiveness metrics"""
        effectiveness = ContentEffectiveness.objects.filter(updated_at__gte=start_date).order_by('-effectiveness_score')[:20]
        
        return [{
            'content_type': e.content_type,
            'content_id': e.content_id,
            'impressions': e.impressions,
            'completions': e.completions,
            'success_rate': e.success_rate,
            'user_satisfaction': e.user_satisfaction,
            'effectiveness_score': e.effectiveness_score
        } for e in effectiveness]
