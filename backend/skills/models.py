from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SkillTest(models.Model):
    ROLE_CHOICES = [
        ('frontend', 'Frontend Developer'),
        ('backend', 'Backend Developer'),
        ('fullstack', 'Full Stack Developer'),
        ('mobile', 'Mobile Developer'),
        ('devops', 'DevOps Engineer'),
        ('designer', 'UI/UX Designer'),
    ]
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('junior', 'Junior'),
        ('middle', 'Middle'),
        ('senior', 'Senior'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_tests')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    questions = models.JSONField()
    answers = models.JSONField()
    result_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    feedback = models.TextField()
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.role} - {self.result_level}"


class Question(models.Model):
    ROLE_CHOICES = [
        ('frontend', 'Frontend Developer'),
        ('backend', 'Backend Developer'),
        ('fullstack', 'Full Stack Developer'),
        ('mobile', 'Mobile Developer'),
        ('devops', 'DevOps Engineer'),
        ('designer', 'UI/UX Designer'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    question_text = models.TextField()
    options = models.JSONField()
    correct_answer = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['role', 'difficulty', 'id']

    def __str__(self):
        return f"{self.role} - {self.question_text[:50]}..."
