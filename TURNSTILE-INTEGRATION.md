# Integrasi Cloudflare Turnstile

Dokumentasi untuk fitur Cloudflare Turnstile yang telah diintegrasikan ke halaman login dan register.

## Setup

### 1. Dapatkan Credentials Cloudflare Turnstile

1. Kunjungi [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih akun Anda
3. Navigasi ke **Turnstile** di sidebar
4. Klik **Add Site**
5. Isi informasi:
   - **Site name**: Nama aplikasi Anda (contoh: GLX Link)
   - **Domain**: Domain aplikasi Anda (contoh: `localhost` untuk development, atau `yourdomain.com` untuk production)
   - **Widget Mode**: Pilih **Managed** (recommended)
6. Klik **Create**
7. Salin **Site Key** dan **Secret Key**

### 2. Konfigurasi Environment Variables

Tambahkan credentials ke file `.env`:

```env
# Cloudflare Turnstile
PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

**Catatan:**
- `PUBLIC_TURNSTILE_SITE_KEY` - Digunakan di frontend (client-side)
- `TURNSTILE_SECRET_KEY` - Digunakan di backend untuk verifikasi (server-side)

### 3. Restart Development Server

```bash
npm run dev
```

## Cara Kerja

### Frontend (Client-Side)

1. Komponen `Turnstile.svelte` di-load di halaman login dan register
2. Script Cloudflare Turnstile dimuat secara dinamis
3. Widget Turnstile di-render di halaman
4. User menyelesaikan challenge (jika diperlukan)
5. Token verifikasi dikirim ke backend bersama form data

### Backend (Server-Side)

1. API endpoint menerima token dari frontend
2. Token diverifikasi ke Cloudflare API
3. Jika valid, proses login/register dilanjutkan
4. Jika tidak valid, request ditolak dengan error message

## File yang Dimodifikasi

### Komponen Baru
- `src/lib/components/turnstile/Turnstile.svelte` - Komponen Turnstile
- `src/lib/components/turnstile/turnstile.d.ts` - Type definitions

### Halaman yang Diupdate
- `src/routes/login/+page.svelte` - Tambah Turnstile widget
- `src/routes/register/+page.svelte` - Tambah Turnstile widget

### API yang Diupdate
- `src/routes/api/auth/login/+server.ts` - Tambah verifikasi Turnstile
- `src/routes/api/auth/register/+server.ts` - Tambah verifikasi Turnstile

### Konfigurasi
- `.env.example` - Template environment variables

## Testing

### Development (localhost)

Cloudflare Turnstile memiliki test keys yang bisa digunakan untuk testing:

**Site Key (selalu pass):**
```
1x00000000000000000000AA
```

**Secret Key:**
```
1x0000000000000000000000000000000AA
```

### Production

Gunakan credentials asli dari Cloudflare Dashboard untuk production.

## Troubleshooting

### Error: "Verifikasi Turnstile diperlukan"
- Pastikan widget Turnstile sudah di-load
- Pastikan user sudah menyelesaikan challenge
- Cek console browser untuk error JavaScript

### Error: "Verifikasi Turnstile gagal"
- Pastikan `TURNSTILE_SECRET_KEY` sudah diset dengan benar di `.env`
- Pastikan domain sudah terdaftar di Cloudflare Dashboard
- Cek apakah token sudah expired (token valid selama 5 menit)

### Widget tidak muncul
- Cek console browser untuk error
- Pastikan `PUBLIC_TURNSTILE_SITE_KEY` sudah diset
- Pastikan tidak ada ad-blocker yang memblokir script Cloudflare

## Keamanan

- ✅ Token diverifikasi di server-side
- ✅ Secret key tidak pernah di-expose ke client
- ✅ IP address user dikirim untuk verifikasi tambahan
- ✅ Token hanya bisa digunakan sekali
- ✅ Token expired setelah 5 menit

## Referensi

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Client-side Rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Turnstile Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
