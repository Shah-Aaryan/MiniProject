# Career Path Prediction System

A comprehensive full-stack application that helps users discover their ideal career path in the IT field through AI-powered predictions, interactive quizzes, and intelligent chatbot assistance.

##  Features

###  Career Prediction
- **Machine Learning Model**: Uses a trained Decision Tree model to predict career paths based on user responses
- **Interactive Quiz**: 19-question assessment covering technical skills, interests, and career preferences
- **12 Career Roles**: Predicts from 12 different IT career paths including:
  - Applications Developer
  - CRM Technical Developer
  - Database Developer
  - Mobile Applications Developer
  - Network Security Engineer
  - Software Developer
  - Software Engineer
  - Software Quality Assurance (QA) / Testing
  - Systems Security Administrator
  - Technical Support
  - UX Designer
  - Web Developer

###  AI-Powered Chatbot
- **Google Gemini Integration**: Powered by Google's Generative AI for intelligent conversations
- **RAG (Retrieval-Augmented Generation)**: Uses FAISS vector database for context-aware responses
- **PDF Knowledge Base**: Extracts information from job role documentation
- **Fallback Support**: Graceful handling when API keys are not configured

###  Voice Interface
- **Speech Recognition**: Voice input support for hands-free interaction
- **Text-to-Speech**: Audio responses for better accessibility
- **Real-time Processing**: Live voice interaction capabilities

###  Modern UI/UX
- **3D Visualizations**: Interactive 3D Earth and space-themed components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user experience
- **Material Design**: Modern UI components with Material Tailwind

###  Sentiment Analysis
- **Text Analysis**: Analyzes user feedback and text input
- **Emotion Detection**: Identifies emotional context in user responses

## 🏗️ Architecture

### Backend (Django REST Framework)
```
Backend/
├── backend/           # Django project settings
├── prediction/        # Career prediction API
├── chatapp/          # AI chatbot functionality
├── voiceapp/         # Voice interface features
├── ml_models/        # Trained ML models
├── datasets/         # Training data and documentation
├── vector_db/        # FAISS vector database
└── utils/            # Utility functions
```

### Frontend (React + Vite)
```
Frontend/
├── src/
│   ├── components/   # React components
│   ├── features/     # Redux state management
│   └── utils/        # Utility functions
├── public/           # Static assets
└── package.json      # Dependencies
```

##  Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the Backend directory:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

##  Configuration

### API Keys
- **Google Gemini API**: Required for chatbot functionality
  - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Add to `.env` file as `GOOGLE_API_KEY`

### Database
- **SQLite**: Default database for development
- **PostgreSQL**: Recommended for production (configure in `settings.py`)

##  Usage

### Career Prediction
1. Navigate to `/predict` or `/test-predict`
2. Complete the 19-question assessment
3. Receive your predicted career path with confidence percentage

### AI Chatbot
1. Go to `/chat`
2. Ask questions about IT careers, job roles, or technical topics
3. Get intelligent responses based on the knowledge base

### Voice Interface
1. Visit `/voice`
2. Use voice commands for hands-free interaction
3. Receive audio responses

## 🛠️ API Endpoints

### Prediction API
- `POST /api/predict/` - Submit quiz responses for career prediction

### Authentication API
- `POST /api/signup/` - User registration
- `POST /api/signin/` - User login

### Chatbot API
- `POST /api/chat/` - Send message to AI chatbot

### Sentiment Analysis API
- `POST /api/sentiment/` - Analyze text sentiment

##  Machine Learning

### Model Details
- **Algorithm**: Decision Tree Classifier
- **Training Data**: 6,901 samples with 19 features
- **Features**: Technical skills, interests, certifications, and career preferences
- **Accuracy**: Optimized for career path prediction

### Data Preprocessing
- Categorical encoding for text-based features
- Numerical scaling for rating-based features
- Feature engineering for better prediction accuracy

##  Technologies Used

### Backend
- **Django 4.2.13** - Web framework
- **Django REST Framework** - API development
- **Google Generative AI** - AI chatbot
- **LangChain** - LLM framework
- **FAISS** - Vector database
- **scikit-learn** - Machine learning
- **PyPDF2** - PDF processing
- **SpeechRecognition** - Voice input

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D graphics
- **React Router** - Navigation
- **Redux Toolkit** - State management

##  Dataset

The model is trained on a comprehensive dataset containing:
- **6,901 samples** of career-related data
- **19 features** covering technical skills, interests, and preferences
- **12 target classes** representing different IT career paths

##  Security Features

- CORS configuration for cross-origin requests
- Input validation and sanitization
- Error handling and logging
- Environment variable protection

##  Deployment

### Backend Deployment
1. Configure production settings in `backend/deployment.py`
2. Set up environment variables
3. Run migrations: `python manage.py migrate`
4. Collect static files: `python manage.py collectstatic`
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API endpoints for production

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request


##  Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `datasets/docs/` folder
- Review the API endpoints and their usage

##  Future Enhancements

- [ ] Additional ML models (Random Forest, Neural Networks)
- [ ] More career domains beyond IT
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Integration with job boards
- [ ] Personalized learning paths


