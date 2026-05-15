# 🔧 FIX: Environment Variables Tidak Terbaca

## ❌ Masalah yang Terjadi

```
XENDIT_SECRET_KEY is not set in environment variables
[Xendit] Failed to create invoice: Error: Xendit API Error: No API Key detected
```

## ✅ Solusi

### 1. Update File `src/lib/xendit/index.ts`

File sudah diupdate untuk menggunakan `$env/static/private` dan `$env/static/public` (SvelteKit way).

**Perubahan:**
```typescript
// SEBELUM (SALAH - tidak bekerja di SvelteKit)
const key = process.env.XENDIT_SECRET_KEY;

// SESUDAH (BENAR - SvelteKit way)
import { XENDIT_SECRET_KEY } from '$env/static/private';
const key = XENDIT_SECRET_KEY;
```

### 2. Pastikan File .env Ada dan Benar

**Lokasi:** `glx-link/.env` (di root project, sejajar dengan package.json)

**Isi minimal:**
```env
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxxxxxxxxxx
XENDIT_CALLBACK_TOKEN=xnd_public_development_xxxxxxxxxxxxx
PUBLIC_BASE_URL=http://localhost:5173
```

**⚠️ PENTING:**
- Tidak boleh ada spasi sebelum/sesudah tanda `=`
- Nama variable case-sensitive (harus UPPERCASE)
- Variable public HARUS diawali `PUBLIC_`

### 3. Restart Dev Server

```bash
# Stop server (Ctrl+C)

# Hapus cache SvelteKit
rm -rf .svelte-kit

# Restart
npm run dev
```

### 4. Test Environment Variables

Buat file test: `src/routes/api/test-env/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { XENDIT_SECRET_KEY } from '$env/static/private';

export const GET = async () => {
    return json({
        hasKey: !!XENDIT_SECRET_KEY,
        keyPrefix: XENDIT_SECRET_KEY?.substring(0, 15) + '...'
    });
};
```

Test:
```bash
curl http://localhost:5173/api/test-env
```

Expected:
```json
{
  "hasKey": true,
  "keyPrefix": "xnd_development..."
}
```

---

## 📋 Checklist Troubleshooting

- [ ] File `.env` ada di root project (sejajar dengan `package.json`)
- [ ] Isi `.env` tidak ada spasi di sekitar `=`
- [ ] Variable name UPPERCASE dan persis sama
- [ ] Dev server sudah di-restart setelah edit `.env`
- [ ] Folder `.svelte-kit` sudah dihapus
- [ ] Test endpoint `/api/test-env` return `hasKey: true`

---

## 🚨 Jika Masih Error

### Error: "Cannot find module '$env/static/private'"

```bash
# Hapus cache dan node_modules
rm -rf .svelte-kit node_modules

# Reinstall
npm install

# Restart
npm run dev
```

### Error: "XENDIT_SECRET_KEY is undefined"

1. Cek file `.env` dengan:
```bash
cat .env | grep XENDIT
```

2. Pastikan output menampilkan:
```
XENDIT_SECRET_KEY=xnd_development_xxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxx
XENDIT_CALLBACK_TOKEN=xnd_public_development_xxxxx
```

3. Jika tidak ada, tambahkan ke `.env`

4. Restart dev server

---

## ✅ Verifikasi Sukses

Setelah fix, log seharusnya:
```
[Xendit] Creating invoice: {
  externalId: 'sub_11_2_1778812028529',
  amount: 29000,
  description: 'GLX.my.id Pro - 30 hari',
  payerEmail: 'arieftheluffy@gmail.com'
}
[Xendit] Invoice created: inv_xxxxx https://checkout.xendit.co/web/xxxxx
```

**TIDAK ADA** log error "XENDIT_SECRET_KEY is not set"

---

**Status:** ✅ FIXED
**File Changed:** `src/lib/xendit/index.ts`
**Documentation:** `ENV_SETUP.md`
