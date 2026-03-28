# Email Verification Setup Guide for DevGirlzz

## Critical Issue: Email verification is failing because credentials are missing

Your `.env` file is missing the email service credentials. Here's how to fix it:

## Option 1: Gmail SMTP (Recommended for Development)

### Step 1: Enable Less Secure Apps
1. Go to your Google Account: https://myaccount.google.com/
2. Go to Security → App passwords
3. Select "Mail" and "Windows Computer" (or your device)
4. Generate a new 16-character app password
5. Copy this password (it will be shown only once)

### Step 2: Update your `.env` file
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

## Option 2: SendGrid (Free - 100 emails/day)

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com (free tier available)
2. Go to Settings → API Keys
3. Create a new API key
4. Copy the API key

### Step 2: Update your `.env` file
```
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@devgirlzz.com.uz
```

### Step 3: Install sendgrid backend
```bash
pip install sendgrid-django
```

### Step 4: Update settings.py to use SendGrid
Uncomment the SendGrid section in `backend/dev_diva_quest/settings.py`

## Option 3: Mailgun (Free - 5,000 emails/month)

### Step 1: Create Mailgun Account
1. Sign up at https://www.mailgun.com/ (free tier available)
2. Get your API key from the dashboard
3. Set up a verified domain

### Step 2: Update your `.env` file
```
MAILGUN_API_KEY=your-mailgun-api-key
DEFAULT_FROM_EMAIL=noreply@devgirlzz.com.uz
```

## Testing Email Verification

After setting up credentials, test with:

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test"
  }'
```

Check your email for the verification link. Click it to verify.

## Troubleshooting

### "SMTP authentication failed"
- Double-check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
- Gmail: Use 16-character app password, not your regular password
- Gmail: Enable "Less Secure Apps" in security settings

### "SMTP connection timeout"
- Check if port 587 is open on your network
- Some networks block SMTP. Try using a VPN or different network

### "Could not resolve host"
- Check EMAIL_HOST setting (should be smtp.gmail.com, smtp.sendgrid.net, or smtp.mailgun.org)
- Check internet connection

### Emails sent but not received
- Check spam folder
- Verify DEFAULT_FROM_EMAIL is set correctly
- SendGrid/Mailgun: Verify domain is authenticated
