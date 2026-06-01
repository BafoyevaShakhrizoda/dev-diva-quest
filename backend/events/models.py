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
