import os
import django
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_diva_quest.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import Job, JobMatch
from skills.models import Question, SkillTest
from cv.models import CV, CVTemplate

User = get_user_model()

def create_demo_data():
    print("Creating demo data for AI integration demo...")
    
    # Create demo user
    user, created = User.objects.get_or_create(
        email='demo@devgirlzz.com',
        defaults={
            'username': 'demo',
            'first_name': 'Demo',
            'last_name': 'User',
            'email_verified': True
        }
    )
    
    if created:
        user.set_password('demo123')
        user.save()
        print("✅ Demo user created: demo@devgirlzz.com / demo123")
    else:
        print("✅ Demo user already exists")
    
    # Create demo jobs
    jobs_data = [
        {
            'title': 'Frontend Developer',
            'company': 'Tech Company',
            'role': 'frontend',
            'experience_level': 'middle',
            'location': 'Tashkent',
            'remote': True,
            'description': 'We are looking for a skilled Frontend Developer...',
            'requirements': 'React, TypeScript, 3+ years experience',
            'salary_min': 5000000,
            'salary_max': 8000000,
            'active': True
        },
        {
            'title': 'Backend Developer',
            'company': 'StartUp Inc',
            'role': 'backend',
            'experience_level': 'middle',
            'location': 'Remote',
            'remote': True,
            'description': 'Looking for experienced Backend Developer...',
            'requirements': 'Python, Django, PostgreSQL, APIs',
            'salary_min': 6000000,
            'salary_max': 10000000,
            'active': True
        },
        {
            'title': 'Full Stack Developer',
            'company': 'Digital Agency',
            'role': 'fullstack',
            'experience_level': 'senior',
            'location': 'Tashkent',
            'remote': False,
            'description': 'Senior Full Stack Developer needed...',
            'requirements': 'React, Node.js, 5+ years experience',
            'salary_min': 8000000,
            'salary_max': 12000000,
            'active': True
        }
    ]
    
    for job_data in jobs_data:
        job, created = Job.objects.get_or_create(
            title=job_data['title'],
            company=job_data['company'],
            defaults=job_data
        )
        if created:
            print(f"✅ Job created: {job.title}")
    
    # Create demo questions
    questions_data = [
        {
            'role': 'frontend',
            'question_text': 'What is the purpose of React hooks?',
            'options': '["To manage state and lifecycle in functional components", "To style components", "To handle routing", "To connect to databases"]',
            'correct_answer': 0,
            'difficulty': 'easy'
        },
        {
            'role': 'frontend',
            'question_text': 'Which method is used to update state in React?',
            'options': '["setState()", "updateState()", "modifyState()", "changeState()"]',
            'correct_answer': 0,
            'difficulty': 'easy'
        },
        {
            'role': 'frontend',
            'question_text': 'What is the Virtual DOM?',
            'options': '["A JavaScript representation of the real DOM", "A database for React apps", "A styling system", "A testing framework"]',
            'correct_answer': 0,
            'difficulty': 'medium'
        },
        {
            'role': 'backend',
            'question_text': 'What is REST API?',
            'options': '["An architectural style for web services", "A database system", "A frontend framework", "A programming language"]',
            'correct_answer': 0,
            'difficulty': 'easy'
        },
        {
            'role': 'backend',
            'question_text': 'What does CRUD stand for?',
            'options': '["Create, Read, Update, Delete", "Connect, Read, Upload, Download", "Create, Run, Use, Delete", "Connect, Run, Update, Display"]',
            'correct_answer': 0,
            'difficulty': 'easy'
        }
    ]
    
    for q_data in questions_data:
        question, created = Question.objects.get_or_create(
            question_text=q_data['question_text'],
            defaults=q_data
        )
        if created:
            print(f"✅ Question created: {question.role}")
    
    # Create demo CV template
    template_data = {
        'name': 'Professional Developer',
        'description': 'Clean and professional template for developers',
        'template_content': 'Professional CV template with sections for summary, experience, education, skills, and projects.',
        'is_active': True
    }
    
    template, created = CVTemplate.objects.get_or_create(
        name=template_data['name'],
        defaults=template_data
    )
    if created:
        print(f"✅ CV template created: {template.name}")
    
    print("\n🎉 Demo data creation complete!")
    print("\n📱 Demo Credentials:")
    print("Email: demo@devgirlzz.com")
    print("Password: demo123")
    print("\n🔗 URLs:")
    print("Admin: http://localhost:8000/admin/")
    print("API: http://localhost:8000/api/")
    print("Skills API: http://localhost:8000/api/skills/questions/?role=frontend")

if __name__ == '__main__':
    create_demo_data()
