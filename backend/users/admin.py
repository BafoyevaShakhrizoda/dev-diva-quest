from django.contrib import admin
from .models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'experience_years', 'phone']
    list_filter = ['experience_years', 'location']
    search_fields = ['user__email', 'user__first_name', 'location']
    readonly_fields = []
