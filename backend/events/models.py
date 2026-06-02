from django.db import models


class Event(models.Model):
    """Curated IT events (e.g. Uzbekistan). Managed via Django admin."""

    title = models.CharField(max_length=280)
    summary = models.TextField(blank=True)
    external_url = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    starts_at = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', '-starts_at', '-id']
        verbose_name_plural = 'Events'

    def __str__(self):
        return self.title


class NewsArticle(models.Model):
    """Curated news shown on the dashboard. Managed via admin panel."""

    title = models.CharField(max_length=280)
    summary = models.TextField(blank=True)
    external_url = models.URLField(blank=True)
    source = models.CharField(max_length=120, blank=True)
    published_at = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', '-published_at', '-id']
        verbose_name_plural = 'News articles'

    def __str__(self):
        return self.title


class Community(models.Model):
    """Tech communities (Telegram, Discord, etc.) for the dashboard."""

    COMMUNITY_TYPES = [
        ('telegram', 'Telegram'),
        ('discord', 'Discord'),
        ('facebook', 'Facebook'),
        ('linkedin', 'LinkedIn'),
        ('website', 'Website'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    external_url = models.URLField()
    community_type = models.CharField(max_length=32, choices=COMMUNITY_TYPES, default='telegram')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Communities'

    def __str__(self):
        return self.name
