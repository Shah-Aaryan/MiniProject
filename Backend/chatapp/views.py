from django.shortcuts import render
import os
import traceback

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import google.generativeai as genai
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain


# ---------------- LOAD ENVIRONMENT ----------------
load_dotenv()

# Get API key with fallback
try:
    API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if API_KEY == "your_gemini_api_key_here":
        API_KEY = None
    genai.configure(api_key=API_KEY)
except KeyError:
    API_KEY = None
    print("⚠️ Warning: GOOGLE_API_KEY / GEMINI_API_KEY not found in environment variables")


# ---------------- CHATBOT VIEW ----------------
class ChatbotView(APIView):
    """
    Handles POST requests from the frontend chatbot.
    """

    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message not provided"}, status=status.HTTP_400_BAD_REQUEST)

        # If no API key configured
        if not API_KEY:
            fallback_response = {
                "output_text": (
                    f"I'm sorry, but I'm currently unable to provide AI-powered responses "
                    f"because the Google API key is not configured. You asked: '{user_message}'. "
                    f"To enable full AI chat functionality, please add a valid Google API key "
                    f"to your .env file. For now, I can help you with basic career guidance questions "
                    f"about the prediction system."
                )
            }
            return Response({"response": fallback_response})

        # If key is available → process
        try:
            response = ChatbotResponse.get_chatbot_response(user_message)

            if isinstance(response, dict) and "output_text" in response:
                output_text = str(response["output_text"])
            else:
                output_text = str(response) if response else "Response received but in unexpected format."

            return Response({"response": {"output_text": output_text}})

        except Exception as e:
            print(f"Error in ChatbotView: {str(e)}")
            print(traceback.format_exc())
            error_response = {
                "output_text": (
                    f"I encountered an error while processing your request: {str(e)}. "
                    f"Please check your API key configuration or try again later."
                )
            }
            return Response({"response": error_response})


# ---------------- SANITIZATION HELPER ----------------
def sanitize_for_json(obj):
    """
    Recursively convert objects to JSON-serializable format.
    Removes Pydantic model attributes like __fields_set__.
    """
    if isinstance(obj, str):
        return obj
    elif isinstance(obj, dict):
        clean_dict = {}
        for key, value in obj.items():
            if key.startswith("_"):
                continue
            try:
                clean_dict[key] = sanitize_for_json(value)
            except Exception:
                continue
        return clean_dict
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(item) for item in obj]
    elif hasattr(obj, "__dict__"):
        clean_dict = {}
        for key, value in obj.__dict__.items():
            if key.startswith("_"):
                continue
            try:
                clean_dict[key] = sanitize_for_json(value)
            except Exception:
                continue
        return clean_dict
    else:
        try:
            return str(obj)
        except Exception:
            return repr(obj)


# ---------------- CHATBOT LOGIC ----------------
class ChatbotResponse:

    @staticmethod
    def get_pdf_text():
        file_path = os.path.join(os.path.dirname(__file__), "../datasets/docs/Job_Roles.pdf")
        text = ""
        with open(file_path, "rb") as pdf_docs:
            pdf_reader = PdfReader(pdf_docs)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text

    @staticmethod
    def get_text_chunks(text):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
        return text_splitter.split_text(text)

    @staticmethod
    def get_vector_store(text_chunks):
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )
        vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
        vector_db_path = os.path.join(os.path.dirname(__file__), "../vector_db")
        vector_store.save_local(vector_db_path)

    @staticmethod
    def get_conversational_chain():
        prompt_template = """
        Answer the question as detailed as possible from the provided context.
        If the answer is not in the provided context, just say:
        "answer is not available in the context". Do not make up an answer.

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)
        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
        chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
        return chain

    @staticmethod
    def get_chatbot_response(user_message):
        try:
            vector_db_path = os.path.join(os.path.dirname(__file__), "../vector_db")
            index_file = os.path.join(vector_db_path, "index.faiss")

            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=os.getenv("GOOGLE_API_KEY"),
            )

            # Build DB if missing
            if not os.path.exists(index_file):
                print("Vector DB not found or corrupted. Rebuilding...")
                text = ChatbotResponse.get_pdf_text()
                chunks = ChatbotResponse.get_text_chunks(text)
                ChatbotResponse.get_vector_store(chunks)

            # Load FAISS DB
            new_db = FAISS.load_local(
                vector_db_path,
                embeddings,
                allow_dangerous_deserialization=True,
            )

            # Search in vector DB
            docs = new_db.similarity_search(user_message, k=3)
            if not docs:
                return {
                    "output_text": "I couldn't find relevant information in my knowledge base. Please try asking a different question about IT careers."
                }

            # QA Chain
            chain = ChatbotResponse.get_conversational_chain()

            try:
                reply_response = chain.invoke(
                    {"input_documents": docs, "question": user_message},
                    return_only_outputs=True,
                )
            except Exception as e:
                return {"output_text": f"I encountered an error while processing your request: {str(e)}. Please try again."}

            # Safely extract text from reply
            output_text = None

            if isinstance(reply_response, dict):
                for key in ["output_text", "output", "text", "answer", "result", "content"]:
                    if key in reply_response and reply_response[key]:
                        output_text = str(reply_response[key])
                        break
                if not output_text:
                    for key, value in reply_response.items():
                        if not key.startswith("_"):
                            try:
                                output_text = str(value)
                                if output_text.strip():
                                    break
                            except Exception:
                                continue
            else:
                try:
                    output_text = str(reply_response)
                except Exception:
                    output_text = "No response received"

            if not output_text or not output_text.strip():
                output_text = "I received a response but couldn't extract the text content."

            return {"output_text": output_text.strip()}

        except Exception as e:
            print(f"Error in get_chatbot_response: {str(e)}")
            return {"output_text": f"I encountered an error while processing your request: {str(e)}. Please try again."}
