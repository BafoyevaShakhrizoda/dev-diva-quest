from rest_framework import serializers
from .models import Job, JobMatch, JobApplication


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company', read_only=True)
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'company_name', 'description', 'requirements', 
                 'role', 'experience_level', 'location', 'salary_min', 'salary_max', 
                 'remote', 'active', 'created_at', 'has_applied']
        read_only_fields = ['id', 'created_at', 'has_applied']
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return JobApplication.objects.filter(user=request.user, job=obj).exists()
        return False


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    cv_title = serializers.CharField(source='cv.title', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'cv', 'cv_title', 'cover_letter', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'applied_at', 'updated_at', 'status']


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['job', 'cv', 'cover_letter']
    
    def validate(self, data):
        user = self.context['request'].user
        job = data['job']
        
        # Check if user already applied
        if JobApplication.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        
        # Check if job is active
        if not job.active:
            raise serializers.ValidationError("This job is no longer active.")
        
        return data


class JobMatchSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = JobMatch
        fields = ['id', 'job', 'match_score', 'skill_level', 'is_recommended', 'created_at']
        read_only_fields = ['id', 'created_at']
