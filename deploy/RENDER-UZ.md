# DevGirlzz — Render.com deploy (O‘zbekcha)

Agar Render ni avval ishlatgan bo‘lsangiz, bu qisqa yo‘riqnoma — faqat **DevGirlzz** uchun kerakli farqlar.

## Nima qayerda?

| Qism | Hosting | Eslatma |
|------|---------|---------|
| **Backend (Django)** | **Render** | Siz allaqachon bilasiz |
| **Frontend (React)** | Vercel yoki Cloudflare Pages | Render faqat API |
| **PostgreSQL** | **Neon** (bepul) | Render da Postgres endi bepul emas |

---

## 1. Neon — maʼlumotlar bazasi (5 daqiqa)

Render Postgres pullik. Shuning uchun **Neon** ishlating:

1. [neon.tech](https://neon.tech) → yangi project
2. **Connection string** nusxalang → `DATABASE_URL`

---

## 2. Render — Web Service

### Variant A: `render.yaml` (tavsiya)

Repoda `render.yaml` tayyor. Render dashboard:

1. **New → Blueprint**
2. GitHub repongizni tanlang
3. Quyidagilarni **qo‘lda** kiriting (sync: false):
   - `DATABASE_URL` — Neon string
   - `GOOGLE_AI_API_KEY` — yangi kalit ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))
   - `ADMIN_PASSWORD` — admin parol

Deploy paytida avtomatik: `migrate`, `create_admin`, `collectstatic`.

### Variant B: Qo‘lda Web Service

| Sozlama | Qiymat |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `chmod +x render_build.sh render_start.sh && ./render_build.sh` |
| Start Command | `./render_start.sh` |
| Health Check Path | `/` |

**Environment variables:**

```
DEBUG=False
SECRET_KEY=<uzun-random>
DATABASE_URL=<neon-connection-string>
GOOGLE_AI_API_KEY=<yangi-kalit>
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=https://devgirlzz.com.uz
BACKEND_URL=https://devgirlzz-api.onrender.com
CORS_ALLOWED_ORIGINS=https://devgirlzz.com.uz,https://www.devgirlzz.com.uz
CSRF_TRUSTED_ORIGINS=https://devgirlzz.com.uz,https://www.devgirlzz.com.uz
ALLOWED_HOSTS=api.devgirlzz.com.uz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<kuchli-parol>
```

> `RENDER_EXTERNAL_HOSTNAME` avtomatik qo‘shiladi — `*.onrender.com` host ishlaydi.

---

## 3. Custom domain (api.devgirlzz.com.uz)

Render → Service → **Settings → Custom Domains** → `api.devgirlzz.com.uz`

DNS (domen provayderingizda):

```
CNAME  api  →  devgirlzz-api.onrender.com
```

Keyin `BACKEND_URL` ni yangilang:

```
BACKEND_URL=https://api.devgirlzz.com.uz
```

---

## 4. Frontend (Vercel) — Render URL ni ulash

Vercel → `frontend` root → Environment Variables:

```
VITE_API_BASE_URL=https://devgirlzz-api.onrender.com/api/
VITE_DJANGO_ORIGIN=https://devgirlzz-api.onrender.com
VITE_API_DIRECT=true
```

Custom domain qo‘ysangiz:

```
VITE_API_BASE_URL=https://api.devgirlzz.com.uz/api/
VITE_DJANGO_ORIGIN=https://api.devgirlzz.com.uz
```

---

## 5. Tekshirish

```bash
curl https://devgirlzz-api.onrender.com/
# {"status":"ok","message":"Dev Diva Quest API is running"}
```

Brauzerda:
- https://devgirlzz.com.uz — ochiladi
- Login / register
- `/cv` — AI (Gemini kalit yangi bo‘lishi shart)
- `/admin` — staff login

---

## Render da tez-tez uchraydigan muammolar

| Muammo | Sabab | Yechim |
|--------|-------|--------|
| **502 / Deploy failed** | `migrate` yoki `collectstatic` xato | Render → Logs. `DATABASE_URL` to‘g‘rimi? |
| **CORS error** | Frontend URL ro‘yxatda yo‘q | `CORS_ALLOWED_ORIGINS` ga `https://devgirlzz.com.uz` qo‘shing |
| **DisallowedHost** | Custom domain yo‘q | `ALLOWED_HOSTS` ga `api.devgirlzz.com.uz` qo‘shing |
| **AI ishlamaydi** | Gemini kalit eskirgan | Yangi `GOOGLE_AI_API_KEY`, redeploy |
| **Birinchi so‘rov sekin** | Free tier uxlaydi | Normal — 30–60 soniya kutish yoki paid plan |
| **Avatar/upload yo‘qoladi** | Free disk vaqtinchalik | Productionda S3/Cloudinary kerak bo‘lishi mumkin |

---

## Render Shell (migrate qayta kerak bo‘lsa)

Render dashboard → Service → **Shell**:

```bash
python manage.py migrate
python manage.py create_admin
python manage.py check_gemini
```

---

## Xulosa

```
Neon (DB)  →  DATABASE_URL
Render     →  Django API  (render.yaml yoki qo‘lda)
Vercel     →  devgirlzz.com.uz frontend
```

Agar avvalgi Render loyihangizda **Postgres** ishlatgan bo‘lsangiz — endi Neon ga o‘tkazing (Render Postgres bepul emas).

Keyingi qadam: GitHub ga push → Render da Blueprint yoki yangi Web Service oching.
