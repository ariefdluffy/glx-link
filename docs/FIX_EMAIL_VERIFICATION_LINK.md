# 🔧 FIX: Email Verification Link menggunakan localhost

**Tanggal:** 2026-05-15  
**Problem:** Link verifikasi email yang dikirim masih menggunakan `localhost:5173` bukan `https://glx.my.id`

---

## 🐛 Problem

Saat user registrasi, email verifikasi terkirim tapi link yang ada di email masih:
```
http://localhost:5173/verify-email?token=xxxxx
```

Seharusnya:
```
https://glx.my.id/verify-email?token=xxxxx
```

---

## 🔍 Root Cause

**File:** `src/lib/email/index.ts`

**Kode yang salah:**
```typescript
export function getBaseUrl(): string {
    return env.PUBLIC_APP_URL || 'http://localhost:5173';
    //     ^^^^^^^^^^^^^^^^^^
    //     Environment variable yang salah!
}
```

**Masalah:**
- Menggunakan `PUBLIC_APP_URL` yang tidak ada di `.env`
- Seharusnya menggunakan `PUBLIC_BASE_URL`

---

## ✅ Solution

**File yang diperbaiki:** `src/lib/email/index.ts`

**Sebelum:**
```typescript
export function getBaseUrl(): string {
    return env.PUBLIC_APP_URL || 'http://localhost:5173';
}
```

**Sesudah:**
```typescript
export function getBaseUrl(): string {
    return env.PUBLIC_BASE_URL || 'http://localhost:5173';
}
```

---

## 🔧 Configuration

### 1. Update `.env` File

Pastikan file `.env` memiliki variable ini:

```bash
# Public Base URL (untuk email verification links, payment callbacks, dll)
PUBLIC_BASE_URL=https://glx.my.id
```

### 2. Environment Variables

| Variable | Value (Development) | Value (Production) |
|----------|---------------------|-------------------|
| `PUBLIC_BASE_URL` | `http://localhost:5173` | `https://glx.my.id` |

---

## 📧 Impact

Fungsi `getBaseUrl()` digunakan di beberapa tempat:

### 1. Email Verification
**File:** `src/routes/api/auth/register/+server.ts`
```typescript
const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
```

### 2. Password Reset
**File:** `src/routes/api/auth/forgot-password/+server.ts`
```typescript
const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
```

### 3. Payment Callbacks (Mayar)
**File:** `src/lib/mayar/index.ts`
```typescript
const baseUrl = getBaseUrl();
// Used for payment success/failure redirects
```

### 4. Payment Callbacks (Xendit)
**File:** `src/lib/xendit/index.ts`
```typescript
const baseUrl = getBaseUrl();
// Used for invoice success/failure URLs
```

---

## 🧪 Testing

### Test Email Verification Link:

1. **Register new user:**
```bash
# Via browser atau API
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123"
}
```

2. **Check email yang diterima:**
```
Subject: Verifikasi Email - GLX Link

Link di email seharusnya:
✅ https://glx.my.id/verify-email?token=xxxxx

Bukan:
❌ http://localhost:5173/verify-email?token=xxxxx
```

3. **Verify di database:**
```sql
-- Check token yang dibuat
SELECT * FROM email_verifications 
ORDER BY createdAt DESC 
LIMIT 1;
```

---

## 🌐 Environment Setup

### Development (.env):
```bash
PUBLIC_BASE_URL=http://localhost:5173
```

### Staging (.env):
```bash
PUBLIC_BASE_URL=https://staging.glx.my.id
```

### Production (.env):
```bash
PUBLIC_BASE_URL=https://glx.my.id
```

---

## 📝 Related Files

| File | Purpose | Uses getBaseUrl() |
|------|---------|-------------------|
| `src/lib/email/index.ts` | Email helper | ✅ Exports function |
| `src/routes/api/auth/register/+server.ts` | Registration | ✅ Email verification |
| `src/routes/api/auth/forgot-password/+server.ts` | Password reset | ✅ Reset link |
| `src/lib/mayar/index.ts` | Mayar payment | ✅ Callback URLs |
| `src/lib/xendit/index.ts` | Xendit payment | ✅ Callback URLs |

---

## 🔄 Deployment Steps

### 1. Update Code
```bash
# Code sudah diperbaiki di src/lib/email/index.ts
git add src/lib/email/index.ts
git commit -m "fix: use PUBLIC_BASE_URL for email verification links"
```

### 2. Update Environment Variable
```bash
# Di server production, update .env
PUBLIC_BASE_URL=https://glx.my.id
```

### 3. Restart Application
```bash
# Restart untuk load env variable baru
pm2 restart glx-link
```

### 4. Test
```bash
# Register user baru dan cek email
# Link seharusnya sudah menggunakan https://glx.my.id
```

---

## ⚠️ Important Notes

### 1. Environment Variable Priority
```typescript
env.PUBLIC_BASE_URL || 'http://localhost:5173'
```
- Jika `PUBLIC_BASE_URL` tidak di-set, fallback ke localhost
- Pastikan variable di-set di production!

### 2. HTTPS in Production
- Production harus menggunakan HTTPS
- HTTP tidak aman untuk verification links
- Cloudflare/Nginx harus sudah setup SSL

### 3. Trailing Slash
- Jangan tambahkan trailing slash di `PUBLIC_BASE_URL`
- ✅ `https://glx.my.id`
- ❌ `https://glx.my.id/`

### 4. Subdomain
- Bisa menggunakan subdomain jika perlu
- ✅ `https://app.glx.my.id`
- ✅ `https://glx.my.id`

---

## 🔐 Security Considerations

### 1. Token Security
- Token di-generate random (48 characters)
- Token expires dalam 24 jam
- Token hanya bisa digunakan sekali

### 2. HTTPS Only
- Verification links harus HTTPS di production
- Mencegah token dicuri via man-in-the-middle

### 3. Email Validation
- Pastikan email terkirim ke alamat yang benar
- Jangan expose token di logs

---

## 📊 Before vs After

### Before (Wrong):
```
Email verification link:
http://localhost:5173/verify-email?token=abc123...
                      ❌ Wrong domain!

Password reset link:
http://localhost:5173/reset-password?token=xyz789...
                      ❌ Wrong domain!
```

### After (Correct):
```
Email verification link:
https://glx.my.id/verify-email?token=abc123...
                  ✅ Correct domain!

Password reset link:
https://glx.my.id/reset-password?token=xyz789...
                  ✅ Correct domain!
```

---

## ✅ Verification Checklist

- [x] Code fixed (`src/lib/email/index.ts`)
- [x] Documentation created
- [ ] `.env` updated in production
- [ ] Application restarted
- [ ] Test email verification
- [ ] Test password reset
- [ ] Verify links use correct domain

---

## 📞 Support

Jika link masih salah:
1. Check `.env` file di server
2. Verify `PUBLIC_BASE_URL` value
3. Restart application
4. Clear any caches
5. Test dengan user baru

---

**Last Updated:** 2026-05-15 07:33 UTC  
**Status:** ✅ Fixed & Ready for Production
