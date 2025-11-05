# Career Recommendation System - Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # Seed initial data
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173 (Vite default)
- Backend API: http://localhost:8000/api/

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/signin/` - User login

### Quiz & Predictions
- `POST /api/quiz/` - Standard quiz prediction
- `POST /api/adaptive-quiz/` - Start adaptive quiz
- `PUT /api/adaptive-quiz/` - Submit adaptive quiz response

### Learning Paths
- `GET /api/learning-paths/?user_id=X` - Get user's learning paths
- `POST /api/learning-paths/` - Generate new learning path

### AI Explanations
- `POST /api/ai-explanations/` - Get AI explanation for recommendations

### Portfolio & Projects
- `GET /api/project-templates/?role=X` - Get project templates
- `POST /api/portfolio/` - Create project from template

### Assessments
- `GET /api/skill-assessments/?skill=X&type=Y` - Get available assessments
- `POST /api/user-assessments/` - Start assessment
- `PUT /api/user-assessments/` - Submit assessment

### Labor Market Intelligence
- `GET /api/labor-insights/?role=X&region=Y&experience_level=Z` - Get market insights

### User Profile
- `GET /api/user-profile/?user_id=X` - Get user profile
- `POST /api/user-profile/` - Create/update user profile

## Database Seeding

Run the seed command to populate initial data:
```bash
python manage.py seed_data
```

This creates:
- Adaptive quiz questions
- Project templates
- Skill assessments
- Badges
- Resume templates

## Troubleshooting

### Features not working?

1. **Check if backend is running**: `http://localhost:8000/api/`
2. **Check if database is seeded**: Run `python manage.py seed_data`
3. **Check browser console** for API errors
4. **Check Django logs** for backend errors

### Common Issues

- **CORS errors**: Ensure `corsheaders` is installed and `CORS_ALLOW_ALL_ORIGINS = True` in settings
- **Empty results**: Run `python manage.py seed_data` to populate initial data
- **User ID errors**: Make sure you're signed in and `userId` is stored in localStorage

## Testing Endpoints

Use curl or Postman to test:

```bash
# Test project templates
curl http://localhost:8000/api/project-templates/

# Test assessments
curl http://localhost:8000/api/skill-assessments/

# Test labor market (requires role parameter)
curl "http://localhost:8000/api/labor-insights/?role=Software%20Developer&region=US&experience_level=mid"
```

