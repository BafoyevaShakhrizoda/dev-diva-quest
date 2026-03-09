from django.urls import path
from . import views

urlpatterns = [
    path('recommended/', views.recommended_jobs, name='recommended_jobs'),
    path('all/', views.all_jobs, name='all_jobs'),
    path('save/<int:job_id>/', views.save_job_match, name='save_job_match'),
]
