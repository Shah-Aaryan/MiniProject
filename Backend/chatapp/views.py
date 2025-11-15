from django.shortcuts import render
import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import google.generativeai as genai
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Get API key with fallback
try:
    API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if API_KEY and API_KEY != "your_gemini_api_key_here":
        genai.configure(api_key=API_KEY)
    else:
        API_KEY = None
except Exception as e:
    API_KEY = None
    print(f"⚠️ Warning: Error configuring Google API: {str(e)}")


# ---------------- CHATBOT VIEW ----------------
class ChatbotView(APIView):
    """
    Simple Google Generative AI Chatbot (No RAG)
    Direct conversation with Gemini model
    """

    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message not provided"}, status=status.HTTP_400_BAD_REQUEST)

        # If no API key
        if not API_KEY:
            fallback_response = {
                "output_text": "I'm sorry, but I'm currently unable to provide AI-powered responses because the Google API key is not configured. To enable AI chat functionality, please add a valid GOOGLE_API_KEY to your .env file."
            }
            return Response({"response": fallback_response})

        # Generate AI response
        try:
            response_text = ChatbotResponse.get_chatbot_response(user_message)
            return Response({"response": {"output_text": response_text}})
        except Exception as e:
            print(f"❌ Chatbot error: {str(e)}")
            error_response = {
                "output_text": f"I encountered an error: {str(e)}. Please try again or check your API key configuration."
            }
            return Response({"response": error_response})


# ---------------- CHATBOT LOGIC ----------------
class ChatbotResponse:
    """
    Simple Generative AI Chatbot - Direct Gemini API
    Specialized in IT Career Guidance
    """

    @staticmethod
    def get_chatbot_response(user_message):
        """
        Generate AI response using Google Generative AI (Gemini)
        """
        try:
            # Create system instruction for career guidance context
            system_instruction = """You are an expert IT Career Advisor and Mentor. You help people understand different IT career paths, 
            skills required, salary expectations, job market trends, and career progression. You provide detailed, accurate, and helpful 
            information about careers like Software Developer, Web Developer, UX Designer, Database Developer, Network Security Engineer, 
            Mobile App Developer, QA/Testing, Technical Support, Software Engineer, Applications Developer, CRM Developer, and Systems 
            Security Administrator.

            Provide practical advice, industry insights, learning resources, and career guidance. Be conversational, friendly, and encouraging.
            If asked about non-IT topics, politely redirect to IT career-related questions."""

            # Initialize the model with system instruction
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )

            # Start a chat session
            chat = model.start_chat(history=[])
            
            # Create enhanced prompt with context
            enhanced_prompt = f"""{system_instruction}

User Question: {user_message}

Please provide a helpful, detailed response about IT careers and technology fields."""

            # Generate response
            response = chat.send_message(enhanced_prompt)
            
            return response.text

        except Exception as e:
            print(f"❌ Error generating AI response: {str(e)}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try rephrasing your question or contact support if the issue persists."