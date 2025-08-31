#from django.shortcuts import render

# Create your views here.
import joblib
import os
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .serializers import PredictionSerializer, SignInSerializer, SignUpSerializer, UserSerializer
from .models import UserModel

from utils.utility import predict_sentiment

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

            return Response({
                'prediction': predicted_role,
                'probability': predicted_proba,
                'confidence_percentage': confidence_percentage,
                'prediction_code': predicted_class
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class SignUpView(APIView):
    def post(self, request, *args, **kwargs):
         serializer = SignUpSerializer(data=request.data)
         if(serializer.is_valid()):
             serializer.save()
             return Response({'success': True}, status=status.HTTP_201_CREATED)
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