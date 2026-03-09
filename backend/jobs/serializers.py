from rest_framework import serializers
from .models import Job, JobMatch


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'description', 'requirements', 
                 'role', 'experience_level', 'location', 'salary_min', 'salary_max', 
                 'remote', 'active', 'created_at']
        read_only_fields = ['id', 'created_at']


class JobMatchSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = JobMatch
        fields = ['id', 'job', 'match_score', 'skill_level', 'is_recommended', 'created_at']
        read_only_fields = ['id', 'created_at']
