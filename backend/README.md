# Dev Diva Quest Backend

Django REST Framework backend for the Dev Diva Quest application.

## Features

- User authentication and profile management
- Skill assessment and evaluation
- CV generation with AI
- RESTful API endpoints

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Setup

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Update `.env` with your actual values:
- `SECRET_KEY`: Generate a new Django secret key
- `GOOGLE_AI_API_KEY`: Your Google AI (Gemini) API key
- Database credentials

### 4. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE dev_diva_quest;
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

Vakansiyalar (`Job`) va kerak bo‘lsa skill savollari (`Question`) **admin** orqali kiritiladi. Avvalgi `create_*.py` demo skriptlari va `load_questions` / `load_jobs` management buyruqlari olib tashlangan — bitta manba admin.

**Namuna vakansiyalar (ixtiyoriy, dev):** migratsiyadan keyin:

```bash
python manage.py loaddata sample_jobs
```

Bu `jobs/fixtures/sample_jobs.json` dagi 10 ta turli rol (frontend, backend, fullstack, mobile, devops, designer) bo‘yicha ish qo‘shadi (`pk` 501–510). Takroriy yuklash mavjud yozuvlarni yangilaydi.

### Gemini kalit ishlamasa

Kalit **`backend/.env`** ichida bo‘lishi kerak (`GOOGLE_AI_API_KEY=...`). Loyiha ildizidagi frontend `.env` ga yozilsa **Django o‘qimaydi**.

Tekshiruv (venv bilan):

```bash
cd backend && source venv/bin/activate
python manage.py check_gemini
```

Agar model xatosi bo‘lsa, `.env` da `GEMINI_MODEL=gemini-2.0-flash` yoki `gemini-1.5-flash` ni sinab ko‘ring.

### 7. Run Development Server

**Muhim:** loyiha papkasida virtual env yoqing yoki to‘g‘ridan-to‘g‘ri `venv` Python ishlating — aks holda `ModuleNotFoundError: google.generativeai` chiqadi.

```bash
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

Yoki aktivatsiyasiz:

```bash
./venv/bin/python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/me/` - Get current user info
- `GET/PUT /api/users/profile/` - User profile

### Skills
- `GET /api/skills/questions/?role=<role>` - Get skill test questions
- `POST /api/skills/evaluate/` - Evaluate skill test
- `GET /api/skills/my-tests/` - Get user's test results
- `GET /api/skills/tests/<id>/` - Get specific test result

### CV
- `POST /api/cv/generate/` - Generate CV
- `GET /api/cv/my-cvs/` - Get user's CVs
- `GET/PUT/DELETE /api/cv/cvs/<id>/` - CV operations
- `GET /api/cv/templates/` - Get CV templates

### Admin
- `http://localhost:8000/admin/` - Django admin interface

## Testing

```bash
python manage.py test
```

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` with your domain
3. Use environment variables for sensitive data
4. Set up proper database configuration
5. Configure static files serving
6. Use HTTPS
7. Set up proper logging

## License

MIT License
