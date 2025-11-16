# Career Path Prediction System - AI Agent Guide

## Project Overview
Full-stack career guidance platform using ML prediction (Decision Tree), AI chatbot (Groq Llama 3), adaptive quizzes (IRT/CAT), and learning path generation. Django REST Framework backend with React+Vite+Three.js frontend.

## Architecture & Data Flow

### Backend Structure (Django)
- **Core Apps**: Each feature is a Django app with ViewSet-based REST APIs
  - `prediction/` - Career ML model (19-question quiz → 12 IT roles)
  - `adaptive_quiz/` - IRT-based adaptive quizzes with categories, questions, attempts
  - `chatapp/` - Groq-powered career advisor chatbot
  - `portfolio/`, `skill_assessments/`, `labor_market/` - Feature modules with templates
  - `voiceapp/` - Speech recognition integration
  
- **Utils Package**: Standalone engines for advanced features
  - `utils/adaptive_quiz.py` - IRT/CAT engine with experience branching
  - `utils/explainable_ai.py` - Feature importance, counterfactuals, calibration
  - `utils/learning_path_generator.py` - Curriculum generation with prerequisite graphs

- **API Pattern**: DRF `DefaultRouter` in `backend/urls.py` auto-generates RESTful endpoints:
  ```python
  router.register(r'adaptive-quiz/quizzes', AdaptiveQuizViewSet)
  # Creates: /api/adaptive-quiz/quizzes/, /api/adaptive-quiz/quizzes/{id}/
  ```

### Frontend Structure (React)
- **Route-based**: `App.jsx` defines all routes (`/predict`, `/adaptive-quiz`, `/chat`, etc.)
- **State Management**: Redux Toolkit (currently only `feedbackSlice` in `app/store.js`)
- **3D Components**: Three.js with `@react-three/fiber` for earth/space visualizations
- **Feature Pages**: Self-contained components in `src/components/<feature>/`

### Key Data Flows
1. **Career Prediction**: 19-question POST to `/api/predict/` → Decision Tree model → career + confidence
2. **Adaptive Quiz**: 
   - Start: POST `/api/adaptive-quiz/quizzes/start_quiz/` → IRT selects first question
   - Submit answer: POST `submit_answer/` → engine recalculates ability, selects next question
   - Complete: POST `complete_quiz/` → final score + skill profile update
3. **Chatbot**: POST `/api/chat/` → Groq API (Llama 3) with career advisor system prompt
4. **Signal-based Updates**: All feature apps use Django signals to auto-create user profiles (`@receiver(post_save, sender=User)`)

## Development Commands

### Backend Setup
```bash
cd Backend
python3 -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Runs on http://127.0.0.1:8000
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev  # Vite dev server on http://localhost:5173
```

### Populate Quiz Data (Management Command)
```bash
cd Backend
python manage.py populate_quiz_data  # Seeds QuizCategory + Question + QuestionOption
```

## Project-Specific Conventions

### API Design Patterns
- **ViewSet Actions**: Use `@action(detail=True, methods=['post'])` for custom endpoints
  - Example: `AdaptiveQuizViewSet.start_quiz()` creates `/quizzes/start_quiz/`
- **Anonymous Users**: Many views use `AllowAny` permission + `_get_or_create_test_user()` for demo access
- **Serializer Switching**: Override `get_serializer_class()` for list vs detail views

### Model Conventions
- **JSON Fields**: Use `models.JSONField(default=list)` for flexible data (skill tags, quiz responses)
- **Validation**: Use Django validators (`MinValueValidator`, `MaxValueValidator`) on numeric fields
- **Auto-timestamps**: All models have `created_at`/`updated_at` with `auto_now_add`/`auto_now`

### Environment Variables (`.env` in Backend/)
```env
GROQ_API_KEY=your_groq_api_key_here  # Required for chatbot
DJANGO_SECRET_KEY=your_secret_key    # Override hardcoded key
DEBUG=True                            # Set False for production
```

### CORS Configuration
- **Development**: `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py` (line 159)
- **Production**: Use `CORS_ALLOWED_ORIGINS` list (line 147) in `deployment.py`

## Critical Integration Points

### ML Model Loading
```python
# Pattern used throughout: joblib.load with relative path
model_path = os.path.join(os.path.dirname(__file__), '../ml_models/dtmodel.pkl')
model = joblib.load(model_path)
```
- Model expects 19 features in specific order (see `ExplainableAI.feature_names`)
- Categorical encoding maps (question7: courses, question8: workshops) hardcoded in `prediction/views.py`

### Adaptive Quiz IRT Parameters
- Questions have `difficulty` (-2 to +2) and `discrimination` (0.5 to 2.5) parameters
- Engine uses `scipy.optimize` to estimate user ability (theta) after each response
- Termination criteria: min 5 questions, max 20, or standard error < 0.3

### Chatbot System Prompt
Located in `chatapp/views.py` line 77-83: Instructs Groq model to be an IT career advisor specializing in 12 specific roles (Software Developer, Web Developer, UX Designer, etc.)

## Common Gotchas

1. **Missing Migrations**: Feature apps (`adaptive_quiz`, `portfolio`, etc.) need separate migrations
   ```bash
   python manage.py makemigrations adaptive_quiz
   python manage.py migrate
   ```

2. **Signal Registration**: Signals only work if app config has `ready()` method importing signals:
   ```python
   # adaptive_quiz/apps.py
   def ready(self):
       import adaptive_quiz.signals
   ```

3. **Frontend API Calls**: Hardcoded to `http://127.0.0.1:8000/api/` - change in production

4. **SQLite Limitations**: `db.sqlite3` used by default - switch to PostgreSQL for production (see `deployment.py`)

5. **Virtual Environment Folder**: `MP/` folder is a venv - should be in `.gitignore`

## Testing & Debugging

- **No Unit Tests Currently**: Project lacks test suite (use `python manage.py test <app>` pattern)
- **Admin Interface**: Access at `/admin/` (create superuser: `python manage.py createsuperuser`)
- **DRF Browsable API**: Visit any `/api/` endpoint in browser for interactive testing
- **Management Commands**: Located in `<app>/management/commands/` (e.g., `populate_quiz_data.py`)

## Deployment Notes

- **Production Settings**: Use `backend/deployment.py` (whitenoise, Azure PostgreSQL)
- **Static Files**: Run `python manage.py collectstatic` before deploying
- **Environment**: Set `WEBSITE_HOSTNAME`, `MY_SECRET_KEY`, `AZURE_POSTGRESQL_CONNECTIONSTRING`
- **Frontend Build**: `npm run build` creates `dist/` folder for static hosting

## Feature-Specific Tips

### Adding New Quiz Questions
1. Create `Question` with `category`, `difficulty`, `points`, `time_limit`
2. Add 4 `QuestionOption` objects (mark one `is_correct=True`)
3. Optionally set `skill_tags` JSON array for skill profiling

### Extending Learning Paths
Edit `utils/learning_path_generator.py` → `_initialize_role_curricula()` to add career roles with `core_skills`, `advanced_skills`, `tools`, `estimated_weeks`

### Adding Labor Market Data
Use `labor_market` app ViewSets (`IndustryViewSet`, `JobRoleViewSet`, etc.) - all read-only with filtering
