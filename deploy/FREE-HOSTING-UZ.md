# DevGirlzz — bepul deploy (devgirlzz.com.uz)

Bu loyiha **2 qismdan** iborat: **frontend** (React) va **backend** (Django + PostgreSQL). Bepul hostingda ikkalasini alohida joylashtirasiz.

## Tavsiya etilgan bepul kombinatsiya (2026)

| Qism | Xizmat | Narx | Eslatma |
|------|--------|------|---------|
| **Frontend** | [Vercel](https://vercel.com) | Bepul | `devgirlzz.com.uz` domeni |
| **Backend** | [Render](https://render.com) | Bepul tier | 15 daq uxlab qoladi — birinchi so‘rov sekin |
| **Database** | [Neon](https://neon.tech) | Bepul | PostgreSQL, Render bilan ulash oson |

**Alternativlar** (bepul yoki juda arzon):

| Rol | Variantlar |
|-----|------------|
| Frontend | Cloudflare Pages, Netlify, GitHub Pages (faqat statik — API proxy kerak) |
| Backend | Fly.io (free allowance), Koyeb, PythonAnywhere (cheklangan), Railway (kredit) |
| DB | Supabase Postgres (free), ElephantSQL (free, kichik) |

---

## 1-qadam: PostgreSQL (Neon — bepul)

1. [neon.tech](https://neon.tech) → Sign up → **New project**
2. **Connection string** nusxalang, masalan:
   ```
   postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Bu string — backend `DATABASE_URL` bo‘ladi.

---

## 2-qadam: Backend (Render — bepul)

1. [render.com](https://render.com) → GitHub repongizni ulang
2. **New → Web Service**
3. Sozlamalar:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```bash
     gunicorn dev_diva_quest.wsgi:application --bind 0.0.0.0:$PORT
     ```
4. **Environment Variables** (`deploy/backend.env.example` dan):

   | Key | Qiymat |
   |-----|--------|
   | `SECRET_KEY` | uzun random string |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `devgirlzz-api.onrender.com,api.devgirlzz.com.uz` |
   | `DATABASE_URL` | Neon connection string |
   | `FRONTEND_URL` | `https://devgirlzz.com.uz` |
   | `BACKEND_URL` | `https://SIZNING-RENDER-URL.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://devgirlzz.com.uz,https://www.devgirlzz.com.uz` |
   | `CSRF_TRUSTED_ORIGINS` | `https://devgirlzz.com.uz,https://www.devgirlzz.com.uz` |
   | `GOOGLE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `ADMIN_PASSWORD` | kuchli parol |

5. Deploy tugagach URL oling, masalan: `https://devgirlzz-api.onrender.com`

6. **Custom domain (ixtiyoriy):** Render → Settings → `api.devgirlzz.com.uz`  
   DNS da `CNAME api → devgirlzz-api.onrender.com`

7. Bir marta **Shell** yoki local:
   ```bash
   python manage.py migrate
   python manage.py create_admin
   ```

> **Render free tier:** 15 daqiqa faolsizlikdan keyin uxlaydi. Birinchi ochish 30–60 soniya cho‘zilishi mumkin. Doimiy ish uchun paid plan yoki Fly.io/Koyeb ko‘rib chiqing.

---

## 3-qadam: Frontend (Vercel — bepul)

1. [vercel.com](https://vercel.com) → Import Git repo
2. **Root Directory:** `frontend`
3. **Environment Variables:**

   | Key | Qiymat |
   |-----|--------|
   | `VITE_API_BASE_URL` | `https://devgirlzz-api.onrender.com/api/` (yoki `https://api.devgirlzz.com.uz/api/`) |
   | `VITE_DJANGO_ORIGIN` | `https://devgirlzz-api.onrender.com` |
   | `VITE_API_DIRECT` | `true` |

4. Deploy → **Domains** → `devgirlzz.com.uz` va `www.devgirlzz.com.uz` qo‘shing
5. Domen provayderingizda (masalan `.uz` registrar):
   - `A` yoki `CNAME` — Vercel ko‘rsatmalariga qarang

---

## 4-qadam: Tekshirish

- [ ] https://devgirlzz.com.uz ochiladi
- [ ] Ro‘yxatdan o‘tish / kirish
- [ ] `/cv` — AI + PDF (Gemini kalit yangi bo‘lishi kerak)
- [ ] `/privacy` — siyosat + PDF yuklab olish
- [ ] `/admin` — staff login
- [ ] Brauzer Console da CORS xatosi yo‘q

---

## Boshqa bepul variantlar

### A) Cloudflare Pages (frontend) + Render (backend)
Cloudflare ham bepul, tez CDN. Build:
- **Build command:** `npm run build`
- **Output:** `dist`
- Env o‘zgaruvchilar Vercel bilan bir xil.

### B) Fly.io (backend + DB bitta joyda)
```bash
cd backend
fly launch
fly secrets set DATABASE_URL=... GOOGLE_AI_API_KEY=...
fly deploy
```
Free allowance bor, lekin karta talab qilinishi mumkin.

### C) Faqat bitta VPS (eng barqaror, lekin odatda pullik)
Agar bepul VPS topilsa (GitHub Student Pack, Oracle Cloud free tier):
```bash
docker compose up -d
```
`docker-compose.yml` loyihada tayyor.

---

## Oracle Cloud Always Free (doimiy bepul VPS)

Agar Render sekin uxlab qolsa, **Oracle Cloud Free Tier** da VM ochib Docker ishlatish mumkin (karta kerak, lekin to‘lov olinmaydi free limitda):

1. VM yaratish (Ubuntu)
2. Docker o‘rnatish
3. Repo clone → `docker compose up -d`
4. Nginx + Let's Encrypt → `devgirlzz.com.uz` va `api.devgirlzz.com.uz`

---

## Maxfiylik siyosati

- Saytda: `/privacy`
- PDF: `/documents/Privacy_Policy_DevGirlzz.pdf`
- Footer va FAQ dan havola bor

---

## Tez-tez so‘raladigan savollar

**Nega ikkita hosting?**  
Frontend — statik React (Vercel). Backend — Python Django (Render/Fly). Bepul platformalar odatda ikkalasini bir joyda qo‘llab-quvvatlamaydi.

**Gemini kalit qayerda?**  
Faqat **backend** `.env` / Render Environment Variables — `GOOGLE_AI_API_KEY`.

**SQLite ishlatsam bo‘ladimi?**  
Lokal dev uchun ha. Productionda Neon (Postgres) tavsiya — Render restartda SQLite maʼlumot yo‘qolishi mumkin.

**Barcha bepul hostlar tugadimi?**  
Yuqoridagi kombinatsiya (Vercel + Render + Neon) hali ham bepul. Agar Render limiti tugasa — Fly.io yoki Oracle Cloud free VM sinab ko‘ring.
