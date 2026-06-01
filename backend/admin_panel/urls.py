from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.admin_login, name='admin-login'),
    path('logout/', views.admin_logout, name='admin-logout'),
    path('me/', views.admin_me, name='admin-me'),
    path('stats/', views.admin_stats, name='admin-stats'),
    path('permissions/', views.admin_permissions, name='admin-permissions'),
]
