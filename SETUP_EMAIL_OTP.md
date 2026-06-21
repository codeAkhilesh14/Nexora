# Email OTP Configuration Guide

## Overview
The OTP (One-Time Password) system now sends actual emails to users during signup instead of showing development OTPs. You must configure SMTP to enable this functionality.

## What Changed
✅ **Backend (`email.service.js`)**
- Removed fallback to development OTP mode
- Added proper error handling with detailed logging
- Now throws errors if SMTP is not configured
- Validates SMTP connection on startup

✅ **Backend (`auth.controller.js`)**
- Signup now requires successful email sending
- ResendOtp endpoint sends real emails
- Returns proper error messages if email fails
- No more `devOtp` in responses

✅ **Frontend**
- Removed development OTP display
- SignupPage no longer shows fallback OTP
- VerifyOtpPage expects emails to be sent properly
- Cleaner error messages

## Required Environment Variables

Add these to your `.env` file (in `backend/` folder):

```bash
# SMTP Configuration
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
MAIL_FROM="Nexora <noreply@nexora.in>"
```

## SMTP Provider Options

### 1. **Gmail (Google Workspace/Gmail)**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```
**How to get App Password:**
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Copy the 16-character password
4. Paste it in `SMTP_PASS`

### 2. **SendGrid**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
MAIL_FROM="Nexora <noreply@yourdomain.com>"
```
Get API key from [app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys)

### 3. **Mailgun**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

### 4. **AWS SES**
```bash
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### 5. **Brevo (Sendinblue)**
```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@example.com
SMTP_PASS=your-brevo-smtp-key
```

### 6. **Local/Development (Mailtrap)**
```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```
Sign up at [mailtrap.io](https://mailtrap.io) for free testing

## Configuration for Render.yaml (Production)

Update your `backend/render.yaml` to include SMTP variables:

```yaml
services:
  - type: web
    name: nexora-api
    env: node
    plan: starter
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_ACCESS_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: MAIL_FROM
        value: "Nexora <noreply@nexora.in>"
```

Then add these environment variables in Render dashboard:
1. Go to your service settings
2. Click "Environment"
3. Add each variable manually

## Testing Email Configuration

After setting environment variables:

1. **Restart your backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Check console logs** for:
   ```
   [Email Service] SMTP Connected Successfully
   ```
   Or errors like:
   ```
   [Email Service] SMTP Connection Failed: ...
   ```

3. **Test signup flow:**
   - Go to signup page
   - Enter an email address
   - You should receive OTP email within seconds
   - If you don't see it, check spam folder

## Troubleshooting

### ❌ Error: "Unable to send verification email"
**Solution:** Check that SMTP credentials are correct
```bash
# Verify credentials are set
echo $SMTP_HOST
echo $SMTP_USER
echo $SMTP_PORT
```

### ❌ SMTP Connection Failed
**Causes:**
- Wrong hostname
- Wrong port (usually 587 or 465)
- Firewall blocking SMTP port
- Credentials are incorrect

**Solution:**
- Double-check SMTP host and port
- Ensure app password is used (not main password for Gmail)
- Check firewall rules

### ❌ "Email delivery failed in development"
**This error is gone!** The system now requires working SMTP.

### ❌ Not receiving emails
**Check:**
1. Email in spam/junk folder
2. MAIL_FROM domain might be flagged
3. SMTP credentials might have limited sending permissions
4. Try a different email provider

## Testing with Mailtrap (Recommended for Development)

1. Sign up at [mailtrap.io](https://mailtrap.io) (free)
2. Create an inbox
3. Copy the SMTP credentials:
   ```bash
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-user
   SMTP_PASS=your-pass
   ```
4. All test emails appear in Mailtrap dashboard
5. No real emails are sent

## Environment Variable Priority

Variables are loaded in this order:
1. `.env` file in `backend/` folder
2. Environment variables from system/hosting platform
3. Default values (if any)

**Important:** Keep your `.env` file in `.gitignore` to avoid committing credentials!

## Email Templates

The OTP email is now formatted with:
- Professional HTML layout
- Clear 10-minute expiration warning
- Security reminder
- Better readability on mobile and desktop

## Support

If you encounter issues:
1. Check backend console logs for `[Email Service]` prefix messages
2. Verify all SMTP environment variables are set
3. Try a different email provider
4. Check your firewall/ISP restrictions

Happy emailing! 🚀
