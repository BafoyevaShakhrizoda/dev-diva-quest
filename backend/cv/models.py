from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cvs')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    telegram = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    summary = models.TextField()
    experience = models.JSONField(default=list)
    education = models.JSONField(default=list)
    projects = models.JSONField(default=list)
    certifications = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    generated_cv = models.TextField(blank=True, help_text="AI-generated professional CV content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.name} CV"


class CVTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    template_content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
