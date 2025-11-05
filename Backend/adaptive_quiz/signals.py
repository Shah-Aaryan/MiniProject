# adaptive_quiz/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserSkillProfile

@receiver(post_save, sender=User)
def create_skill_profile(sender, instance, created, **kwargs):
    """Create skill profile when new user is created"""
    if created:
        UserSkillProfile.objects.create(user=instance)