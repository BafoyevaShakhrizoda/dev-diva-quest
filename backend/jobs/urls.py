from django.urls import path
from . import views

urlpatterns = [
    path('recommended/', views.recommended_jobs, name='recommended_jobs'),
    path('all/', views.all_jobs, name='all_jobs'),
    path('apply/<int:job_id>/', views.apply_job, name='apply_job'),
    path('my-applications/', views.my_applications, name='my_applications'),
    path('applications/<int:job_id>/', views.job_applications, name='job_applications'),
    path('applications/<int:application_id>/status/', views.update_application_status, name='update_application_status'),
    path('save/<int:job_id>/', views.save_job_match, name='save_job_match'),
]
