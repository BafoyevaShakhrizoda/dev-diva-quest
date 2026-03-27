from django.contrib import admin
from .models import Job, JobMatch, JobApplication


class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'role', 'experience_level', 'location', 'remote', 'active', 'created_at']
    list_filter = ['role', 'experience_level', 'remote', 'active', 'created_at']
    search_fields = ['title', 'company', 'description', 'requirements']
    readonly_fields = ['created_at', 'updated_at']


class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'status', 'applied_at', 'cv']
    list_filter = ['status', 'applied_at']
    search_fields = ['user__email', 'job__title', 'job__company']
    readonly_fields = ['applied_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'job')


class JobMatchAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_title', 'company', 'match_score', 'skill_level', 'is_recommended', 'created_at']
    list_filter = ['skill_level', 'is_recommended', 'created_at']
    search_fields = ['user__email', 'job__title', 'job__company']
    readonly_fields = ['created_at']
    
    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job Title'
    
    def company(self, obj):
        return obj.job.company
    company.short_description = 'Company'
