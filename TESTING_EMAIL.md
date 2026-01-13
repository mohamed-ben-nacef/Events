# Email Testing Guide

## Quick Test Methods

### 1. Test Registration Email (Welcome + Verification)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "phone": "+1234567890"
  }'
```

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "full_name": "Test User",
  "phone": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": { ... },
    "tokens": { ... },
    "verification_token": "..." // Only in development
  }
}
```

**What to Check:**
- ✅ Email sent to `test@example.com`
- ✅ Welcome email with verification link
- ✅ In development: Check console logs for email content

---

### 2. Test Forgot Password Email

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/forgot-password`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "reset_token": "..." // Only in development
}
```

**What to Check:**
- ✅ Password reset email sent
- ✅ Email contains reset link with token
- ✅ Token expires in 1 hour

---

### 3. Test Password Reset

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token-from-email",
    "password": "NewPass123!"
  }'
```

**What to Check:**
- ✅ Password changed successfully
- ✅ Confirmation email sent
- ✅ Old token no longer works

---

### 4. Test Email Verification

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-verification-token-from-email"
  }'
```

**What to Check:**
- ✅ Email verified successfully
- ✅ User's `is_email_verified` set to `true`

---

### 5. Test Resend Verification Email

First, login to get a token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Then use the access token:
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Development Mode Testing (No SMTP Configured)

If you don't have SMTP configured, emails will be logged to console:

```
📧 EMAIL (Not Sent - SMTP not configured):
To: test@example.com
Subject: Welcome to Audiovisual Event Manager
---
[Email content here]
---
```

## Production Mode Testing (SMTP Configured)

1. Check your email inbox (and spam folder)
2. Click the links in emails
3. Verify tokens work correctly
4. Check email formatting and styling

---

## Testing Checklist

- [ ] Registration sends welcome email
- [ ] Registration includes verification link
- [ ] Forgot password sends reset email
- [ ] Password reset link works
- [ ] Password reset sends confirmation email
- [ ] Email verification works
- [ ] Resend verification works
- [ ] Password change sends notification
- [ ] All email links are correct
- [ ] Email templates render correctly
- [ ] Tokens expire correctly
