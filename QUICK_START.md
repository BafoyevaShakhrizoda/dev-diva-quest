# ⚡ Quick Start - Get Running in 5 Minutes

## What's Changed?
✅ Email verification fixed  
✅ Login/logout token errors fixed  
✅ CORS & page navigation fixed  

## 🚀 Do This RIGHT NOW (5 minutes)

### Step 1: Get Email Credentials (2 minutes)

Go to: https://myaccount.google.com/apppasswords

1. Select "Mail" and "Windows Computer"
2. Click "Generate"
3. Copy the 16-character password
4. Save it somewhere safe

### Step 2: Update Environment File (2 minutes)

```bash
cd backend/
cp .env.example .env
nano .env   # or open in your editor
```

Update these lines:
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

Save the file (Ctrl+X, Y, Enter if using nano)

### Step 3: Restart Backend (1 minute)

```bash
# Kill current server (Ctrl+C)

# Restart it
python manage.py runserver
```

## ✨ That's It! You're Ready!

---

## Quick Test (Optional)

Register a test user:
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test"
  }'
```

Check your email inbox for verification link.

---

## What to Demo During Presentation

1. **User Registration**
   ```bash
   POST /api/users/register/
   # New user receives verification email ✅
   ```

2. **Email Verification**
   - Click email link: `/verify-email/<uid>/<token>/`
   - User email now verified ✅

3. **User Login**
   ```bash
   POST /api/users/login/
   # Returns: {"user": {...}, "token": "abc123..."}
   ```

4. **Access Protected Endpoint**
   ```bash
   GET /api/users/profile/
   Headers: Authorization: Token abc123...
   # Returns user profile ✅
   ```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Email not received | Check .env has correct Gmail app password |
| Password too short | Use at least 8 chars: "TestPassword123!" |
| Login fails | Make sure user is registered first |
| Token invalid | Restart backend after .env changes |
| CORS errors | Check CORS_ALLOWED_ORIGINS matches your domain |

---

## File Changes Reference

If you want to see what was changed:

**Modified Files:**
- `backend/users/views.py` - Login/logout token fix
- `backend/dev_diva_quest/urls.py` - Email verification endpoint
- `backend/dev_diva_quest/settings.py` - CORS settings
- `backend/.env.example` - Email config example
- `backend/README.md` - Updated documentation

**New Files:**
- `EMAIL_SETUP.md` - Detailed email setup guide
- `URGENT_FIXES_FOR_PRESENTATION.md` - Full fix details
- `CHANGES_SUMMARY.md` - Technical change log
- `QUICK_START.md` - This file

---

## Still Having Issues?

1. **Check the logs** in your terminal
2. **Read `EMAIL_SETUP.md`** for detailed email troubleshooting
3. **Read `URGENT_FIXES_FOR_PRESENTATION.md`** for full context
4. **Restart everything** (kill terminal, open new one)

---

## Navbar Issue (Frontend Only)

**Note**: The "Home and Dashboard are similar" issue is in your React/Vue/Next.js frontend (not this backend).

**Solution**: Remove "Home" from your frontend navbar or make it redirect to Dashboard.

This backend is just an API - it doesn't serve web pages.

---

## You're Ready! 🎉

Go present this project with confidence! The backend is fixed and working. Good luck! 🚀
