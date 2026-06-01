# DevGirlzz

Career platform for women in IT — skill assessments, CV builder, job matching, and curated resources.

## Project structure

```
DevGirlzz/
├── frontend/          # React + Vite + TypeScript (SPA)
├── backend/           # Django 5 + Django REST Framework
├── docker-compose.yml # Run frontend + backend + Postgres together
└── README.md
```

## Quick start with Docker

```bash
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:8080 |
| API      | http://localhost:8000/api/ |
| Admin panel (SPA) | http://localhost:8080/admin |
| Django admin | http://localhost:8000/admin/ |

**Default admin credentials** (change in production):

- Username: `admin`
- Password: `DevGirlzz@Admin2026`

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` in `docker-compose.yml` or `backend/.env`.

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py create_admin
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:8080 — API requests proxy to Django on port 8000.

## Admin panel

Staff users can sign in at `/admin` on the frontend to:

- View platform statistics (users, jobs, tests, CVs, events)
- See what permissions their account has
- Open Django admin for full CRUD operations

Create or reset the admin account:

```bash
cd backend
python manage.py create_admin
# or with custom credentials:
python manage.py create_admin --username myadmin --password 'SecurePass123!'
```

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui |
| Backend | Django 5, DRF, Token auth, Gemini AI |
| Database | SQLite (local), PostgreSQL (Docker/production) |

## FAQ

User-facing FAQ with answers in English, Russian, and Uzbek: `/faq`

## Deploy to devgirlzz.com.uz

| Guide | Description |
|-------|-------------|
| [deploy/README.md](deploy/README.md) | Production env vars |
| [deploy/FREE-HOSTING-UZ.md](deploy/FREE-HOSTING-UZ.md) | Bepul hosting umumiy |
| **[deploy/RENDER-UZ.md](deploy/RENDER-UZ.md)** | **Render (avval ishlatganlar uchun qisqa)** |

Privacy policy: `/privacy` · PDF: `/documents/Privacy_Policy_DevGirlzz.pdf`

## Deploy to devgirlzz.com.uz (short)

| Env file | Purpose |
|----------|---------|
| `deploy/frontend.env.example` | Vercel env vars for devgirlzz.com.uz |
| `deploy/backend.env.example` | Server env for api.devgirlzz.com.uz |

**Before deploy:** renew `GOOGLE_AI_API_KEY` in `backend/.env` — run `python manage.py check_gemini`.

## License

MIT
