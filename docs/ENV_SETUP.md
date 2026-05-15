# Environment Variables Setup untuk SvelteKit

## ⚠️ PENTING: Cara Membaca Environment Variables di SvelteKit

SvelteKit **TIDAK** menggunakan `process.env` secara langsung. Anda harus menggunakan:
- `$env/static/private` untuk server-side variables (rahasia)
- `$env/static/public` untuk client-side variables (publik)

---

## 📋 File .env yang Diperlukan

Buat file `.env` di root project dengan isi berikut:

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/glx_db

# Xendit API Keys (WAJIB untuk payment)
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxxxxxxxxxx
XENDIT_CALLBACK_TOKEN=xnd_public_development_xxxxxxxxxxxxx

# Public Base URL (untuk redirect dan callback)
PUBLIC_BASE_URL=http://localhost:5173

# Email SMTP (untuk verifikasi email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Session Secret (generate random string)
SESSION_SECRET=your-random-secret-key-here

# Node Environment
NODE_ENV=development
```

---

## 🔧 Cara Kerja Environment Variables di SvelteKit

### 1. **Private Variables (Server-side only)**

Variables yang **TIDAK** boleh diakses dari browser (API keys, database credentials, dll):

**File:** `src/lib/xendit/index.ts`
```typescript
import { XENDIT_SECRET_KEY, XENDIT_PUBLIC_KEY } from '$env/static/private';

// Sekarang bisa digunakan
const secretKey = XENDIT_SECRET_KEY;
```

**Aturan:**
- Nama variable **TIDAK** boleh diawali dengan `PUBLIC_`
- Hanya bisa diakses di server-side code (`.server.ts`, `+page.server.ts`, API routes)
- Tidak akan ter-bundle ke client

### 2. **Public Variables (Client-side accessible)**

Variables yang **BOLEH** diakses dari browser (base URL, public keys, dll):

**File:** `src/lib/config.ts`
```typescript
import { PUBLIC_BASE_URL } from '$env/static/public';

// Bisa diakses di client maupun server
const baseUrl = PUBLIC_BASE_URL;
```

**Aturan:**
- Nama variable **HARUS** diawali dengan `PUBLIC_`
- Bisa diakses di client dan server
- Akan ter-bundle ke client (jangan simpan rahasia!)

---

## 🚨 Error yang Sering Terjadi

### Error: "Cannot find module '$env/static/private'"

**Penyebab:** SvelteKit belum generate type definitions

**Solusi:**
```bash
# Stop dev server (Ctrl+C)
# Hapus cache
rm -rf .svelte-kit

# Restart dev server
npm run dev
```

### Error: "XENDIT_SECRET_KEY is not set"

**Penyebab:** File `.env` tidak terbaca atau variable tidak didefinisikan

**Solusi:**
1. Pastikan file `.env` ada di root project (sejajar dengan `package.json`)
2. Pastikan nama variable **PERSIS** sama (case-sensitive)
3. Restart dev server setelah edit `.env`
4. Cek apakah ada typo di nama variable

**Contoh yang BENAR:**
```env
XENDIT_SECRET_KEY=xnd_development_abc123
```

**Contoh yang SALAH:**
```env
XENDIT_SECRET_KEY =xnd_development_abc123  # Ada spasi sebelum =
XENDIT_SECRET_KEY= xnd_development_abc123  # Ada spasi setelah =
xendit_secret_key=xnd_development_abc123   # Lowercase (salah!)
```

---

## 🔄 Restart Setelah Edit .env

**PENTING:** Setiap kali edit file `.env`, Anda HARUS restart dev server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

SvelteKit hanya membaca `.env` saat startup, tidak otomatis reload.

---

## 📝 Checklist Setup

- [ ] File `.env` ada di root project
- [ ] Semua variable sudah diisi dengan nilai yang benar
- [ ] Tidak ada spasi sebelum/sesudah `=`
- [ ] Variable private tidak diawali `PUBLIC_`
- [ ] Variable public diawali `PUBLIC_`
- [ ] Dev server sudah di-restart setelah edit `.env`
- [ ] Folder `.svelte-kit` sudah dihapus jika ada error

---

## 🧪 Testing Environment Variables

Buat file test untuk memastikan env vars terbaca:

**File:** `src/routes/api/test-env/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
import { XENDIT_SECRET_KEY } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const GET = async () => {
    return json({
        hasSecretKey: !!XENDIT_SECRET_KEY,
        secretKeyPrefix: XENDIT_SECRET_KEY?.substring(0, 10) + '...',
        baseUrl: PUBLIC_BASE_URL
    });
};
```

Test dengan:
```bash
curl http://localhost:5173/api/test-env
```

Expected output:
```json
{
  "hasSecretKey": true,
  "secretKeyPrefix": "xnd_develo...",
  "baseUrl": "http://localhost:5173"
}
```

---

## 🔐 Security Best Practices

1. **Jangan commit `.env` ke git**
   - Pastikan `.env` ada di `.gitignore`
   - Commit `.env.example` sebagai template

2. **Gunakan different keys untuk dev/prod**
   - Development: `xnd_development_...`
   - Production: `xnd_production_...`

3. **Rotate keys secara berkala**
   - Ganti API keys setiap 3-6 bulan
   - Ganti setelah ada security incident

4. **Jangan share keys di chat/email**
   - Gunakan secure password manager
   - Share via encrypted channel

---

## 📚 Dokumentasi Terkait

- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-private)
- [Xendit API Documentation](https://developers.xendit.co/)
- `XENDIT_SETUP.md` - Setup Xendit lengkap

---

**Last Updated:** 2026-05-15
