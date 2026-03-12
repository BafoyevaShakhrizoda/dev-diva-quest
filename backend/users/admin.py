from django.contrib import admin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'email_verified', 'created_at']
    list_filter = ['email_verified', 'created_at', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'experience_years', 'phone']
    list_filter = ['experience_years', 'location']
    search_fields = ['user__email', 'user__first_name', 'location']
    readonly_fields = []
