from django.urls import path

from . import content_views, views

urlpatterns = [
    path('login/', views.admin_login, name='admin-login'),
    path('logout/', views.admin_logout, name='admin-logout'),
    path('me/', views.admin_me, name='admin-me'),
    path('stats/', views.admin_stats, name='admin-stats'),
    path('permissions/', views.admin_permissions, name='admin-permissions'),
    path('events/', content_views.admin_events, name='admin-events'),
    path('events/<int:pk>/', content_views.admin_event_detail, name='admin-event-detail'),
    path('news/', content_views.admin_news, name='admin-news'),
    path('news/<int:pk>/', content_views.admin_news_detail, name='admin-news-detail'),
    path('communities/', content_views.admin_communities, name='admin-communities'),
    path('communities/<int:pk>/', content_views.admin_community_detail, name='admin-community-detail'),
]
