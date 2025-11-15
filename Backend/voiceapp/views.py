from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import logging

import google.generativeai as genai
from dotenv import load_dotenv

import pyttsx3

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API key with fallback
try:
    API_KEY = os.environ["GOOGLE_API_KEY"]
    if API_KEY == "your_google_api_key_here":
        API_KEY = None
    genai.configure(api_key = API_KEY)
except KeyError:
    API_KEY = None
    print("Warning: GOOGLE_API_KEY not found in environment variables")

# Initialize TTS Engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)

class VoiceBotView(APIView):

    def post(self, request):
        user_message = request.data.get('query')
        
        # Check if API key is available
        if not API_KEY:
            fallback_response = f"I'm sorry, but I'm currently unable to provide AI-powered voice responses because the Google API key is not configured. You asked: '{user_message}'. To enable full AI voice functionality, please add a valid Google API key to your .env file."
            return Response({'query': user_message, 'response': fallback_response})

        try:
            #VoiceBotFunction.speak("searching")
            response_text = VoiceBotFunction.get_voice_response(user_message)
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
    def get_voice_response(user_message):
        """
        Generate AI voice response using Google Generative AI (Direct - No RAG)
        """
        try:
            # Create system instruction for IT career guidance
            system_instruction = """You are an expert IT Career Advisor specializing in voice interactions. 
            Provide clear, concise, and helpful information about IT careers, skills, salaries, and job market trends. 
            Keep responses conversational and suitable for voice output - avoid long paragraphs. 
            Focus on careers like Software Developer, Web Developer, UX Designer, Database Developer, 
            Network Security Engineer, Mobile Developer, QA/Testing, Technical Support, etc."""

            # Initialize the model
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 512,  # Shorter for voice
                }
            )

            # Start chat and generate response
            chat = model.start_chat(history=[])
            enhanced_prompt = f"""{system_instruction}

User Question (Voice): {user_message}

Provide a clear, concise voice-friendly response about IT careers."""

            response = chat.send_message(enhanced_prompt)
            return response.text

        except Exception as e:
            logger.error(f"Error in get_voice_response: {e}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."

class VoiceCommand(APIView) :
    def get(self,request):
        VoiceBotFunction.speak("Voice Assistant is Activated")
        return Response({"message": "Voice activated"}, status=status.HTTP_200_OK)