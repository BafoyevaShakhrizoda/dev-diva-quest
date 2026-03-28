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
- `EMAIL_HOST_USER`: Your email address (Gmail recommended)
- `EMAIL_HOST_PASSWORD`: Your email app password
- `GOOGLE_AI_API_KEY`: Your Google Gemini API key
- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- Database credentials

**⚠️ CRITICAL: Email Verification Setup**
For user email verification to work, you MUST configure email credentials. See `EMAIL_SETUP.md` for detailed instructions.

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

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration (returns message about email verification)
- `POST /api/users/login/` - User login (returns auth token)
- `POST /api/users/logout/` - User logout
- `GET /verify-email/<uidb64>/<token>/` - Verify email address (accessible from frontend)
- `POST /api/users/resend-verification/` - Resend verification email
- `GET /api/users/profile/` - Get user profile (requires token)
- `PATCH /api/users/profile/update/` - Update user profile (requires token)

**Authentication**: All endpoints except register/login/verify-email require an Authorization header:
```
Authorization: Token <your-token>
```

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
