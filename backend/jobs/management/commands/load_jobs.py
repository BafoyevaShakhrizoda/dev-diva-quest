from django.core.management.base import BaseCommand
from jobs.models import Job


class Command(BaseCommand):
    help = 'Load sample job postings'

    def handle(self, *args, **options):
        jobs_data = [
            {
                'title': 'Junior Frontend Developer',
                'company': 'TechStart Inc',
                'description': 'We are looking for a motivated Junior Frontend Developer to join our growing team.',
                'requirements': 'Basic knowledge of HTML, CSS, JavaScript. Experience with React is a plus. Strong problem-solving skills and willingness to learn.',
                'role': 'frontend',
                'experience_level': 'junior',
                'location': 'Tashkent',
                'salary_min': 3000000,
                'salary_max': 5000000,
                'remote': True
            },
            {
                'title': 'Middle React Developer',
                'company': 'Digital Solutions',
                'description': 'Join our team as a Middle React Developer and work on exciting projects for international clients.',
                'requirements': '3+ years of experience with React and TypeScript. Strong understanding of state management, REST APIs, and modern frontend tools. Experience with Next.js is preferred.',
                'role': 'frontend',
                'experience_level': 'middle',
                'location': 'Tashkent',
                'salary_min': 8000000,
                'salary_max': 12000000,
                'remote': True
            },
            {
                'title': 'Senior Backend Developer',
                'company': 'FinTech Solutions',
                'description': 'We need an experienced Senior Backend Developer to lead our backend team and architect scalable solutions.',
                'requirements': '5+ years of backend development experience. Strong knowledge of Python/Django or Node.js. Experience with microservices, databases, and cloud platforms. Leadership skills required.',
                'role': 'backend',
                'experience_level': 'senior',
                'location': 'Tashkent',
                'salary_min': 15000000,
                'salary_max': 20000000,
                'remote': False
            },
            {
                'title': 'Junior Backend Developer',
                'company': 'StartupHub',
                'description': 'Great opportunity for Junior Backend Developers to grow their skills in a fast-paced startup environment.',
                'requirements': 'Basic knowledge of Python or Node.js. Understanding of databases and APIs. Eagerness to learn and take on new challenges.',
                'role': 'backend',
                'experience_level': 'junior',
                'location': 'Samarkand',
                'salary_min': 2500000,
                'salary_max': 4000000,
                'remote': True
            },
            {
                'title': 'Full Stack Developer',
                'company': 'WebCraft Agency',
                'description': 'We are seeking a talented Full Stack Developer to work on diverse projects for our clients.',
                'requirements': 'Experience with both frontend and backend technologies. Proficiency in React/Next.js and Node.js/Python. Understanding of databases, APIs, and deployment.',
                'role': 'fullstack',
                'experience_level': 'middle',
                'location': 'Tashkent',
                'salary_min': 10000000,
                'salary_max': 15000000,
                'remote': True
            },
            {
                'title': 'Senior Full Stack Developer',
                'company': 'Enterprise Systems',
                'description': 'Lead our development team and build enterprise-grade applications.',
                'requirements': '7+ years of full stack development experience. Expertise in modern frameworks, cloud architecture, and DevOps practices. Strong leadership and communication skills.',
                'role': 'fullstack',
                'experience_level': 'senior',
                'location': 'Tashkent',
                'salary_min': 18000000,
                'salary_max': 25000000,
                'remote': False
            },
            {
                'title': 'Mobile Developer (React Native)',
                'company': 'AppMasters',
                'description': 'Create amazing mobile applications for iOS and Android using React Native.',
                'requirements': '2+ years of React Native experience. Strong JavaScript/TypeScript skills. Understanding of mobile UI/UX principles. Experience with state management and mobile APIs.',
                'role': 'mobile',
                'experience_level': 'middle',
                'location': 'Tashkent',
                'salary_min': 7000000,
                'salary_max': 11000000,
                'remote': True
            },
            {
                'title': 'UI/UX Designer',
                'company': 'Design Studio',
                'description': 'Join our creative team and design beautiful, user-friendly interfaces for web and mobile applications.',
                'requirements': 'Portfolio demonstrating strong UI/UX design skills. Proficiency in Figma, Adobe XD, or similar tools. Understanding of user research and design principles.',
                'role': 'designer',
                'experience_level': 'middle',
                'location': 'Tashkent',
                'salary_min': 6000000,
                'salary_max': 9000000,
                'remote': True
            },
            {
                'title': 'DevOps Engineer',
                'company': 'CloudTech',
                'description': 'Help us build and maintain scalable cloud infrastructure for our applications.',
                'requirements': 'Experience with AWS, Docker, Kubernetes. Strong knowledge of CI/CD pipelines. Understanding of infrastructure as code and monitoring tools.',
                'role': 'devops',
                'experience_level': 'middle',
                'location': 'Tashkent',
                'salary_min': 12000000,
                'salary_max': 17000000,
                'remote': True
            },
            {
                'title': 'Frontend Developer Intern',
                'company': 'Code Academy',
                'description': 'Great opportunity for beginners to start their career in web development.',
                'requirements': 'Basic HTML, CSS, and JavaScript knowledge. Strong desire to learn and grow. No professional experience required.',
                'role': 'frontend',
                'experience_level': 'beginner',
                'location': 'Tashkent',
                'salary_min': 1000000,
                'salary_max': 2000000,
                'remote': False
            }
        ]

        for job_data in jobs_data:
            Job.objects.get_or_create(
                title=job_data['title'],
                company=job_data['company'],
                defaults=job_data
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully loaded sample jobs')
        )
