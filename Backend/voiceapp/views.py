from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import os
import logging

from groq import Groq
from dotenv import load_dotenv

import pyttsx3

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API key - now using Groq
try:
    API_KEY = os.environ.get("GROQ_API_KEY")
    if API_KEY and API_KEY != "your_groq_api_key_here":
        groq_client = Groq(api_key=API_KEY)
    else:
        API_KEY = None
        groq_client = None
except Exception as e:
    API_KEY = None
    groq_client = None
    print(f"Warning: GROQ_API_KEY not found or invalid: {str(e)}")

# Initialize TTS Engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)

class VoiceBotView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        user_message = request.data.get('query')
        
        # Check if API key is available
        if not API_KEY or not groq_client:
            fallback_response = f"I'm sorry, but I'm currently unable to provide AI-powered voice responses because the Groq API key is not configured. You asked: '{user_message}'. To enable full AI voice functionality, please add a valid GROQ_API_KEY to your .env file. Get your free API key at: https://console.groq.com"
            return Response({'query': user_message, 'response': fallback_response})

        try:
            #VoiceBotFunction.speak("searching")
            response_text = VoiceBotFunction.get_voice_response(user_message, groq_client)
            logger.info(response_text)
            #VoiceBotFunction.speak(response_text)
            return Response({'query': user_message, 'response': response_text})

        except Exception as e:
            logger.error(f"Exception occurred: {e}")
            error_response = f"I encountered an error while processing your voice request: {str(e)}. Please check your API key configuration or try again later."
            return Response({'query': user_message, 'response': error_response})

class VoiceBotFunction:

    def speak(text, rate=120):
        try:
            engine.setProperty('rate', rate)
            engine.say(text)
 
            if not engine._inLoop:
                engine.runAndWait()

        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")

    @staticmethod
    def get_voice_response(user_message, groq_client):
        """
        Generate AI voice response using Groq API (Llama 3)
        """
        try:
            # Create system instruction for IT career guidance
            system_instruction = """You are an expert IT Career Advisor specializing in voice interactions. 
            Provide clear, concise, and helpful information about IT careers, skills, salaries, and job market trends. 
            Keep responses conversational and suitable for voice output - avoid long paragraphs. 
            Focus on careers like Software Developer, Web Developer, UX Designer, Database Developer, 
            Network Security Engineer, Mobile Developer, QA/Testing, Technical Support, etc."""

            # Call Groq API
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_instruction
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                model="llama-3.3-70b-versatile",  # Latest fast model
                temperature=0.7,
                max_tokens=512,  # Shorter for voice
                top_p=0.95,
            )
            
            return chat_completion.choices[0].message.content

        except Exception as e:
            logger.error(f"Error in get_voice_response: {e}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."

class VoiceCommand(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get(self, request):
        VoiceBotFunction.speak("Voice Assistant is Activated")
        return Response({"message": "Voice activated"}, status=status.HTTP_200_OK)