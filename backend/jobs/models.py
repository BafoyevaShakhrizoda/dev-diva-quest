from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Job(models.Model):
    EXPERIENCE_LEVELS = [
        ('beginner', 'Beginner'),
        ('junior', 'Junior'),
        ('middle', 'Middle'),
        ('senior', 'Senior'),
    ]
    
    ROLE_CHOICES = [
        ('frontend', 'Frontend Developer'),
        ('backend', 'Backend Developer'),
        ('fullstack', 'Full Stack Developer'),
        ('mobile', 'Mobile Developer'),
        ('devops', 'DevOps Engineer'),
        ('designer', 'UI/UX Designer'),
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    location = models.CharField(max_length=100)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    remote = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company}"


class JobMatch(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('junior', 'Junior'),
        ('middle', 'Middle'),
        ('senior', 'Senior'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_matches')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='matches')
    match_score = models.IntegerField(help_text="Match percentage from 0-100")
    skill_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    is_recommended = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_score', '-created_at']
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.email} - {self.job.title} ({self.match_score}%)"
