from django.shortcuts import render
import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from groq import Groq
from dotenv import load_dotenv


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
    print(f"⚠️ Warning: Error configuring Groq API: {str(e)}")


# ---------------- CHATBOT VIEW ----------------
class ChatbotView(APIView):
    """
    Simple Google Generative AI Chatbot (No RAG)
    Direct conversation with Gemini model
    """
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message not provided"}, status=status.HTTP_400_BAD_REQUEST)

        # If no API key
        if not API_KEY or not groq_client:
            fallback_response = {
                "output_text": "I'm sorry, but I'm currently unable to provide AI-powered responses because the Groq API key is not configured. To enable AI chat functionality, please add a valid GROQ_API_KEY to your .env file. Get your free API key at: https://console.groq.com"
            }
            return Response({"response": fallback_response})

        # Generate AI response
        try:
            response_text = ChatbotResponse.get_chatbot_response(user_message, groq_client)
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
    AI Chatbot using Groq API
    Specialized in IT Career Guidance
    """

    @staticmethod
    def get_chatbot_response(user_message, groq_client):
        """
        Generate AI response using Groq API (Llama 3)
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
                max_tokens=1024,
                top_p=0.95,
            )
            
            return chat_completion.choices[0].message.content

        except Exception as e:
            print(f"❌ Error generating AI response: {str(e)}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try rephrasing your question or contact support if the issue persists."