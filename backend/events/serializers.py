from rest_framework import serializers
from .models import Community, Event, NewsArticle


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'summary', 'external_url', 'location', 'starts_at', 'sort_order']


class EventAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'summary',
            'external_url',
            'location',
            'starts_at',
            'is_active',
            'sort_order',
            'created_at',
        ]
        read_only_fields = ['created_at']


class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = [
            'id',
            'title',
            'summary',
            'external_url',
            'source',
            'published_at',
            'sort_order',
        ]


class NewsArticleAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = [
            'id',
            'title',
            'summary',
            'external_url',
            'source',
            'published_at',
            'is_active',
            'sort_order',
            'created_at',
        ]
        read_only_fields = ['created_at']


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'external_url',
            'community_type',
            'sort_order',
        ]


class CommunityAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'external_url',
            'community_type',
            'is_active',
            'sort_order',
            'created_at',
        ]
        read_only_fields = ['created_at']
