import os
import django
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_diva_quest.settings')
django.setup()

from skills.models import Question

def create_python_backend_questions():
    print("Creating Python Backend Junior questions...")
    
    questions_data = [
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "decorator" nima va qanday ishlaydi?',
            'option_a': 'Funksiyani qayta ishlash uchun',
            'option_b': 'Class ni kengaytirish uchun',
            'option_c': 'Database ga ulanish uchun',
            'option_d': 'Frontend bilan bog\'lanish uchun',
            'correct_answer': 'a',
            'explanation': 'Decorator - funksiyani yoki metodni kengaytiradigan yoki o\'zgartiradigan funktsiya. U @ sintaksisi bilan ishlatiladi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Django da "middleware" nima?',
            'option_a': 'Frontend component',
            'option_b': 'Request va response processing qatlami',
            'option_c': 'Database model',
            'option_d': 'URL routing',
            'correct_answer': 'b',
            'explanation': 'Middleware - request va response o\'rtasida ishlaydigan qatlamlar. Authentication, logging, security kabi vazifalarni bajaradi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "list comprehension" qanday yoziladi?',
            'option_a': '[x for x in range(10)]',
            'option_b': 'list(range(10))',
            'option_c': 'range(10).list()',
            'option_d': 'for x in range(10): list.append(x)',
            'correct_answer': 'a',
            'explanation': 'List comprehension - ro\'yxatni qisqa va o\'qilishi oson usulda yaratish. [x for x in iterable if condition] formatida yoziladi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Django da "ORM" nima degani?',
            'option_a': 'Object-Relational Mapping',
            'option_b': 'Object Request Model',
            'option_c': 'Online Resource Manager',
            'option_d': 'Object Response Method',
            'correct_answer': 'a',
            'explanation': 'ORM - Object-Relational Mapping, database jadvallarini Python obyektlari sifatida ishlash imkonini beradi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "__init__" metodining vazifasi nima?',
            'option_a': 'Class obyektini yaratishda chaqiriladi',
            'option_b': 'Classni o\'chirishda chaqiriladi',
            'option_c': 'Classni meras qilib olishda chaqiriladi',
            'option_d': 'Classni stringga aylantirishda chaqiriladi',
            'correct_answer': 'a',
            'explanation': '__init__ - class constructor metodi. Yangi obyekt yaratilganda avtomatik chaqiriladi va boshlang\'ich qiymatlarni o\'rnatadi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "try-except" bloki qanday ishlaydi?',
            'option_a': 'Xatolarni ushlash va boshqarish uchun',
            'option_b': 'Funksiyani chaqirish uchun',
            'option_c': 'Database bilan ishlash uchun',
            'option_d': 'Loop yaratish uchun',
            'correct_answer': 'a',
            'explanation': 'Try-except - xatolarni ushlash va ularni boshqarish uchun ishlatiladi. Dastlarning ishlashini to\'xtatmaydi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Django da "views" nima vazifani bajaradi?',
            'option_a': 'HTTP requestlarni qabul qilish va response qaytarish',
            'option_b': 'Database jadvallarini yaratish',
            'option_c': 'Static fayllarni saqlash',
            'option_d': 'User sessionlarni boshqarish',
            'correct_answer': 'a',
            'explanation': 'Views - HTTP requestlarni qabul qiladi, ularni qayta ishlaydi va HTTP response qaytaradi. MVT arxitekturasining V qismi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "lambda" funktsiyasi nima?',
            'option_a': 'Bir qatorli anonim funktsiya',
            'option_b': 'Katta funktsiya',
            'option_c': 'Class method',
            'option_d': 'Database query',
            'correct_answer': 'a',
            'explanation': 'Lambda - bir qatorli anonim funktsiya. lambda arguments: expression formatida yoziladi va kichik operatsiyalar uchun ishlatiladi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Django da "models" nima?',
            'option_a': 'Database strukturasini aniqlash',
            'option_b': 'URL routing',
            'option_c': 'HTML template',
            'option_d': 'JavaScript code',
            'correct_answer': 'a',
            'explanation': 'Models - database jadvallarining strukturasini va maydonlarini aniqlaydi. ORM orqali database bilan ishlash imkonini beradi.'
        },
        {
            'role': 'backend',
            'language': 'python',
            'level': 'junior',
            'question_text': 'Python da "dictionary" qanday yaratiladi?',
            'option_a': '{\"key\": \"value\"}',
            'option_b': '[\"key\", \"value\"]',
            'option_c': '(\"key\", \"value\")',
            'option_d': '\"key\": \"value\"',
            'correct_answer': 'a',
            'explanation': 'Dictionary - kalit-qiymat juftliklaridan tashkil topgan ma\'lumotlar turi. {key: value} formatida yoziladi.'
        }
    ]
    
    created_count = 0
    for q_data in questions_data:
        question, created = Question.objects.get_or_create(
            role=q_data['role'],
            language=q_data['language'],
            level=q_data['level'],
            question_text=q_data['question_text'],
            defaults={
                'option_a': q_data['option_a'],
                'option_b': q_data['option_b'],
                'option_c': q_data['option_c'],
                'option_d': q_data['option_d'],
                'correct_answer': q_data['correct_answer'],
                'explanation': q_data['explanation']
            }
        )
        if created:
            created_count += 1
            print(f'✅ Question created: {q_data["question_text"][:50]}...')
    
    print(f'\\n🎯 Total Python Backend Junior questions created: {created_count}')
    print(f'📊 Total Python Backend Junior questions in DB: {Question.objects.filter(role="backend", language="python", level="junior").count()}')

if __name__ == '__main__':
    create_python_backend_questions()
