from django.contrib import admin
from .models import SkillTest, Question


class QuestionAdmin(admin.ModelAdmin):
    list_display = ['role', 'question_text', 'difficulty', 'created_at']
    list_filter = ['role', 'difficulty', 'created_at']
    search_fields = ['question_text']
    readonly_fields = ['created_at']


class SkillTestAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'result_level', 'score', 'created_at']
    list_filter = ['role', 'result_level', 'created_at']
    search_fields = ['user__email', 'role']
    readonly_fields = ['created_at']
