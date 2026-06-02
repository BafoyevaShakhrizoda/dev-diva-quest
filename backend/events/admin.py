from django.contrib import admin
from .models import Community, Event, NewsArticle


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'starts_at', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'summary', 'location')
    ordering = ('sort_order', '-starts_at')


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'published_at', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'summary', 'source')
    ordering = ('sort_order', '-published_at')


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'community_type', 'is_active', 'sort_order')
    list_filter = ('is_active', 'community_type')
    search_fields = ('name', 'description')
    ordering = ('sort_order', 'name')
