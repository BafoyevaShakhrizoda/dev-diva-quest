from rest_framework import serializers
from .models import CV, CVTemplate


class CVSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CV
        fields = ['id', 'user_email', 'name', 'role', 'email', 'phone', 'location',
                 'github', 'linkedin', 'telegram', 'website', 'summary', 'experience',
                 'education', 'projects', 'certifications', 'skills', 'languages',
                 'generated_cv', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_email', 'generated_cv', 'created_at', 'updated_at']


class CVCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['name', 'role', 'email', 'phone', 'location', 'github', 'linkedin',
                 'telegram', 'website', 'summary', 'experience', 'education', 'projects',
                 'certifications', 'skills', 'languages']


class CVGenerationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    role = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    location = serializers.CharField(max_length=100, required=False, allow_blank=True)
    github = serializers.CharField(max_length=500, required=False, allow_blank=True)
    linkedin = serializers.CharField(max_length=500, required=False, allow_blank=True)
    telegram = serializers.CharField(max_length=100, required=False, allow_blank=True)
    website = serializers.CharField(max_length=500, required=False, allow_blank=True)
    summary = serializers.CharField(max_length=5000, required=False, allow_blank=True, default="")
    experience = serializers.JSONField(required=False)
    education = serializers.JSONField(required=False)
    projects = serializers.JSONField(required=False)
    certifications = serializers.JSONField(required=False)
    skills = serializers.JSONField(required=False)
    languages = serializers.JSONField(required=False)


class CVTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVTemplate
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
