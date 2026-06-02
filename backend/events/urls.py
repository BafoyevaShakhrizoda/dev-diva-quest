from django.urls import path
from . import views

urlpatterns = [
    path('', views.event_list, name='event_list'),
    path('news/', views.news_list, name='news_list'),
    path('communities/', views.community_list, name='community_list'),
]
