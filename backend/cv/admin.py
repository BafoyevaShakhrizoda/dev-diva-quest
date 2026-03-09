from django.contrib import admin
from .models import CV, CVTemplate


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'role', 'created_at', 'updated_at']
    list_filter = ['role', 'created_at', 'updated_at']
    search_fields = ['user__email', 'name', 'role']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CVTemplate)
class CVTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
