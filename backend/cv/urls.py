from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_cv, name='generate_cv'),
    path('my-cvs/', views.my_cvs, name='my_cvs'),
    path('cvs/<int:cv_id>/', views.cv_detail, name='cv_detail'),
    path('templates/', views.templates, name='templates'),
]
