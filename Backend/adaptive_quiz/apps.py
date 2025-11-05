# adaptive_quiz/apps.py
from django.apps import AppConfig


class AdaptiveQuizConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adaptive_quiz'
    verbose_name = 'Adaptive Quiz System'
    
    def ready(self):
        import adaptive_quiz.signals