from django.core.management.base import BaseCommand
from skills.models import Question


class Command(BaseCommand):
    help = 'Load sample skill test questions'

    def handle(self, *args, **options):
        questions_data = {
            'frontend': [
                {
                    'question_text': 'What is the purpose of React hooks?',
                    'options': [
                        'To manage state and lifecycle in functional components',
                        'To create class components',
                        'To handle routing',
                        'To style components'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'Which CSS property is used to create flexbox layouts?',
                    'options': [
                        'display: flex',
                        'position: relative',
                        'float: left',
                        'margin: auto'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is the Virtual DOM?',
                    'options': [
                        'A JavaScript representation of the real DOM',
                        'A database for storing DOM elements',
                        'A CSS framework',
                        'A type of web browser'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'Which method is used to prevent default event behavior in React?',
                    'options': [
                        'e.preventDefault()',
                        'e.stopPropagation()',
                        'e.stopDefault()',
                        'e.cancelBubble()'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is the purpose of useCallback hook?',
                    'options': [
                        'To memoize callback functions',
                        'To memoize values',
                        'To fetch data',
                        'To handle side effects'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is JSX?',
                    'options': [
                        'JavaScript XML syntax extension',
                        'JavaScript library',
                        'CSS framework',
                        'Database language'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'Which hook is used for side effects in React?',
                    'options': [
                        'useEffect',
                        'useState',
                        'useContext',
                        'useReducer'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is prop drilling?',
                    'options': [
                        'Passing props through multiple component levels',
                        'Creating reusable components',
                        'Managing application state',
                        'Handling API calls'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is the purpose of React.memo?',
                    'options': [
                        'To memoize functional components',
                        'To create class components',
                        'To handle routing',
                        'To manage state'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is the Context API used for?',
                    'options': [
                        'To share data between components without prop drilling',
                        'To style components globally',
                        'To handle API requests',
                        'To create animations'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is lazy loading in React?',
                    'options': [
                        'Loading components only when needed',
                        'Loading all components at once',
                        'Caching components',
                        'Preloading components'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is the purpose of useReducer hook?',
                    'options': [
                        'To manage complex state logic',
                        'To handle API calls',
                        'To create animations',
                        'To style components'
                    ],
                    'difficulty': 'hard'
                }
            ],
            'backend': [
                {
                    'question_text': 'What is REST API?',
                    'options': [
                        'Architectural style for designing networked applications',
                        'Database management system',
                        'Programming language',
                        'CSS framework'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What does CRUD stand for?',
                    'options': [
                        'Create, Read, Update, Delete',
                        'Create, Remove, Update, Display',
                        'Connect, Read, Upload, Download',
                        'Copy, Run, Use, Delete'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is middleware in Django?',
                    'options': [
                        'Hooks that process requests and responses',
                        'Database connections',
                        'HTML templates',
                        'CSS files'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is JWT authentication?',
                    'options': [
                        'Token-based authentication method',
                        'Password hashing technique',
                        'Database encryption',
                        'Session management'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is database indexing?',
                    'options': [
                        'Data structure that improves query speed',
                        'Backup system for databases',
                        'Migration tool',
                        'Security feature'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is an ORM?',
                    'options': [
                        'Object-Relational Mapping tool',
                        'Database management system',
                        'API framework',
                        'CSS preprocessor'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is SQL injection?',
                    'options': [
                        'Code injection technique that exploits database vulnerabilities',
                        'Database backup method',
                        'Performance optimization technique',
                        'Data migration tool'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is a database transaction?',
                    'options': [
                        'Sequence of operations performed as a single unit',
                        'Database backup process',
                        'Data validation method',
                        'Query optimization technique'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is caching?',
                    'options': [
                        'Storing frequently accessed data for faster retrieval',
                        'Database backup strategy',
                        'Data encryption method',
                        'API rate limiting'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is microservices architecture?',
                    'options': [
                        'Building applications as small independent services',
                        'Single large application structure',
                        'Database design pattern',
                        'Frontend framework'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is API rate limiting?',
                    'options': [
                        'Controlling the number of API requests',
                        'Database connection pooling',
                        'Caching strategy',
                        'Load balancing technique'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is database sharding?',
                    'options': [
                        'Distributing data across multiple databases',
                        'Creating database backups',
                        'Optimizing database queries',
                        'Database indexing technique'
                    ],
                    'difficulty': 'hard'
                }
            ],
            'fullstack': [
                {
                    'question_text': 'What is the MERN stack?',
                    'options': [
                        'MongoDB, Express, React, Node.js',
                        'MySQL, Express, React, nginx',
                        'MongoDB, Express, Vue, Node.js',
                        'MariaDB, Express, React, Node.js'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is CORS?',
                    'options': [
                        'Security feature for cross-origin requests',
                        'Database connection method',
                        'CSS framework',
                        'JavaScript library'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is the purpose of environment variables?',
                    'options': [
                        'To store configuration data separately from code',
                        'To style web pages',
                        'To create animations',
                        'To handle user authentication'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is containerization?',
                    'options': [
                        'Packaging applications with their dependencies',
                        'Writing CSS code',
                        'Creating databases',
                        'Managing user sessions'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is CI/CD?',
                    'options': [
                        'Continuous Integration/Continuous Deployment',
                        'Code Inspection/Code Documentation',
                        'Client Interface/Client Database',
                        'Cloud Integration/Cloud Deployment'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is a RESTful API?',
                    'options': [
                        'API that follows REST architectural principles',
                        'Database query language',
                        'Frontend framework',
                        'CSS preprocessor'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'question_text': 'What is GraphQL?',
                    'options': [
                        'Query language for APIs',
                        'Database technology',
                        'Frontend framework',
                        'CSS framework'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is serverless architecture?',
                    'options': [
                        'Running code without managing servers',
                        'Dedicated server hosting',
                        'Database management system',
                        'Load balancing technique'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is a CDN?',
                    'options': [
                        'Content Delivery Network for distributed content',
                        'Database management tool',
                        'Code deployment platform',
                        'Security firewall'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is API versioning?',
                    'options': [
                        'Managing different versions of an API',
                        'Database version control',
                        'Code version tracking',
                        'Deployment management'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'question_text': 'What is load balancing?',
                    'options': [
                        'Distributing network traffic across multiple servers',
                        'Database optimization technique',
                        'Caching strategy',
                        'Security measure'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'question_text': 'What is a monolithic application?',
                    'options': [
                        'Single-tier application with all components combined',
                        'Distributed system architecture',
                        'Microservices-based application',
                        'Client-server application'
                    ],
                    'difficulty': 'hard'
                }
            ]
        }

        for role, questions in questions_data.items():
            for q_data in questions:
                Question.objects.get_or_create(
                    role=role,
                    question_text=q_data['question_text'],
                    defaults={
                        'options': q_data['options'],
                        'correct_answer': 0,
                        'difficulty': q_data['difficulty']
                    }
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully loaded sample questions')
        )
