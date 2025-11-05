"""
Management command to seed initial data for the career recommendation system
Run with: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from prediction.models import (
    AdaptiveQuizQuestion, ProjectTemplate, Assessment, 
    Badge, ResumeTemplate
)

class Command(BaseCommand):
    help = 'Seed initial data for the application'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial data...')
        
        # Seed Adaptive Quiz Questions
        self.seed_quiz_questions()
        
        # Seed Project Templates
        self.seed_project_templates()
        
        # Seed Assessments
        self.seed_assessments()
        
        # Seed Badges
        self.seed_badges()
        
        # Seed Resume Templates
        self.seed_resume_templates()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded initial data!'))

    def seed_quiz_questions(self):
        """Seed adaptive quiz questions"""
        questions = [
            {
                'question_id': 'tech_001',
                'question_text': 'How comfortable are you with database design and optimization?',
                'question_type': 'rating',
                'options': [],
                'difficulty_level': -0.5,
                'discrimination': 1.2,
                'category': 'database',
                'experience_level': 'student'
            },
            {
                'question_id': 'tech_002',
                'question_text': 'Rate your expertise in advanced machine learning algorithms (neural networks, deep learning)',
                'question_type': 'rating',
                'options': [],
                'difficulty_level': 1.5,
                'discrimination': 1.8,
                'category': 'machine_learning',
                'experience_level': 'mid'
            },
            {
                'question_id': 'int_001',
                'question_text': 'How much do you enjoy solving complex algorithmic problems?',
                'question_type': 'rating',
                'options': [],
                'difficulty_level': 0.0,
                'discrimination': 1.0,
                'category': 'problem_solving',
                'experience_level': 'student'
            },
            {
                'question_id': 'work_001',
                'question_text': 'Do you prefer working independently or in a team?',
                'question_type': 'multiple_choice',
                'options': ['Strongly prefer independent', 'Prefer independent', 'No preference', 'Prefer team', 'Strongly prefer team'],
                'difficulty_level': 0.0,
                'discrimination': 0.8,
                'category': 'work_style',
                'experience_level': 'student'
            },
        ]
        
        for q_data in questions:
            AdaptiveQuizQuestion.objects.get_or_create(
                question_id=q_data['question_id'],
                defaults=q_data
            )
        
        self.stdout.write(f'  - Created {len(questions)} quiz questions')

    def seed_project_templates(self):
        """Seed project templates"""
        templates = [
            {
                'role': 'Software Developer',
                'title': 'Todo List API',
                'description': 'Build a RESTful API for a todo list application with CRUD operations',
                'difficulty_level': 'beginner',
                'estimated_hours': 8,
                'skills_required': ['Python', 'REST API', 'Database'],
                'skills_taught': ['FastAPI/Flask', 'SQL', 'API Design'],
                'rubric': {
                    'functionality': {'weight': 40, 'criteria': 'All CRUD operations work correctly'},
                    'code_quality': {'weight': 30, 'criteria': 'Clean, well-documented code'},
                    'testing': {'weight': 20, 'criteria': 'Unit tests included'},
                    'documentation': {'weight': 10, 'criteria': 'README and API docs'}
                },
                'project_structure': ['app/', 'tests/', 'requirements.txt', 'README.md'],
                'starter_code': '# Todo List API\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n# Add your routes here\n',
                'readme_template': '# Todo List API\n\nA RESTful API for managing todo items.\n'
            },
            {
                'role': 'Web Developer',
                'title': 'Responsive Portfolio Website',
                'description': 'Create a responsive portfolio website using HTML, CSS, and JavaScript',
                'difficulty_level': 'beginner',
                'estimated_hours': 12,
                'skills_required': ['HTML', 'CSS', 'JavaScript'],
                'skills_taught': ['Responsive Design', 'Modern CSS', 'DOM Manipulation'],
                'rubric': {
                    'design': {'weight': 30, 'criteria': 'Modern, attractive design'},
                    'responsiveness': {'weight': 30, 'criteria': 'Works on all devices'},
                    'functionality': {'weight': 25, 'criteria': 'Interactive features work'},
                    'code_quality': {'weight': 15, 'criteria': 'Clean, semantic HTML/CSS'}
                },
                'project_structure': ['index.html', 'styles.css', 'script.js', 'assets/'],
                'starter_code': '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Portfolio</title>\n</head>\n<body>\n    <!-- Your content here -->\n</body>\n</html>',
                'readme_template': '# Portfolio Website\n\nA responsive portfolio website.\n'
            },
        ]
        
        for t_data in templates:
            ProjectTemplate.objects.get_or_create(
                role=t_data['role'],
                title=t_data['title'],
                defaults=t_data
            )
        
        self.stdout.write(f'  - Created {len(templates)} project templates')

    def seed_assessments(self):
        """Seed skill assessments"""
        assessments = [
            {
                'title': 'Python Fundamentals Assessment',
                'description': 'Test your knowledge of Python basics including variables, loops, and functions',
                'assessment_type': 'mcq',
                'skill_tested': 'Python',
                'duration_minutes': 30,
                'questions': [
                    {
                        'id': 'q1',
                        'question': 'What is the output of: print(2 ** 3)',
                        'options': ['6', '8', '9', '5'],
                        'correct_answer': '8'
                    },
                    {
                        'id': 'q2',
                        'question': 'Which method is used to add an item to a list?',
                        'options': ['append()', 'add()', 'insert()', 'push()'],
                        'correct_answer': 'append()'
                    }
                ],
                'passing_score': 70,
                'badge_name': 'Python Basics Badge'
            },
            {
                'title': 'JavaScript Fundamentals Assessment',
                'description': 'Test your knowledge of JavaScript basics',
                'assessment_type': 'mcq',
                'skill_tested': 'JavaScript',
                'duration_minutes': 30,
                'questions': [
                    {
                        'id': 'q1',
                        'question': 'What is the correct way to declare a variable in ES6?',
                        'options': ['var x = 1', 'let x = 1', 'const x = 1', 'All of the above'],
                        'correct_answer': 'All of the above'
                    }
                ],
                'passing_score': 70,
                'badge_name': 'JavaScript Basics Badge'
            },
        ]
        
        for a_data in assessments:
            Assessment.objects.get_or_create(
                title=a_data['title'],
                defaults=a_data
            )
        
        self.stdout.write(f'  - Created {len(assessments)} assessments')

    def seed_badges(self):
        """Seed badges"""
        badges = [
            {
                'name': 'Python Basics Badge',
                'description': 'Completed Python Fundamentals Assessment',
                'category': 'skill',
                'criteria': {'assessment_passed': 'Python Fundamentals Assessment'}
            },
            {
                'name': 'JavaScript Basics Badge',
                'description': 'Completed JavaScript Fundamentals Assessment',
                'category': 'skill',
                'criteria': {'assessment_passed': 'JavaScript Fundamentals Assessment'}
            },
            {
                'name': 'First Project',
                'description': 'Completed your first portfolio project',
                'category': 'project',
                'criteria': {'projects_completed': 1}
            },
        ]
        
        for b_data in badges:
            Badge.objects.get_or_create(
                name=b_data['name'],
                defaults=b_data
            )
        
        self.stdout.write(f'  - Created {len(badges)} badges')

    def seed_resume_templates(self):
        """Seed resume templates"""
        templates = [
            {
                'name': 'Modern Professional',
                'description': 'Clean, modern resume template with emphasis on skills and experience',
                'template_type': 'modern',
                'html_template': '<div class="resume">Modern Template HTML</div>',
                'css_template': '.resume { font-family: Arial; }',
                'sections': ['personal_info', 'summary', 'experience', 'education', 'skills'],
                'ats_friendly': True
            },
            {
                'name': 'Classic Traditional',
                'description': 'Traditional resume format with chronological experience',
                'template_type': 'classic',
                'html_template': '<div class="resume">Classic Template HTML</div>',
                'css_template': '.resume { font-family: Times New Roman; }',
                'sections': ['personal_info', 'experience', 'education', 'skills'],
                'ats_friendly': True
            },
        ]
        
        for t_data in templates:
            ResumeTemplate.objects.get_or_create(
                name=t_data['name'],
                defaults=t_data
            )
        
        self.stdout.write(f'  - Created {len(templates)} resume templates')

