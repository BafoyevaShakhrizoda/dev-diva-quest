import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_diva_quest.settings')
django.setup()

from skills.models import Question

# Extended roles with programming languages
extended_questions = {
    'react': [
        {
            "question_text": "What is React Hooks?",
            "options": ["Functions to use state and lifecycle", "CSS framework", "Database", "Routing"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is JSX?",
            "options": ["JavaScript XML syntax", "CSS language", "Database query", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is useState used for?",
            "options": ["State management", "API calls", "Styling", "Routing"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is useEffect used for?",
            "options": ["Side effects", "State management", "Routing", "Styling"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is React Context?",
            "options": ["Global state management", "Local state", "API calls", "Database"],
            "correct_answer": 0,
            "difficulty": "medium"
        }
    ],
    
    'vue': [
        {
            "question_text": "What is Vue.js?",
            "options": ["JavaScript framework", "CSS framework", "Database", "Programming language"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Vue template syntax?",
            "options": ["HTML-based templates", "JavaScript only", "CSS only", "SQL queries"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Vue Router?",
            "options": ["Official routing library", "State management", "API calls", "Database"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Vuex?",
            "options": ["State management library", "Routing library", "API client", "Database"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Vue Composition API?",
            "options": ["Alternative to Options API", "CSS framework", "Database", "Routing"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'python': [
        {
            "question_text": "What is Python?",
            "options": ["High-level programming language", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Django?",
            "options": ["Python web framework", "Database", "JavaScript library", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Flask?",
            "options": ["Python micro-framework", "Database", "JavaScript library", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Python decorator?",
            "options": ["Function modifier", "Database query", "CSS style", "HTML tag"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Python GIL?",
            "options": ["Global Interpreter Lock", "Database lock", "CSS lock", "HTML lock"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'java': [
        {
            "question_text": "What is Java?",
            "options": ["Object-oriented programming language", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is JVM?",
            "options": ["Java Virtual Machine", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Spring Boot?",
            "options": ["Java framework", "Database", "CSS framework", "JavaScript library"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Java Interface?",
            "options": ["Abstract type definition", "Database", "CSS style", "HTML tag"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Java Garbage Collection?",
            "options": ["Memory management", "Database cleanup", "CSS cleanup", "HTML cleanup"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'javascript': [
        {
            "question_text": "What is JavaScript?",
            "options": ["Programming language for web", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Node.js?",
            "options": ["JavaScript runtime", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is npm?",
            "options": ["Package manager for JavaScript", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is JavaScript Promise?",
            "options": ["Object for async operations", "Database", "CSS style", "HTML tag"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is JavaScript Closure?",
            "options": ["Function with access to outer scope", "Database", "CSS style", "HTML tag"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'sql': [
        {
            "question_text": "What is SQL?",
            "options": ["Database query language", "Programming language", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is SELECT in SQL?",
            "options": ["Query to retrieve data", "Insert data", "Update data", "Delete data"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is JOIN in SQL?",
            "options": ["Combine tables", "Create table", "Delete table", "Update table"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is PRIMARY KEY?",
            "options": ["Unique identifier", "Foreign key", "Index", "Constraint"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is SQL Transaction?",
            "options": ["Sequence of operations", "Single query", "Database backup", "Data export"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'mongodb': [
        {
            "question_text": "What is MongoDB?",
            "options": ["NoSQL database", "SQL database", "Programming language", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is MongoDB Document?",
            "options": ["BSON record", "SQL row", "JSON file", "XML file"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is MongoDB Collection?",
            "options": ["Group of documents", "SQL table", "Database", "Index"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is MongoDB Index?",
            "options": ["Data structure for queries", "Primary key", "Foreign key", "View"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is MongoDB Aggregation?",
            "options": ["Data processing pipeline", "Simple query", "Database backup", "Data export"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'docker': [
        {
            "question_text": "What is Docker?",
            "options": ["Containerization platform", "Database", "Programming language", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Docker Container?",
            "options": ["Running instance of image", "Database", "Programming language", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Docker Image?",
            "options": ["Template for containers", "Database", "Programming language", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Dockerfile?",
            "options": ["Instructions to build image", "Database file", "CSS file", "HTML file"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Docker Compose?",
            "options": ["Multi-container tool", "Single container", "Database", "Programming language"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'aws': [
        {
            "question_text": "What is AWS?",
            "options": ["Cloud computing platform", "Database", "Programming language", "CSS framework"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is EC2?",
            "options": ["Virtual server", "Database", "Storage", "Network"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is S3?",
            "options": ["Object storage", "Database", "Virtual server", "Network"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Lambda?",
            "options": ["Serverless computing", "Database", "Virtual server", "Storage"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is CloudFormation?",
            "options": ["Infrastructure as code", "Database", "Virtual server", "Storage"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ],
    
    'testing': [
        {
            "question_text": "What is Software Testing?",
            "options": ["Process of verifying software", "Database design", "CSS styling", "HTML coding"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Unit Testing?",
            "options": ["Testing individual components", "Testing whole system", "Testing UI", "Testing database"],
            "correct_answer": 0,
            "difficulty": "easy"
        },
        {
            "question_text": "What is Integration Testing?",
            "options": ["Testing component interactions", "Testing individual components", "Testing UI", "Testing database"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Selenium?",
            "options": ["Web automation tool", "Database", "CSS framework", "HTML framework"],
            "correct_answer": 0,
            "difficulty": "medium"
        },
        {
            "question_text": "What is Test-Driven Development?",
            "options": ["Write tests before code", "Write code before tests", "No testing", "Only UI testing"],
            "correct_answer": 0,
            "difficulty": "hard"
        }
    ]
}

# Create questions for each role
for role, questions in extended_questions.items():
    print(f"Creating {len(questions)} questions for {role}...")
    
    for q_data in questions:
        Question.objects.get_or_create(
            role=role,
            question_text=q_data['question_text'],
            defaults={
                'options': q_data['options'],
                'correct_answer': q_data['correct_answer'],
                'difficulty': q_data['difficulty']
            }
        )

print("\n✅ Extended questions created!")

# Show final statistics
print(f"\n📊 Final Statistics:")
print(f"Total questions: {Question.objects.count()}")

all_roles = Question.objects.values_list('role', flat=True).distinct()
for role in sorted(all_roles):
    count = Question.objects.filter(role=role).count()
    print(f"{role}: {count} questions")

print(f"\n🎯 Available roles: {', '.join(sorted(all_roles))}")
