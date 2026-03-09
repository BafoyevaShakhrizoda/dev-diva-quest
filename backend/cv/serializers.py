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
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    location = serializers.CharField(max_length=100)
    github = serializers.URLField(required=False, allow_blank=True)
    linkedin = serializers.URLField(required=False, allow_blank=True)
    telegram = serializers.CharField(max_length=100, required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    summary = serializers.CharField(max_length=5000)
    experience = serializers.ListField(required=False)
    education = serializers.ListField(required=False)
    projects = serializers.ListField(required=False)
    certifications = serializers.ListField(required=False)
    skills = serializers.ListField(required=False)
    languages = serializers.ListField(required=False)


class CVTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVTemplate
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
