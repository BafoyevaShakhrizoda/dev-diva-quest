from django.contrib import admin
from .models import Event


class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'starts_at', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'summary', 'location')
    ordering = ('sort_order', '-starts_at')
