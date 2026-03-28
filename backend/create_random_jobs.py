import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_diva_quest.settings')
django.setup()

from jobs.models import Job
from django.contrib.auth import get_user_model

User = get_user_model()

# Random job data
random_jobs = [
    {
        "title": "React Native Developer",
        "company": "MobileTech Solutions",
        "description": "We're looking for an experienced React Native developer to join our mobile team. You'll work on cutting-edge mobile applications for iOS and Android.",
        "requirements": "3+ years of React Native experience, strong JavaScript/TypeScript skills, experience with state management (Redux/MobX), understanding of mobile UI/UX principles.",
        "role": "mobile",
        "experience_level": "middle",
        "location": "Tashkent",
        "salary_min": 8000000,
        "salary_max": 12000000,
        "remote": True
    },
    {
        "title": "Python Backend Developer",
        "company": "DataFlow Systems",
        "description": "Join our backend team to build scalable APIs and data processing systems. You'll work with Django, PostgreSQL, and cloud technologies.",
        "requirements": "4+ years of Python experience, Django framework expertise, PostgreSQL knowledge, REST API design, experience with Docker and AWS.",
        "role": "backend",
        "experience_level": "middle",
        "location": "Remote",
        "salary_min": 9000000,
        "salary_max": 14000000,
        "remote": True
    },
    {
        "title": "Frontend Vue.js Developer",
        "company": "WebCraft Studio",
        "description": "We need a talented Vue.js developer to create amazing user interfaces. You'll work on modern web applications with the latest frontend technologies.",
        "requirements": "2+ years of Vue.js experience, JavaScript/TypeScript proficiency, Vue 3 composition API, state management (Pinia/Vuex), responsive design.",
        "role": "frontend",
        "experience_level": "junior",
        "location": "Samarkand",
        "salary_min": 5000000,
        "salary_max": 7000000,
        "remote": False
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudTech Solutions",
        "description": "Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS and containerization is required.",
        "requirements": "3+ years of DevOps experience, AWS services, Docker, Kubernetes, CI/CD pipelines, infrastructure as code (Terraform).",
        "role": "devops",
        "experience_level": "middle",
        "location": "Tashkent",
        "salary_min": 10000000,
        "salary_max": 15000000,
        "remote": True
    },
    {
        "title": "Java Spring Boot Developer",
        "company": "Enterprise Systems",
        "description": "We need an experienced Java developer to build enterprise-grade applications. You'll work with Spring Boot, microservices, and cloud technologies.",
        "requirements": "4+ years of Java experience, Spring Boot framework, microservices architecture, PostgreSQL, REST APIs, unit testing.",
        "role": "java",
        "experience_level": "senior",
        "location": "Tashkent",
        "salary_min": 12000000,
        "salary_max": 18000000,
        "remote": False
    },
    {
        "title": "JavaScript Full Stack Developer",
        "company": "Tech Innovations",
        "description": "Join our team as a full stack JavaScript developer. You'll work on both frontend and backend using Node.js, React, and modern JavaScript frameworks.",
        "requirements": "3+ years of JavaScript experience, Node.js, React/Next.js, Express.js, MongoDB/PostgreSQL, REST APIs.",
        "role": "javascript",
        "experience_level": "middle",
        "location": "Remote",
        "salary_min": 8000000,
        "salary_max": 12000000,
        "remote": True
    },
    {
        "title": "SQL Database Administrator",
        "company": "DataCorp Solutions",
        "description": "We're looking for a skilled DBA to manage our database systems. You'll work with PostgreSQL, MySQL, and optimize database performance.",
        "requirements": "3+ years of database administration experience, PostgreSQL/MySQL expertise, performance tuning, backup strategies, SQL optimization.",
        "role": "sql",
        "experience_level": "middle",
        "location": "Tashkent",
        "salary_min": 9000000,
        "salary_max": 13000000,
        "remote": False
    },
    {
        "title": "MongoDB Developer",
        "company": "NoSQL Tech",
        "description": "Join our team to work with MongoDB and build scalable data solutions. Experience with document databases and data modeling is required.",
        "requirements": "2+ years of MongoDB experience, NoSQL database design, aggregation pipelines, indexing strategies, Node.js/Python.",
        "role": "mongodb",
        "experience_level": "junior",
        "location": "Remote",
        "salary_min": 6000000,
        "salary_max": 9000000,
        "remote": True
    },
    {
        "title": "Docker & Kubernetes Specialist",
        "company": "ContainerTech",
        "description": "We need a containerization specialist to help us deploy and manage applications using Docker and Kubernetes.",
        "requirements": "2+ years of Docker experience, Kubernetes orchestration, container security, CI/CD integration, cloud platforms.",
        "role": "docker",
        "experience_level": "middle",
        "location": "Tashkent",
        "salary_min": 8500000,
        "salary_max": 12000000,
        "remote": True
    },
    {
        "title": "AWS Cloud Engineer",
        "company": "CloudFirst Solutions",
        "description": "Looking for an AWS certified engineer to manage our cloud infrastructure and help us migrate to AWS services.",
        "requirements": "3+ years of AWS experience, EC2, S3, RDS, Lambda, CloudFormation, security best practices, cost optimization.",
        "role": "aws",
        "experience_level": "senior",
        "location": "Remote",
        "salary_min": 11000000,
        "salary_max": 16000000,
        "remote": True
    }
]

print("Creating random jobs...")

# Create jobs
created_jobs = []
for job_data in random_jobs:
    job = Job.objects.create(**job_data)
    created_jobs.append(job)
    print(f"✅ Created: {job.title} at {job.company}")

print(f"\n🎉 Successfully created {len(created_jobs)} random jobs!")

# Show total jobs
total_jobs = Job.objects.filter(active=True).count()
print(f"📊 Total active jobs: {total_jobs}")

# Show jobs by role
print("\n📋 Jobs by role:")
from collections import Counter
job_roles = Job.objects.filter(active=True).values_list('role', flat=True)
role_counts = Counter(job_roles)
for role, count in role_counts.items():
    print(f"  {role}: {count} jobs")
