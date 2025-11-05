#from django.shortcuts import render

# Create your views here.
import joblib
import os
import json
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .serializers import (
    PredictionSerializer, SignInSerializer, SignUpSerializer, UserSerializer,
    UserProfileSerializer, QuizSessionSerializer, AdaptiveQuizQuestionSerializer,
    LearningPathSerializer, LearningMilestoneSerializer, MilestoneProgressSerializer,
    ExplainableAIResponseSerializer, AdaptiveQuizResponseSerializer,
    LearningPathGenerationSerializer, MilestoneUpdateSerializer
)
from .models import (
    UserModel, UserProfile, QuizSession, AdaptiveQuizQuestion,
    LearningPath, LearningMilestone, MilestoneProgress, UserReminder
)

from utils.utility import predict_sentiment
from utils.explainable_ai import ExplainableAI
from utils.adaptive_quiz import AdaptiveQuizEngine
from utils.learning_path_generator import LearningPathGenerator

class AIExplanationsView(APIView):
    """Return explanation text for recommendations"""
    def post(self, request, *args, **kwargs):
        try:
            role = request.data.get('role') or request.data.get('predicted_role')
            responses = request.data.get('responses')  # optional list of numeric features
            if not role and not responses:
                return Response({'error': 'Provide role or responses for explanation'}, status=status.HTTP_400_BAD_REQUEST)

            explainer = ExplainableAI()

            # If responses provided, generate richer explanation blocks
            if isinstance(responses, list) and len(responses) >= 5:
                # Try to map role name to class for context (best-effort)
                importance = explainer.get_feature_importance(responses, explainer._get_role_class(role) or 0)
                counterfactual = explainer.generate_counterfactual_tips(responses, target_role=role)
                calibration = explainer.calculate_calibration_data(responses)

                return Response({
                    'explanation': {
                        'feature_importance': importance,
                        'counterfactual_tips': counterfactual,
                        'calibration': calibration
                    }
                }, status=status.HTTP_200_OK)

            # Fallback: role-only generic text
            role_text = role or 'the recommended role'
            text = (
                f"{role_text}: This role typically requires strong fundamentals, hands-on projects, and soft skills. "
                "We recommend building a portfolio of 2-3 targeted projects, strengthening core skills, and following a focused learning path."
            )
            return Response({'explanation': {'text': text}}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictionView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PredictionSerializer(data=request.data)
        if serializer.is_valid():
            # Load the model
            model_path = os.path.join(os.path.dirname(__file__), '../ml_models/dtmodel.pkl')
            model = joblib.load(model_path)

            # Extract and encode data
            data = [
                serializer.validated_data['question1'],
                serializer.validated_data['question2'],
                serializer.validated_data['question3'],
                serializer.validated_data['question4'],
                serializer.validated_data['question5'],
                serializer.validated_data['question6'],
                serializer.validated_data['question7'],
                serializer.validated_data['question8'],
                serializer.validated_data['question9'],
                serializer.validated_data['question10'],
                serializer.validated_data['question11'],
                serializer.validated_data['question12'],
                serializer.validated_data['question13'],
                serializer.validated_data['question14'],
                serializer.validated_data['question15'],
                serializer.validated_data['question16'],
                serializer.validated_data['question17'],
                serializer.validated_data['question18'],
                serializer.validated_data['question19'],
            ]

            # Encode categorical data (example encoding)
            encoding_question7 = {
                'R Programming': 0,
                'Information Security': 1,
                'Shell Programming': 2,
                'Machine Learning': 3,
                'Full Stack':4,
                'Hadoop':5,
                'Python':6,
                'Distro Making':7,
                'App Development':8

            }

            encoding_question8 = {
                'Database Security': 0,
                'System Designing': 1,
                'Web Technologies': 2,
                'Hacking': 3,
                'Testing': 4,
                'Data Science': 5,
                'Game Development': 6,
                'Cloud Computing': 7
            }


            try:
                encoded_data = [
                    int(data[0]),  # question1 - numeric
                    int(data[1]),  # question2 - numeric
                    int(data[2]),  # question3 - numeric
                    int(data[3]),  # question4 - numeric
                    int(data[4]),  # question5 - numeric
                    int(data[5]),  # question6 - numeric
                    encoding_question7[data[6]],  # question7 - categorical
                    encoding_question8[data[7]],  # question8 - categorical
                    int(data[8]),  # question9 - numeric
                    int(data[9]),  # question10 - numeric
                    int(data[10]), # question11 - numeric
                    int(data[11]), # question12 - numeric
                    int(data[12]), # question13 - numeric
                    int(data[13]), # question14 - numeric
                    int(data[14]), # question15 - numeric
                    int(data[15]), # question16 - numeric
                    int(data[16]), # question17 - numeric
                    int(data[17]), # question18 - numeric
                    int(data[18]), # question19 - numeric
                ]
            except (KeyError, ValueError) as e:
                return Response({
                    'error': f'Data encoding error: {str(e)}',
                    'message': 'Please check your quiz answers and try again.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Make prediction
            prediction = model.predict([encoded_data])

            # Get the probability
            prediction_probability = model.predict_proba([encoded_data])

            # Get the probability of the predicted class
            predicted_class = prediction[0]
            predicted_proba = prediction_probability[0][predicted_class]

            # Map numeric prediction to actual job role name
            job_role_mapping = {
                0: 'Applications Developer',
                1: 'CRM Technical Developer', 
                2: 'Database Developer',
                3: 'Mobile Applications Developer',
                4: 'Network Security Engineer',
                5: 'Software Developer',
                6: 'Software Engineer',
                7: 'Software Quality Assurance (QA) / Testing',
                8: 'Systems Security Administrator',
                9: 'Technical Support',
                10: 'UX Designer',
                11: 'Web Developer'
            }

            # Get the actual job role name
            predicted_role = job_role_mapping.get(predicted_class, 'Unknown Role')
            
            # Calculate confidence percentage
            confidence_percentage = round(predicted_proba * 100, 2)

            # Enhanced response with explainable AI features
            explainable_ai = ExplainableAI()
            
            # Get feature importance
            feature_importance = explainable_ai.get_feature_importance(encoded_data, predicted_class)
            
            # Get counterfactual tips
            counterfactual_tips = explainable_ai.generate_counterfactual_tips(encoded_data)
            
            # Get calibration data
            calibration_data = explainable_ai.calculate_calibration_data(encoded_data)
            
            # Save quiz session if user is provided
            user_id = request.data.get('user_id')
            if user_id:
                try:
                    user = UserModel.objects.get(id=user_id)
                    quiz_session = QuizSession.objects.create(
                        user=user,
                        session_type='standard',
                        responses=dict(zip([f'question{i}' for i in range(1, 20)], data)),
                        predicted_role=predicted_role,
                        confidence_score=predicted_proba,
                        feature_importance=feature_importance,
                        counterfactual_tips=counterfactual_tips,
                        calibration_data=calibration_data,
                        completed=True
                    )
                except UserModel.DoesNotExist:
                    pass  # Continue without saving session

            return Response({
                'prediction': predicted_role,
                'probability': predicted_proba,
                'confidence_percentage': confidence_percentage,
                'prediction_code': predicted_class,
                'explainable_ai': {
                    'feature_importance': feature_importance,
                    'counterfactual_tips': counterfactual_tips,
                    'calibration_data': calibration_data
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class SignUpView(APIView):
    def post(self, request, *args, **kwargs):
         serializer = SignUpSerializer(data=request.data)
         if(serializer.is_valid()):
            user = serializer.save()
            return Response({'success': True, 'user': {'id': user.id, 'name': user.name, 'email': user.email, 'age': user.age}}, status=status.HTTP_201_CREATED)
         else:
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SignInSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                # Check if user exists with the given email
                user = UserModel.objects.get(email=email)
                
                # Check if password matches
                if user.password == password:  # In production, use proper password hashing
                    return Response({
                        'success': True, 
                        'message': 'Login successful',
                        'user': {
                            'id': user.id,
                            'name': user.name,
                            'email': user.email,
                            'age': user.age
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False, 
                        'message': 'Invalid password'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except UserModel.DoesNotExist:
                return Response({
                    'success': False, 
                    'message': 'User with this email does not exist'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailsView(APIView) :
    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SentimentAnalysisView(APIView):
    def post(self, request, *args, **kwargs):
        try:

            if "text" in request.data:
                 
                  # Get the text input
                 text_input = request.data["text"]

                 predicted_sentiment = predict_sentiment(text_input)

                 return Response({"prediction": predicted_sentiment}, status=status.HTTP_200_OK)
            
            else:
                return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ============================================================================
# ADVANCED FEATURES VIEWS
# ============================================================================

class AdaptiveQuizView(APIView):
    """Handle adaptive quiz sessions with IRT/CAT"""
    
    def post(self, request, *args, **kwargs):
        """Start a new adaptive quiz session"""
        try:
            user_id = request.data.get('user_id')
            experience_level = request.data.get('experience_level', 'student')
            
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            # Initialize adaptive quiz engine
            quiz_engine = AdaptiveQuizEngine()
            
            # Start new session
            session_data = quiz_engine.start_adaptive_session(user_id, experience_level)
            
            # Create database session
            quiz_session = QuizSession.objects.create(
                user=user,
                session_type='adaptive',
                responses=session_data['responses'],
                completed=False
            )
            
            session_data['session_id'] = quiz_session.id
            
            # Format response for frontend
            current_question = session_data.get('current_question', {})
            formatted_session = {
                'session_id': quiz_session.id,
                'user_id': user_id,
                'experience_level': experience_level,
                'question_count': session_data.get('question_count', 0),
                'max_questions': session_data.get('max_questions', 15),
                'current_question': {
                    'id': current_question.get('id', ''),
                    'text': current_question.get('text', ''),
                    'type': current_question.get('type', 'rating'),
                    'options': current_question.get('options', []),
                    'scale': current_question.get('scale', [1, 10]),
                    'category': current_question.get('category', '')
                },
                'progress': {
                    'completed': session_data.get('question_count', 0),
                    'total': session_data.get('max_questions', 15)
                }
            }
            
            return Response({
                'session': formatted_session,
                'message': 'Adaptive quiz session started successfully'
            }, status=status.HTTP_201_CREATED)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, *args, **kwargs):
        """Process response and get next question"""
        try:
            session_id = request.data.get('session_id')
            response = request.data.get('response')
            
            if not session_id or response is None:
                return Response({'error': 'Session ID and response required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get session from database
            quiz_session = QuizSession.objects.get(id=session_id)
            
            # Initialize quiz engine and load session
            quiz_engine = AdaptiveQuizEngine()
            
            # Reconstruct session data (in production, you might cache this)
            session_data = {
                'user_id': quiz_session.user.id,
                'experience_level': quiz_session.user.profile.experience_level if hasattr(quiz_session.user, 'profile') else 'student',
                'questions_asked': list(quiz_session.responses.keys()),
                'responses': quiz_session.responses,
                'ability_estimate': 0.0,  # Would be stored in session
                'ability_se': 1.0,
                'question_count': len(quiz_session.responses),
                'max_questions': 15,
                'termination_criteria': {'se_threshold': 0.3, 'min_questions': 5, 'max_questions': 15}
            }
            
            # Process the response
            updated_session = quiz_engine.process_response(session_data, response)
            
            # Update database session
            quiz_session.responses = updated_session['responses']
            quiz_session.completed = updated_session.get('completed', False)
            
            if quiz_session.completed:
                # Generate final prediction
                explainable_ai = ExplainableAI()
                # Convert responses to format expected by prediction model
                # This would need to be implemented based on your specific model
                quiz_session.predicted_role = "Predicted Role"  # Placeholder
                quiz_session.confidence_score = updated_session.get('final_ability', 0.5)
            
            quiz_session.save()
            
            # Format response for frontend
            current_question = updated_session.get('current_question', {})
            formatted_session = {
                'session_id': quiz_session.id,
                'question_count': updated_session.get('question_count', 0),
                'max_questions': updated_session.get('max_questions', 15),
                'current_question': {
                    'id': current_question.get('id', ''),
                    'text': current_question.get('text', ''),
                    'type': current_question.get('type', 'rating'),
                    'options': current_question.get('options', []),
                    'scale': current_question.get('scale', [1, 10]),
                    'category': current_question.get('category', '')
                } if current_question else None,
                'progress': {
                    'completed': updated_session.get('question_count', 0),
                    'total': updated_session.get('max_questions', 15)
                },
                'efficiency_score': updated_session.get('efficiency_score', 0.0),
                'final_ability': updated_session.get('final_ability', 0.0)
            }
            
            return Response({
                'session': formatted_session,
                'completed': quiz_session.completed
            }, status=status.HTTP_200_OK)
            
        except QuizSession.DoesNotExist:
            return Response({'error': 'Quiz session not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LearningPathView(APIView):
    """Generate and manage personalized learning paths"""
    
    def post(self, request, *args, **kwargs):
        """Generate a new learning path"""
        try:
            serializer = LearningPathGenerationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            # Initialize learning path generator
            path_generator = LearningPathGenerator()
            
            # Generate learning path
            path_data = path_generator.generate_learning_path(
                target_role=serializer.validated_data['target_role'],
                current_skills=serializer.validated_data['current_skills'],
                experience_level=serializer.validated_data['experience_level'],
                preferences=serializer.validated_data.get('preferences', {})
            )
            
            if 'error' in path_data:
                return Response(path_data, status=status.HTTP_400_BAD_REQUEST)
            
            # Create learning path in database
            learning_path = LearningPath.objects.create(
                user=user,
                target_role=path_data['target_role'],
                difficulty_level=path_data['experience_level'],
                estimated_duration_weeks=path_data['estimated_duration_weeks'],
                roadmap=path_data['milestones']
            )
            
            # Create milestones
            for milestone_data in path_data['milestones']:
                LearningMilestone.objects.create(
                    learning_path=learning_path,
                    title=milestone_data['title'],
                    description=milestone_data['description'],
                    milestone_type=milestone_data['milestone_type'],
                    order=milestone_data['order'],
                    estimated_hours=milestone_data['estimated_hours'],
                    resources=milestone_data.get('resources', []),
                    prerequisites=milestone_data.get('prerequisites', []),
                    skills_gained=milestone_data.get('skills_covered', [])
                )
            
            # Serialize and return
            serializer = LearningPathSerializer(learning_path)
            learning_path_data = serializer.data
            
            # Ensure milestones are properly formatted
            if 'milestones' not in learning_path_data or not learning_path_data['milestones']:
                milestones_list = list(learning_path.milestones.all())
                learning_path_data['milestones'] = [
                    {
                        'id': m.id,
                        'title': m.title,
                        'description': m.description,
                        'milestone_type': m.milestone_type,
                        'order': m.order,
                        'estimated_hours': m.estimated_hours,
                        'resources': m.resources or [],
                        'prerequisites': m.prerequisites or [],
                        'skills_gained': m.skills_gained or [],
                        'status': m.status,
                        'progress_percentage': m.progress_percentage
                    }
                    for m in milestones_list
                ]
            
            return Response({
                'learning_path': learning_path_data,
                'generation_details': path_data
            }, status=status.HTTP_201_CREATED)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, *args, **kwargs):
        """Get user's learning paths"""
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            learning_paths = LearningPath.objects.filter(user=user)
            
            serializer = LearningPathSerializer(learning_paths, many=True)
            return Response({
                'learning_paths': serializer.data
            }, status=status.HTTP_200_OK)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MilestoneProgressView(APIView):
    """Track and update milestone progress"""
    
    def post(self, request, *args, **kwargs):
        """Update milestone progress"""
        try:
            serializer = MilestoneUpdateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            milestone = LearningMilestone.objects.get(id=serializer.validated_data['milestone_id'])
            
            # Create progress log
            progress_log = MilestoneProgress.objects.create(
                milestone=milestone,
                user=user,
                progress_notes=serializer.validated_data.get('notes', ''),
                time_spent_minutes=serializer.validated_data['time_spent_minutes'],
                completion_percentage=serializer.validated_data['progress_percentage'],
                feedback=serializer.validated_data.get('feedback', '')
            )
            
            # Update milestone status and progress
            milestone.progress_percentage = serializer.validated_data['progress_percentage']
            
            if milestone.progress_percentage >= 100:
                milestone.status = 'completed'
                milestone.completed_at = datetime.now()
            elif milestone.progress_percentage > 0:
                milestone.status = 'in_progress'
                if not milestone.started_at:
                    milestone.started_at = datetime.now()
            
            milestone.save()
            
            # Check if learning path should be updated
            learning_path = milestone.learning_path
            total_milestones = learning_path.milestones.count()
            completed_milestones = learning_path.milestones.filter(status='completed').count()
            
            if completed_milestones == total_milestones:
                # Learning path completed - could trigger notifications, certificates, etc.
                pass
            
            serializer = MilestoneProgressSerializer(progress_log)
            return Response({
                'progress_log': serializer.data,
                'milestone_updated': True
            }, status=status.HTTP_201_CREATED)
            
        except (UserModel.DoesNotExist, LearningMilestone.DoesNotExist) as e:
            return Response({'error': 'User or milestone not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, *args, **kwargs):
        """Get progress for a milestone or learning path"""
        try:
            milestone_id = request.query_params.get('milestone_id')
            learning_path_id = request.query_params.get('learning_path_id')
            user_id = request.query_params.get('user_id')
            
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            if milestone_id:
                milestone = LearningMilestone.objects.get(id=milestone_id)
                progress_logs = MilestoneProgress.objects.filter(milestone=milestone, user=user)
                serializer = MilestoneProgressSerializer(progress_logs, many=True)
                return Response({'progress_logs': serializer.data}, status=status.HTTP_200_OK)
            
            elif learning_path_id:
                learning_path = LearningPath.objects.get(id=learning_path_id, user=user)
                milestones = learning_path.milestones.all()
                
                progress_summary = []
                for milestone in milestones:
                    latest_progress = MilestoneProgress.objects.filter(
                        milestone=milestone, user=user
                    ).order_by('-created_at').first()
                    
                    progress_summary.append({
                        'milestone': LearningMilestoneSerializer(milestone).data,
                        'latest_progress': MilestoneProgressSerializer(latest_progress).data if latest_progress else None
                    })
                
                return Response({'progress_summary': progress_summary}, status=status.HTTP_200_OK)
            
            else:
                return Response({'error': 'Milestone ID or Learning Path ID required'}, status=status.HTTP_400_BAD_REQUEST)
                
        except (UserModel.DoesNotExist, LearningMilestone.DoesNotExist, LearningPath.DoesNotExist):
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    """Manage user profiles and experience levels"""
    
    def post(self, request, *args, **kwargs):
        """Create or update user profile"""
        try:
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Update profile data
            profile.experience_level = request.data.get('experience_level', profile.experience_level)
            profile.skills = request.data.get('skills', profile.skills)
            profile.preferences = request.data.get('preferences', profile.preferences)
            profile.save()
            
            serializer = UserProfileSerializer(profile)
            return Response({
                'profile': serializer.data,
                'created': created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, *args, **kwargs):
        """Get user profile"""
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            try:
                profile = user.profile
                serializer = UserProfileSerializer(profile)
                return Response({'profile': serializer.data}, status=status.HTTP_200_OK)
            except UserProfile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
                
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReminderView(APIView):
    """Manage user reminders and notifications"""
    
    def post(self, request, *args, **kwargs):
        """Create a new reminder"""
        try:
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            reminder = UserReminder.objects.create(
                user=user,
                reminder_type=request.data.get('reminder_type'),
                title=request.data.get('title'),
                message=request.data.get('message'),
                related_object_id=request.data.get('related_object_id'),
                scheduled_for=datetime.fromisoformat(request.data.get('scheduled_for'))
            )
            
            return Response({
                'reminder_id': reminder.id,
                'message': 'Reminder created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, *args, **kwargs):
        """Get user's reminders"""
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserModel.objects.get(id=user_id)
            
            # Get upcoming reminders
            upcoming_reminders = UserReminder.objects.filter(
                user=user,
                scheduled_for__gte=datetime.now(),
                sent=False
            ).order_by('scheduled_for')
            
            reminders_data = []
            for reminder in upcoming_reminders:
                reminders_data.append({
                    'id': reminder.id,
                    'type': reminder.reminder_type,
                    'title': reminder.title,
                    'message': reminder.message,
                    'scheduled_for': reminder.scheduled_for.isoformat(),
                    'related_object_id': reminder.related_object_id
                })
            
            return Response({'reminders': reminders_data}, status=status.HTTP_200_OK)
            
        except UserModel.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)