from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.get_questions, name='get_questions'),
    path('evaluate/', views.evaluate_skill, name='evaluate_skill'),
    path('my-tests/', views.my_tests, name='my_tests'),
    path('tests/<int:test_id>/', views.test_detail, name='test_detail'),
]
