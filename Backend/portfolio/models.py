# portfolio/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator
from django.utils.text import slugify
import uuid

class PortfolioTemplate(models.Model):
    """Portfolio design templates"""
    TEMPLATE_TYPES = [
        ('minimal', 'Minimal'),
        ('creative', 'Creative'),
        ('professional', 'Professional'),
        ('modern', 'Modern'),
        ('technical', 'Technical')
    ]
    
    name = models.CharField(max_length=100)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    description = models.TextField()
    preview_image = models.ImageField(
        upload_to='portfolio_templates/', 
        null=True, 
        blank=True
    )
    html_template = models.TextField(help_text="HTML template code")
    css_template = models.TextField(help_text="CSS template code")
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['template_type', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.template_type}"


class Portfolio(models.Model):
    """Main portfolio model"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='portfolios'
    )
    template = models.ForeignKey(
        PortfolioTemplate, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=250)
    is_public = models.BooleanField(default=True)
    custom_domain = models.CharField(max_length=255, blank=True, null=True)
    theme_color = models.CharField(max_length=7, default='#3B82F6')
    font_family = models.CharField(max_length=100, default='Inter, sans-serif')
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'slug']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while Portfolio.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


class PersonalInfo(models.Model):
    """Personal information for portfolio"""
    portfolio = models.OneToOneField(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='personal_info'
    )
    full_name = models.CharField(max_length=200)
    headline = models.CharField(max_length=300)
    bio = models.TextField()
    profile_picture = models.ImageField(
        upload_to='portfolio_images/', 
        null=True, 
        blank=True
    )
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    resume_file = models.FileField(
        upload_to='resumes/', 
        null=True, 
        blank=True
    )
    
    def __str__(self):
        return self.full_name


class SocialLink(models.Model):
    """Social media links"""
    PLATFORM_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('github', 'GitHub'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
        ('medium', 'Medium'),
        ('behance', 'Behance'),
        ('dribbble', 'Dribbble'),
        ('stackoverflow', 'Stack Overflow'),
        ('other', 'Other')
    ]
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='social_links'
    )
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.URLField()
    display_name = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.platform} - {self.portfolio.user.username}"


class Project(models.Model):
    """Portfolio projects"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='projects'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(
        upload_to='project_images/', 
        null=True, 
        blank=True
    )
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    technologies = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_ongoing = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_featured', 'order', '-start_date']
    
    def __str__(self):
        return f"{self.title} - {self.portfolio.user.username}"


class ProjectImage(models.Model):
    """Additional images for projects"""
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    image = models.ImageField(upload_to='project_images/')
    caption = models.CharField(max_length=300, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Image for {self.project.title}"


class Experience(models.Model):
    """Work experience"""
    EMPLOYMENT_TYPE = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance')
    ]
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='experiences'
    )
    company = models.CharField(max_length=200)
    company_logo = models.ImageField(
        upload_to='company_logos/', 
        null=True, 
        blank=True
    )
    position = models.CharField(max_length=200)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    achievements = models.JSONField(default=list)
    skills_used = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-is_current', '-start_date']
    
    def __str__(self):
        return f"{self.position} at {self.company}"


class Education(models.Model):
    """Education details"""
    DEGREE_TYPES = [
        ('high-school', 'High School'),
        ('associate', 'Associate Degree'),
        ('bachelor', 'Bachelor\'s Degree'),
        ('master', 'Master\'s Degree'),
        ('phd', 'PhD'),
        ('certificate', 'Certificate'),
        ('bootcamp', 'Bootcamp'),
        ('diploma', 'Diploma')
    ]
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='education'
    )
    institution = models.CharField(max_length=200)
    institution_logo = models.ImageField(
        upload_to='institution_logos/', 
        null=True, 
        blank=True
    )
    degree = models.CharField(max_length=20, choices=DEGREE_TYPES)
    field_of_study = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    activities = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.degree} in {self.field_of_study} from {self.institution}"


class Skill(models.Model):
    """Skills"""
    PROFICIENCY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert')
    ]
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='skills'
    )
    name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS)
    category = models.CharField(max_length=100)
    years_of_experience = models.IntegerField(default=0)
    icon = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['category', 'order']
    
    def __str__(self):
        return f"{self.name} - {self.proficiency}"


class Certification(models.Model):
    """Certifications"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='certifications'
    )
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=200, blank=True)
    credential_url = models.URLField(blank=True)
    certificate_image = models.ImageField(
        upload_to='certificates/', 
        null=True, 
        blank=True
    )
    
    class Meta:
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"


class Testimonial(models.Model):
    """Client/colleague testimonials"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='testimonials'
    )
    author_name = models.CharField(max_length=200)
    author_position = models.CharField(max_length=200)
    author_company = models.CharField(max_length=200, blank=True)
    author_image = models.ImageField(
        upload_to='testimonial_images/', 
        null=True, 
        blank=True
    )
    content = models.TextField()
    rating = models.IntegerField(default=5)
    relationship = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-is_featured', 'order', '-created_at']
    
    def __str__(self):
        return f"Testimonial from {self.author_name}"


class PortfolioAnalytics(models.Model):
    """Analytics tracking"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='analytics'
    )
    date = models.DateField()
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    avg_time_on_page = models.FloatField(default=0.0)
    bounce_rate = models.FloatField(default=0.0)
    referrer_data = models.JSONField(default=dict)
    device_data = models.JSONField(default=dict)
    location_data = models.JSONField(default=dict)
    
    class Meta:
        unique_together = ['portfolio', 'date']
        ordering = ['-date']
        verbose_name_plural = "Portfolio Analytics"
    
    def __str__(self):
        return f"{self.portfolio.title} - {self.date}"


class ContactMessage(models.Model):
    """Contact form messages"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='contact_messages'
    )
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Message from {self.name} - {self.created_at.date()}"