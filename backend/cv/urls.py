from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_cv, name='generate_cv'),
    path('my-cvs/', views.get_cvs, name='my_cvs'),
    path('cvs/<int:pk>/', views.cv_detail, name='cv_detail'),
    path('templates/', views.get_templates, name='templates'),
]
