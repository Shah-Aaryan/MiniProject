# portfolio/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Portfolio, PersonalInfo
from django.utils.text import slugify

@receiver(pre_save, sender=Portfolio)
def generate_unique_slug(sender, instance, **kwargs):
    """Generate unique slug for portfolio"""
    if not instance.slug:
        instance.slug = slugify(instance.title)
        original_slug = instance.slug
        counter = 1
        while Portfolio.objects.filter(slug=instance.slug).exclude(id=instance.id).exists():
            instance.slug = f"{original_slug}-{counter}"
            counter += 1
