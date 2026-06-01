# DevGirlzz deploy — devgirlzz.com.uz

## Arxitektura

| Xizmat | Domen | Hosting (tavsiya) |
|--------|-------|-------------------|
| Frontend (React SPA) | `https://devgirlzz.com.uz` | **Vercel** yoki Cloudflare Pages |
| Backend API (Django) | `https://api.devgirlzz.com.uz` | **Fly.io** / Render / VPS |
| PostgreSQL | — | **Neon** (bepul) |
| Admin panel (SPA) | `https://devgirlzz.com.uz/admin` | Frontend bilan birga |
| Django admin | `https://api.devgirlzz.com.uz/admin/` | Backend bilan birga |

---

## 0. Oldindan tayyorlash

1. GitHub repoga push qiling: `https://github.com/BafoyevaShakhrizoda/dev-diva-quest`
2. [Google AI Studio](https://aistudio.google.com/apikey) dan yangi `GOOGLE_AI_API_KEY`
3. [Neon](https://neon.tech) dan `DATABASE_URL` (PostgreSQL)
4. `devgirlzz.com.uz` domeni DNS paneliga kirish huquqi

Lokal tekshiruv:

```bash
cd backend
python manage.py check_gemini
```

---

## Variant A — Tavsiya (Vercel + Fly.io + Neon)

Render/Railway/PythonAnywhere o‘rniga **Fly.io** — custom domain, tezroq uyg‘onadi.

### A1. Neon (DB)

1. neon.tech → New project
2. Connection string nusxalang → `DATABASE_URL`

### A2. Fly.io (backend)

```bash
cd backend
curl -L https://fly.io/install.sh | sh   # fly CLI
fly auth login
fly launch --no-deploy                     # app nomi: devgirlzz-api
fly secrets set \
  SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(50))')" \
  DATABASE_URL="postgres://..." \
  GOOGLE_AI_API_KEY="..." \
  ADMIN_PASSWORD="kuchli-parol"
fly deploy
fly certs add api.devgirlzz.com.uz
```

DNS (domen provayderingizda):

```
CNAME  api  →  devgirlzz-api.fly.dev
```

Fly ko‘rsatgan aniq CNAME qiymatini ishlating.

### A3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. **Root Directory:** `frontend`
3. Environment Variables:

```
VITE_API_BASE_URL=https://api.devgirlzz.com.uz/api/
VITE_DJANGO_ORIGIN=https://api.devgirlzz.com.uz
VITE_API_DIRECT=true
```

4. Deploy → **Domains** → `devgirlzz.com.uz`, `www.devgirlzz.com.uz`

DNS (Vercel ko‘rsatadi, odatda):

```
A      @    →  76.76.21.21
CNAME  www  →  cname.vercel-dns.com
```

---

## Variant B — Render + Vercel + Neon

Repoda `render.yaml` tayyor.

1. Render → **New → Blueprint** → GitHub repo
2. Qo‘lda kiriting: `DATABASE_URL`, `GOOGLE_AI_API_KEY`, `ADMIN_PASSWORD`
3. Render → Settings → Custom Domains → `api.devgirlzz.com.uz`
4. DNS: `CNAME api → devgirlzz-api.onrender.com`
5. Frontend — Variant A3 bilan bir xil

---

## Variant C — Bitta VPS (eng barqaror)

Oracle Cloud Free / Hetzner / DigitalOcean — ikkala domen bitta serverda.

```bash
git clone https://github.com/BafoyevaShakhrizoda/dev-diva-quest.git
cd dev-diva-quest
cp deploy/backend.env.example backend/.env
# backend/.env ni to‘ldiring

docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml up -d --build
```

DNS:

```
A  devgirlzz.com.uz      →  SERVER_IP
A  api.devgirlzz.com.uz  →  SERVER_IP
A  www.devgirlzz.com.uz   →  SERVER_IP
```

Caddy avtomatik HTTPS beradi (`deploy/Caddyfile`).

---

## DNS xulosa (barcha variantlar)

| Subdomain | Maqsad | Qiymat |
|-----------|--------|--------|
| `@` / `devgirlzz.com.uz` | Frontend | Vercel A yoki CNAME |
| `www` | Frontend | Vercel CNAME |
| `api` | Backend API | Fly/Render CNAME yoki VPS A |

---

## Deploy keyin tekshirish

- [ ] https://devgirlzz.com.uz ochiladi
- [ ] Ro‘yxatdan o‘tish / kirish ishlaydi
- [ ] `/cv` — AI CV + PDF
- [ ] Skill test — AI savollar
- [ ] `/admin` — staff login
- [ ] Console da CORS xatosi yo‘q
- [ ] `curl https://api.devgirlzz.com.uz/` → `{"status":"ok",...}`

---

## Tez-tez muammolar

| Muammo | Yechim |
|--------|--------|
| CORS error | `CORS_ALLOWED_ORIGINS` ga `https://devgirlzz.com.uz` qo‘shing |
| DisallowedHost | `ALLOWED_HOSTS` ga `api.devgirlzz.com.uz` qo‘shing |
| AI ishlamaydi | Yangi `GOOGLE_AI_API_KEY`, redeploy |
| 502 / timeout | DB URL to‘g‘rimi? `fly logs` / Render Logs |
| Birinchi so‘rov sekin | Free tier uxlaydi — Fly.io yoki VPS yaxshiroq |

---

## Qaysi hostingni tanlash?

| Platform | Custom domain | Bepul | Eslatma |
|----------|---------------|-------|---------|
| **Vercel** | ✅ | ✅ | Frontend uchun eng oson |
| **Fly.io** | ✅ | ✅* | Backend, Render o‘rniga |
| **Render** | ✅ | ✅ | Bilasiz, 15 daq uxlaydi |
| **Neon** | — | ✅ | PostgreSQL |
| **Oracle Free VPS** | ✅ | ✅ | Doimiy, lekin sozlash ko‘proq |
| **Cloudflare Pages** | ✅ | ✅ | Frontend alternativ |

*Fly.io karta talab qilishi mumkin, lekin free allowance bor.
