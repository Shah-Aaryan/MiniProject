# adaptive_quiz/management/commands/populate_quiz_data.py
from django.core.management.base import BaseCommand
from adaptive_quiz.models import QuizCategory, Question, QuestionOption


class Command(BaseCommand):
    help = 'Populate quiz database with sample categories and questions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating quiz data...')

        # Create categories
        categories_data = [
            {
                'name': 'Python Programming',
                'description': 'Test your Python programming skills',
                'difficulty_level': 3
            },
            {
                'name': 'JavaScript Fundamentals',
                'description': 'Master JavaScript basics and advanced concepts',
                'difficulty_level': 2
            },
            {
                'name': 'Data Structures',
                'description': 'Arrays, linked lists, trees, and more',
                'difficulty_level': 4
            },
            {
                'name': 'Web Development',
                'description': 'HTML, CSS, and modern web technologies',
                'difficulty_level': 2
            }
        ]

        for cat_data in categories_data:
            category, created = QuizCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
            
            # Add questions for each category
            if category.name == 'Python Programming':
                self._create_python_questions(category)
            elif category.name == 'JavaScript Fundamentals':
                self._create_javascript_questions(category)
            elif category.name == 'Data Structures':
                self._create_datastructures_questions(category)
            elif category.name == 'Web Development':
                self._create_webdev_questions(category)

        self.stdout.write(self.style.SUCCESS('Successfully populated quiz data!'))

    def _create_python_questions(self, category):
        questions = [
            {
                'question_text': 'What is the output of: print(type([]))?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': "<class 'list'>", 'is_correct': True},
                    {'text': "<class 'dict'>", 'is_correct': False},
                    {'text': "<class 'tuple'>", 'is_correct': False},
                    {'text': "<class 'set'>", 'is_correct': False},
                ]
            },
            {
                'question_text': 'Which keyword is used to define a function in Python?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'def', 'is_correct': True},
                    {'text': 'function', 'is_correct': False},
                    {'text': 'func', 'is_correct': False},
                    {'text': 'define', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is the purpose of the __init__ method in Python classes?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'It is the constructor method', 'is_correct': True},
                    {'text': 'It is used to delete objects', 'is_correct': False},
                    {'text': 'It is a static method', 'is_correct': False},
                    {'text': 'It is used for inheritance', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is a list comprehension in Python?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'A concise way to create lists', 'is_correct': True},
                    {'text': 'A way to compare lists', 'is_correct': False},
                    {'text': 'A type of loop', 'is_correct': False},
                    {'text': 'A built-in function', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is the difference between a shallow copy and a deep copy?',
                'difficulty': 'hard',
                'points': 30,
                'time_limit': 60,
                'options': [
                    {'text': 'Shallow copies nested objects by reference, deep copies create new nested objects', 'is_correct': True},
                    {'text': 'They are the same thing', 'is_correct': False},
                    {'text': 'Shallow copy is faster but less accurate', 'is_correct': False},
                    {'text': 'Deep copy only works with lists', 'is_correct': False},
                ]
            },
        ]
        self._create_questions(category, questions)

    def _create_javascript_questions(self, category):
        questions = [
            {
                'question_text': 'Which of the following is used to declare a variable in JavaScript?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'var, let, const', 'is_correct': True},
                    {'text': 'int, float, char', 'is_correct': False},
                    {'text': 'variable, declare, def', 'is_correct': False},
                    {'text': 'dim, set, define', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What does "===" mean in JavaScript?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'Strict equality (checks value and type)', 'is_correct': True},
                    {'text': 'Assignment operator', 'is_correct': False},
                    {'text': 'Loose equality', 'is_correct': False},
                    {'text': 'Not equal to', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is a closure in JavaScript?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'A function that has access to its outer scope', 'is_correct': True},
                    {'text': 'A way to close the browser', 'is_correct': False},
                    {'text': 'A type of loop', 'is_correct': False},
                    {'text': 'An error handling mechanism', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is the difference between null and undefined?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'null is assigned, undefined means not assigned', 'is_correct': True},
                    {'text': 'They are exactly the same', 'is_correct': False},
                    {'text': 'undefined is for objects only', 'is_correct': False},
                    {'text': 'null is a string', 'is_correct': False},
                ]
            },
        ]
        self._create_questions(category, questions)

    def _create_datastructures_questions(self, category):
        questions = [
            {
                'question_text': 'What is the time complexity of accessing an element in an array?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'O(1)', 'is_correct': True},
                    {'text': 'O(n)', 'is_correct': False},
                    {'text': 'O(log n)', 'is_correct': False},
                    {'text': 'O(n²)', 'is_correct': False},
                ]
            },
            {
                'question_text': 'Which data structure uses LIFO (Last In First Out)?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'Stack', 'is_correct': True},
                    {'text': 'Queue', 'is_correct': False},
                    {'text': 'Array', 'is_correct': False},
                    {'text': 'Linked List', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is the main advantage of a linked list over an array?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'Dynamic size and efficient insertions/deletions', 'is_correct': True},
                    {'text': 'Faster random access', 'is_correct': False},
                    {'text': 'Uses less memory', 'is_correct': False},
                    {'text': 'Easier to implement', 'is_correct': False},
                ]
            },
        ]
        self._create_questions(category, questions)

    def _create_webdev_questions(self, category):
        questions = [
            {
                'question_text': 'What does HTML stand for?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'HyperText Markup Language', 'is_correct': True},
                    {'text': 'High Tech Modern Language', 'is_correct': False},
                    {'text': 'Home Tool Markup Language', 'is_correct': False},
                    {'text': 'Hyperlinks and Text Markup Language', 'is_correct': False},
                ]
            },
            {
                'question_text': 'Which CSS property is used to change text color?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'options': [
                    {'text': 'color', 'is_correct': True},
                    {'text': 'text-color', 'is_correct': False},
                    {'text': 'font-color', 'is_correct': False},
                    {'text': 'text-style', 'is_correct': False},
                ]
            },
            {
                'question_text': 'What is the box model in CSS?',
                'difficulty': 'medium',
                'points': 20,
                'time_limit': 45,
                'options': [
                    {'text': 'Content, padding, border, and margin', 'is_correct': True},
                    {'text': 'A way to create boxes in HTML', 'is_correct': False},
                    {'text': 'A CSS framework', 'is_correct': False},
                    {'text': 'A JavaScript library', 'is_correct': False},
                ]
            },
        ]
        self._create_questions(category, questions)

    def _create_questions(self, category, questions):
        for q_data in questions:
            question, created = Question.objects.get_or_create(
                category=category,
                question_text=q_data['question_text'],
                defaults={
                    'difficulty': q_data['difficulty'],
                    'points': q_data['points'],
                    'time_limit': q_data['time_limit'],
                    'is_active': True
                }
            )
            
            if created:
                # Create options
                for opt_data in q_data['options']:
                    QuestionOption.objects.create(
                        question=question,
                        option_text=opt_data['text'],
                        is_correct=opt_data['is_correct']
                    )
                self.stdout.write(f'  - Created question: {question.question_text[:50]}...')
