# Deploy DevGirlzz → devgirlzz.com.uz

**To‘liq yo‘riqnoma:** [DEPLOY-DEVGIRLZZ-UZ.md](./DEPLOY-DEVGIRLZZ-UZ.md)

## Architecture

| Service | URL | Host |
|---------|-----|------|
| Frontend (SPA) | https://devgirlzz.com.uz | Vercel (root: `frontend/`) |
| Backend API | https://api.devgirlzz.com.uz | VPS / Render / Railway + Docker |
| Django admin | https://api.devgirlzz.com.uz/admin/ | Same as backend |
| Admin dashboard | https://devgirlzz.com.uz/admin | Frontend SPA |

## 1. Fix AI (Gemini) — required before deploy

CV builder and skill tests need a **valid** Google AI key in **backend** only:

```bash
cd backend
source venv/bin/activate
python manage.py check_gemini
```

If you see `API key expired`:

1. Open https://aistudio.google.com/apikey
2. Create a new API key
3. Put it in `backend/.env`: `GOOGLE_AI_API_KEY=...`
4. Restart Django: `python manage.py runserver`

## 2. Deploy backend (api.devgirlzz.com.uz)

```bash
git clone <repo> && cd DevGirlzz
cp deploy/backend.env.example backend/.env
# Edit backend/.env — SECRET_KEY, DATABASE_URL, GOOGLE_AI_API_KEY, ADMIN_PASSWORD

docker compose up -d db backend
```

**DNS:** Add `A` or `CNAME` record `api.devgirlzz.com.uz` → your server IP.

## 3. Deploy frontend (devgirlzz.com.uz)

### Vercel

1. Import repo, set **Root Directory** to `frontend`
2. Environment variables (from `deploy/frontend.env.example`):
   - `VITE_API_BASE_URL` = `https://api.devgirlzz.com.uz/api/`
   - `VITE_DJANGO_ORIGIN` = `https://api.devgirlzz.com.uz`
   - `VITE_API_DIRECT` = `true`
3. Add domain `devgirlzz.com.uz` in Vercel → Domains

## 4. Post-deploy checklist

- [ ] https://devgirlzz.com.uz loads
- [ ] Sign in / register works
- [ ] `/cv` — sign in, generate CV, PDF downloads
- [ ] Skill test generates questions (AI)
- [ ] `/admin` — staff login
- [ ] No CORS errors in browser console
