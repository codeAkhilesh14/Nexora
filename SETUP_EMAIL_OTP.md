# Email OTP Configuration Guide (Resend)

## Overview
The OTP (One-Time Password) system sends verification emails to users during signup and password resets using the **Resend** email service.

## What Changed
✅ **Backend (`email.service.js`)**
- Replaced nodemailer/SMTP with the `@resend` SDK client.
- Added proper error handling for Resend API failures.
- Sender email is configured as `Nexora <noreply@codepanda.me>`.
- Preserved existing professional HTML templates for email verification and password reset.
- Added `sendOTPEmail` export to support the exact user-specified casing.

✅ **Backend (`auth.controller.js`)**
- Signup requires successful email verification code delivery.
- Resend OTP endpoint sends real emails through Resend API.
- Returns proper error messages if email fails.

---

## Required Environment Variables

Add this to your `.env` file (in `backend/` folder):

```bash
# Resend Configuration
RESEND_API_KEY=re_e9frzrt3_PCbdSEkZr6tWvoR9dTqf4CTV
```

---

## How to Get Your Own API Key

1. Go to [resend.com](https://resend.com) and sign up for an account.
2. Go to the API Keys section and click **Create API Key**.
3. Copy the key and paste it as `RESEND_API_KEY` in your `.env` file.

---

## Testing Email Configuration

After setting the environment variable:

1. **Restart your backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test signup flow:**
   - Go to the signup page.
   - Enter your email address.
   - You should receive the OTP email within seconds.
   - If you don't see it, check the spam/junk folder.

---

## Troubleshooting

### ❌ Error: "Unable to send verification email"
**Solution:** Check that the Resend API key is correct and valid in your `backend/.env` file.

### ❌ Not receiving emails
**Check:**
1. Check your email's spam or junk folder.
2. Check your backend console logs for `[Email Service]` prefix messages to find any specific errors returned by Resend.
