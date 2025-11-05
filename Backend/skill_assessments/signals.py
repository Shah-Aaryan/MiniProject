# skill_assessments/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SkillAssessment, UserSkillBadge
import uuid

@receiver(post_save, sender=UserSkillBadge)
def set_verification_code(sender, instance, created, **kwargs):
    """Set verification code for new badges"""
    if created and not instance.verification_code:
        instance.verification_code = str(uuid.uuid4())
        instance.save()