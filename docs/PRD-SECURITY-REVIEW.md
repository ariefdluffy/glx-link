# Security Review Report — GLX Link

| Metadata | |
|----------|-----------------------|
| **Tanggal** | 2026-05-26 |
| **Project** | GLX Link (`glx-link`) |
| **Versi Kode** | v0.1.0 |
| **Review Level** | Manual — Full Code Audit |
| **Status** | 🔄 In Progress — CRIT + HIGH selesai, MED/LOW sebagian |
| **Last Updated** | 2026-05-25 |

---

## 🔍 Ringkasan Eksekutif

Setelah menelusuri **~60+ file** (hooks, auth, API, webhook, cron, upload, admin, billing, database schema, utilities), ditemukan:

| Severity | Jumlah Item | Sudah Fix | Belum Fix |
|----------|:-----------:|:---------:|:---------:|
| 🔴 **Critical** | 4 | 4 | 0 |
| 🟠 **High** | 7 | 7 | 0 |
| 🟡 **Medium** | 8 | 2 | 6 |
| 🟢 **Low**/Notes | 7 | 5 | 2 |

**Bagus yang sudah ada**: bcrypt cost 12, HMAC-signed session cookie, Turnstile protection di login/register, security headers (XFO, NOSNIFF, Referrer-Policy), rate-limiting global, audit log untuk event kritikal, Open Graph / URL injection dicegah (`isValidUrl`).

**Kelemahan utama**: webhook payment bisa dipalsukan (akan aktivasi Pro gratis), sesi tidak divalidasi di server side (cookie aja), proteksi cron/secret kurang ketat, dan beberapa logika SQL rentan tidak berfungsi di edge cases.

---

## ✅ Sudah Di-Fix (Batch 1 — 2026-05-25)

| ID | Item | File |
|----|------|------|
| MED-07 | Hapus `X-XSS-Protection` deprecated | `src/hooks.server.ts` |
| LOW-02 | Tambah HSTS header di production | `src/hooks.server.ts` |
| LOW-03 | PATCH microsite tanpa `links` return `undefined` → 500 | `src/routes/api/microsites/[slug]/+server.ts` |
| LOW-04 | Inkonsistensi cooldown comment (60 detik vs 120 detik) | `src/routes/api/auth/resend-verification/+server.ts` |
| LOW-07 | File `.cjs` legacy dipindah ke `scripts/` | `scripts/` |
| — | Catch block menelan error — konteks log diperbaiki | `session.ts`, `login`, `register`, webhook Mayar & Xendit |

## ✅ Sudah Di-Fix (Batch 2 — 2026-05-25)

| ID | Item | File |
|----|------|------|
| CRIT-01 | Webhook Mayar — implementasi `verifyWebhookSignature` dengan `timingSafeEqual` + `MAYAR_WEBHOOK_SECRET` | `src/lib/mayar/index.ts`, `src/routes/api/webhooks/mayar/+server.ts` |
| CRIT-02 | Webhook Xendit — hapus `skipVerification`, wajibkan `XENDIT_CALLBACK_TOKEN`, `timingSafeEqual` | `src/lib/xendit/index.ts`, `src/routes/api/webhooks/xendit/+server.ts` |
| CRIT-03 | Cron endpoint — tambah auth di `cleanup-shortlinks`, hapus fallback default secret | `src/routes/api/cron/cleanup-shortlinks/+server.ts`, `update-subscriptions/+server.ts` |
| CRIT-04 | Hapus hardcoded `bypassEmails` di login | `src/routes/api/auth/login/+server.ts` |
| HIGH-01 | Fix `eq(null)` → `isNull()` di reset-password + hapus semua sesi setelah reset | `src/routes/api/auth/reset-password/+server.ts` |
| HIGH-02 | Hapus `devToken` dari response forgot-password, guard dengan `dev` dari `$app/environment` | `src/routes/api/auth/forgot-password/+server.ts` |
| HIGH-03 | Session lifecycle — hapus sesi dari DB saat logout + hapus semua sesi setelah ganti password | `src/routes/api/auth/logout/+server.ts`, `password/+server.ts` |
| HIGH-04 | Upload — validasi magic bytes (layer 2), fix `ALLOWED_TYPES`, fix ekstensi dari MIME server-side | `src/routes/api/upload/+server.ts` |
| HIGH-05 | Validasi `amount` di webhook Mayar & Xendit sebelum aktivasi plan | webhook Mayar & Xendit |
| HIGH-06 | Duration dari `extraData.duration_days` (Mayar) dan `external_id` parts (Xendit), bukan dari `notes` | webhook Mayar & Xendit |
| HIGH-07 | — (Login brute force per-email belum diimplementasi, lihat backlog) | — |

## ✅ Sudah Di-Fix (Batch 3 — 2026-05-26)

| ID | Item | File |
|----|------|------|
| HIGH-07 | Login brute force per-email — in-memory map, max 5 gagal, blok 15 menit, cleanup periodik | `src/routes/api/auth/login/+server.ts` |
| MED-01 | LIKE wildcard escape — `escapeLike()` escape `%`, `_`, `\` sebelum query | `admin/+page.server.ts`, `admin/microsites`, `admin/monitoring`, `admin/users` |
| MED-02 | Hash token verifikasi email — simpan SHA-256 hash di DB, bukan plaintext | `register/+server.ts`, `resend-verification/+server.ts`, `verify-email/+server.ts` |
| MED-03 | Session dedup via IP+UA dihapus — `createSession` selalu insert row baru | `src/lib/auth/session.ts` |
| MED-04 | `generateToken()` pakai `crypto.randomBytes` bukan `Math.random()` | `src/lib/email/index.ts` |
| MED-05 | Audit log real IP — semua `ip: 'api'`/`'self'`/`'admin'` diganti `getRealClientIP(event)` | 10 file endpoint & form action |
| MED-06 | `getRealClientIP` hardened — hapus blind trust `x-real-ip`/`x-forwarded-for`, hanya trust `cf-connecting-ip` + `getClientAddress()`. `adapter-node` dikonfigurasi `xForwardedFor: true` | `src/lib/utils/ip.ts`, `svelte.config.js` |
| LOW-01 | Slug generation pakai `crypto.randomBytes` bukan `Math.random()` | `src/routes/api/links/+server.ts` |
| LOW-05 | `parseInt` tanpa radix — semua diganti `parseInt(x, 10)` | 9 file tersebar |
| LOW-06 | Dead code redirect `/site/[slug]` dihapus, import `$page` unused dihapus | `src/routes/[slug]/+page.svelte` |
| MED-08 | CSP header ditambahkan — `script-src`, `style-src`, `font-src`, `img-src`, `connect-src`, `frame-src`, `form-action`, `object-src 'none'`, `upgrade-insecure-requests`. Rate limiter di hooks juga di-hardened (hapus blind trust `x-real-ip`/`x-forwarded-for`) | `src/hooks.server.ts` |

---

### CRIT-01: Webhook Mayar — Tidak Ada Verifikasi Signature

| File | Baris |
|------|-------|
| `src/lib/mayar/index.ts` | `verifyWebhookSignature()` (return `true`) |
| `src/routes/api/webhooks/mayar/+server.ts` | L49 (call signature) |

```ts
export function verifyWebhookSignature(payload: unknown): boolean {
    // TODO: Implement IP whitelist or other verification method
    return true;
}
```

**Dampak**: Siapa saja yang tahu URL webhook publik bisa mengirim POST untuk mengaktifkan (atau menonaktifkan) plan Pro user mana pun dengan mengirim `extraData.user_id` dan `extraData.subscription_id` palsu.

**Root Cause**: Tidak ada signature HMAC, bearer token, atau IP allowlist. Kode memiliki TODO yang tidak pernah diimplementasi.

**Urgensi**: ✅ SEGERA

**Rekomendasi**:
1. Ambil secret dari env `MAYAR_WEBHOOK_SECRET`, bandingkan dengan header di request (mis. `x-webhook-signature`).
2. Jika Mayar basic plan tidak menyediakan signature, ganti verifikasi dengan IP allowlist dari range IP Mayar yang terdokumentasi.
3. Sebagai defense-in-depth: verifikasi `amount` dari payload === `subscriptions.price` dari DB, dan pastikan `user_id` memang pemilik `subscription_id` dari DB.

---

### CRIT-02: Webhook Xendit — Verifikasi Dapat Dilewati

| File | Baris |
|------|-------|
| `src/routes/api/webhooks/xendit/+server.ts` | L24–30 |
| `src/lib/xendit/index.ts` | `verifyCallbackSignature()` |

```ts
const isDevelopment = process.env.NODE_ENV !== 'production';
const skipVerification = isDevelopment && !process.env.XENDIT_CALLBACK_TOKEN && !process.env.XENDIT_PUBLIC_KEY;
if (!skipVerification && (!callbackToken || !verifyCallbackSignature(callbackToken))) { ... }
```

**Dampak**: Jika `NODE_ENV` tidak = `production` di server (sangat umum terjadi misconfig), dan kedua env Xendit kosong, webhook Xendit menerima semua callback dan mengaktifkan Pro gratis tanpa bayar.

**Root Cause**: `skipVerification` logic terlalu longgar, dan `verifyCallbackSignature()` fallback ke `getPublicKey()` (public key bukan secret).

**Urgensi**: ✅ SEGERA

**Rekomendasi**:
1. Hapus blok `skipVerification` sepenuhnya. Hanya terima request dev di environment yang jelas terisolasi.
2. Wajibkan `XENDIT_CALLBACK_TOKEN` di env. Jika kosong, log error dan reject semua request.
3. Pakai `crypto.timingSafeEqual` untuk perbandingan token.
4. Validasi `amount` payload === `subscription.price` sebelum activate.

---

### CRIT-03: Endpoint Cron tanpa Autentikasi / Secret Default

| File | Baris |
|------|-------|
| `src/routes/api/cron/cleanup-shortlinks/+server.ts` | — (full endpoint) |
| `src/routes/api/cron/update-subscriptions/+server.ts` | L8 |

```ts
const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
```

**Dampak**:
- `cleanup-shortlinks` menerima request GET publik dan bisa menghapus ribuan shortlink dengan satu panggilan.
- `update-subscriptions` fallback ke string hardcoded `'your-secret-key-here'` yang bisa ditebak siapa saja yang membaca source code (open source atau public repo).

**Urgensi**: ✅ SEGERA

**Rekomendasi**:
1. Tambahkan `Authorization: Bearer ${process.env.CRON_SECRET}` di `cleanup-shortlinks` juga.
2. Ganti fallback dengan **throw error / reject request** jika `CRON_SECRET` tidak diset di env:

```ts
if (!process.env.CRON_SECRET) {
    throw new Error('CRON_SECRET environment variable is required');
}
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
}
```

3. Ubah method dari GET ke POST untuk mengurangi accidental trigger (crawler, prefetch).

---

### CRIT-04: Hardcoded Bypass Verifikasi Email

| File | Baris |
|------|-------|
| `src/routes/api/auth/login/+server.ts` | L82–83 |

```ts
const bypassEmails = ['admin@wedding.com'];
const needsVerification = !user.emailVerified && !bypassEmails.includes(email);
```

**Dampak**: Email `admin@wedding.com` bisa diregistrasi oleh siapa saja (selama belum ada). Jika sukses registrasi, user tersebut langsung bypass verifikasi email dan bisa login meskipun `emailVerified` = false.

**Root Cause**: Hardcoded list bypass tanpa konteks role.

**Urgensi**: ✅ SEGERA

**Rekomendasi**:
1. Hapus `bypassEmails` sepenuhnya.
2. Untuk akun admin yang perlu bypass, set kolom `emailVerified=true` di database langsung sekali (tidak di logika aplikasi).
3. Alternatif: cek `users.role === 'admin'` saja sebagai bypass, bukan berdasarkan email literal.

---

## 🟠 High

### HIGH-01: Reset Password — `eq(usedAt, null)` != `IS NULL`

| File | Baris |
|------|-------|
| `src/routes/api/auth/reset-password/+server.ts` | L40 |

```ts
.where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.usedAt, null as any)))
```

**Dampak**: `eq(column, null)` di string SQL menghasilkan `column = NULL` yang **selalu false**. Query mengembalikan 0 baris, jadi reset password lewat email selalu gagal (token "invalid"). Bergantung driver Drizzle, behavior bisa berbeda-beda.

**Perbaikan**: Ganti dengan `isNull(passwordResetTokens.usedAt)` dari Drizzle ORM.

**Rekomendasi tambahan**:
- Setelah reset, hapus semua `userSessions.userId` untuk user tersebut (paksa logout di semua perangkat).
- Kirim notifikasi email: "Password Anda baru saja direset."

---

### HIGH-02: Forgot Password — Token Kebocoran di Response & Log

| File | Baris |
|------|-------|
| `src/routes/api/auth/forgot-password/+server.ts` | L87 |

```ts
devToken: process.env.NODE_ENV !== 'production' ? token : undefined
```

**Dampak**: Sama seperti CRIT-02, jika `NODE_ENV` tidak diset ke `production`, token reset password dikembalikan di response JSON. Siapa pun yang memantau respons bisa langsung menggunakannya. `console.log` juga menampilkan token+link ke stdout.

**Rekomendasi**:
- Hapus `devToken` dari response (jangan dikembalikan sama sekali ke client).
- Ganti guard dev menggunakan `$app/environment` (`import { dev } from '$app/environment'`) jika memang perlu di-develop.
- Jangan `console.log` token di production.

---

### HIGH-03: Session Tidak Di-Revoke di Server

| File | Baris |
|------|-------|
| `src/lib/auth/session.ts` | seluruh file |
| `src/routes/api/auth/logout/+server.ts` | L20 |

```ts
// logout hanya hapus cookie, tidak hapus baris dari userSessions
clearSession(cookies);
```

**Dampak**:
- Cookie yang dicuri masih valid 24 jam meskipun korban sudah logout.
- "Cabut sesi" via `/api/auth/sessions/[id]` hapus baris di DB, tapi `getSessionUserId` tidak mengecek tabel `userSessions` — jadi sesi yang "dicabut" masih berfungsi.
- Setelah ganti password, cookie lama tetap valid.

**Rekomendasi**:
- Di `getSessionUserId`, periksa apakah `payload` masih ada di `userSessions` (dan `lastActiveAt` masih wajar).
- Saat logout: hapus row `userSessions` yang cocok (bukan hanya cookie).
- Tambahkan notifikasi "Login dari perangkat lain terdeteksi" bila sesi lama digunakan setelah password diganti.

---

### HIGH-04: Upload File — Validasi Tipe Lemah (MIME dari Client)

| File | Baris |
|------|-------|
| `src/routes/api/upload/+server.ts` | L27–35, L40, L45 |

```ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
// ...
if (!ALLOWED_TYPES.includes(file.type)) { ... }   // MIME dari client
const ext = parts[1];                               // ekstensi dari MIME client
```

**Dampak**:
- `file.type` bisa dipalsukan oleh client.
- Ekstensi file disusun dari MIME palsu tersebut.
- Tidak ada pemeriksaan magic bytes file.
- Ekstensi `.jpeg` dicegah di upload tapi bisa disajikan via `uploads/[filename]` (sudah support).
- Pesan error menyebut WebP/GIF tapi tidak ada di `ALLOWED_TYPES`.

**Rekomendasi**:
- Validasi magic bytes (baca 4 byte pertama dari `file.arrayBuffer()`).
- Tentukan ekstensi berdasarkan MIME yang terverifikasi, bukan dari split client.
- Hapus `image/jpg` dari daftar, gunakan hanya `image/jpeg`.
- Konsisten: tambahkan `image/webp`, `image/gif` jika memang ingin menerima, atau perbaiki pesan error.
- Pertimbangkan re-encode gambar (via `sharp`) untuk memastikan file benar-benar gambar dan menghapus potensi metadata berbahaya.

---

### HIGH-05: Webhook Tidak Memverifikasi `amount`

| File | Baris |
|------|-------|
| `src/routes/api/webhooks/xendit/+server.ts` | L94–112 |
| `src/routes/api/webhooks/mayar/+server.ts` | L87–100 |

Kedua webhook mengupdate `users.plan = 'pro' + planExpiresAt` tanpa membandingkan `payload.amount` dengan `subscription.price` dari database.

**Dampak**: Dikombinasikan dengan CRIT-01/CRIT-02, attacker bisa mengaktifkan Pro dengan harga berapapun (termasuk Rp0).

**Rekomendasi**: Sebelum update user plan, tambahkan:

```ts
if (Number(payload.amount) < subscription.price) {
    // Kembalikan error dan jangan activate
    return json({ error: 'Amount mismatch' }, { status: 400 });
}
```

---

### HIGH-06: Duration Langganan Diambil dari `notes` (User-Configurable)

| File | Baris |
|------|-------|
| `src/routes/api/webhooks/xendit/+server.ts` | L101–107 |
| `src/routes/api/webhooks/mayar/+server.ts` | L88–93 |

```ts
let durationDays = 30;
if (subscription.notes) {
    const match = subscription.notes.match(/(\d+)\s*days?/i);
    if (match) durationDays = parseInt(match[1], 10);
}
```

**Dampak**: Karena `notes` bisa diisi dari input yang tidak ketat (admin panel, promo grant, dsb.), attacker yang bisa memengaruhi `notes` bisa memperpanjang durasi Pro sesuai keinginan.

**Rekomendasi**: Simpan `durationDays` di kolom tersendiri (mis. `subscriptions.duration_days`), atau ambil dari `extraData` yang sudah disign. Jangan parse dari `notes`.

---

### HIGH-07: Rate Limit Login Per IP Tidak Cukup untuk Brute Force

| File | Baris |
|------|-------|
| `src/hooks.server.ts` | L22–65 |

Rate limit 100 req/menit per IP di hooks global. Brute force login bisa dilakukan dengan slow-rate attack (99 request/menit) dan rotasi IP.

**Rekomendasi**: Tambahkan rate limit spesifik untuk endpoint login:
- 5 percobaan gagal per email dalam 15 menit.
- Exponential backoff setelah lockout.
- Tracking percobaan gagal di memori atau DB (tabel `login_attempts`).

---

## 🟡 Medium

| ID | Temuan | File | Rekomendasi |
|----|--------|------|-------------|
| MED-01 | `LIKE` tanpa escape wildcard `%` / `_` | Admin search (`admin/users/+page.server.ts`, `admin/+page.server.ts`) | Tambahkan escape untuk `%` → `\%` dan `_` → `\_` |
| MED-02 | Token verifikasi email disimpan plaintext | `emailVerifications.token` di DB, `passwordResetTokens.token` | Simpan SHA-256 token, hash saat verifikasi |
| MED-03 | `userSessions` deduplikasi via IP+UA — spoofing | `session.ts` L42–58 | Selalu insert baris baru, cleanup periodik |
| MED-04 | `generateToken()` pakai `Math.random()` | `src/lib/email/index.ts` L65–77 | Ganti dengan `crypto.randomBytes(32).toString('hex')` |
| MED-05 | Audit log tidak pakai real IP | Banyak endpoint isi `ip: 'api'`/`ip: 'self'` | Panggil `getRealClientIP(event)` untuk endpoint yang punya `event` |
| MED-06 | `getRealClientIP` percaya header proxy tanpa verifikasi | `src/lib/utils/ip.ts` L17–28 | Hanya percaya header jika dari proxy trusted |
| MED-07 | `X-XSS-Protection` deprecated | `hooks.server.ts` L11 | Hapus header tersebut |
| MED-08 | Tidak ada CSP header | `hooks.server.ts` | Aktifkan CSP via `svelte.config.js` → `kit.csp` |

---

## 🟢 Low / Catatan

| ID | Temuan | File | Catatan |
|----|--------|------|---------|
| LOW-01 | `Math.random()` untuk slug generation | `api/links/+server.ts` L14–18 | Risiko kolisi rendah, pakai `crypto.randomUUID()` kalau mau |
| LOW-02 | HSTS header tidak diset | `hooks.server.ts` | Tambahkan `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| LOW-03 | PATCH microsite bisa return undefined | `api/microsites/[slug]/+server.ts` L262–265 | Tambahkan `return json({ ok: true })` di luar block `if links` |
| LOW-04 | Cooldown comment vs actual value mismatch | `api/auth/resend-verification/+server.ts` L65 | Comment "60 detik" tapi cooldown 120 detik |
| LOW-05 | `parseInt` tanpa radix di beberapa tempat | Tersebar | Pakai `parseInt(x, 10)` |
| LOW-06 | Dead code redirect di `[slug]/+page.svelte` | `routes/[slug]/+page.svelte` L20–23 | Tidak pernah jalan, hapus atau comment |
| LOW-07 | File .cjs skrip development di root | `fix-layout.cjs`, `save-dash.cjs`, dll. | Pastikan tidak ikut deploy / masuk public repo |

---

## 📋 Prioritas Rekomendasi

```
Urgensi   Tindakan                          ID Referensi        Status
────────────────────────────────────────────────────────────────────────────
SEGERA    🔴 Perbaiki webhook Mayar          CRIT-01             ✅ Done
SEGERA    🔴 Perbaiki webhook Xendit         CRIT-02             ✅ Done
SEGERA    🔴 Kunci endpoint cron             CRIT-03             ✅ Done
SEGERA    🔴 Hapus bypass email list         CRIT-04             ✅ Done
SEGERA    🔧 Fix `eq(null)` → `isNull`       HIGH-01             ✅ Done
SEGERA    🔧 Hapus devToken leak             HIGH-02             ✅ Done
1–2 mg    🟠 Perketat session lifecycle       HIGH-03             ✅ Done
1–2 mg    🟠 Validasi upload magic bytes      HIGH-04             ✅ Done
1–2 mg    🟠 Validasi amount webhook          HIGH-05             ✅ Done
1–2 mg    🟠 Duration dari kolom sendiri      HIGH-06             ✅ Done
1–2 mg    🟠 Login brute force limit          HIGH-07             ✅ Done
3–4 mg    🟡 LIKE wildcard escape             MED-01              ✅ Done
3–4 mg    🟡 Hash token email di DB           MED-02              ✅ Done
3–4 mg    🟡 Session dedup via IP+UA          MED-03              ✅ Done
3–4 mg    🟡 generateToken pakai crypto       MED-04              ✅ Done
3–4 mg    🟡 Audit log real IP                MED-05              ✅ Done
3–4 mg    🟡 getRealClientIP trust boundary   MED-06              ✅ Done
3–4 mg    🟡 Hapus X-XSS-Protection           MED-07              ✅ Done
3–4 mg    🟡 Aktifkan CSP header              MED-08              ✅ Done
Backlog   🟢 Math.random() untuk slug         LOW-01              ✅ Done
Backlog   🟢 Tambah HSTS header               LOW-02              ✅ Done
Backlog   🟢 PATCH microsite return undefined  LOW-03              ✅ Done
Backlog   🟢 Cooldown comment inkonsisten     LOW-04              ✅ Done
Backlog   🟢 parseInt tanpa radix             LOW-05              ✅ Done
Backlog   🟢 Dead code redirect [slug].svelte LOW-06              ✅ Done
Backlog   🟢 File .cjs legacy di root         LOW-07              ✅ Done
Backlog   🟢 Catch block konteks log          —                   ✅ Done
```

---

## 📁 File yang Di-review

```
src/
├── app.d.ts                    ✅
├── app.html                    ✅
├── hooks.server.ts             ✅
├── lib/
│   ├── auth/
│   │   ├── password.ts         ✅
│   │   ├── session.ts          ✅ HIGH-03, MED-03
│   │   └── plan.ts             ✅
│   ├── db/
│   │   ├── index.ts            ✅
│   │   └── schema.ts           ✅ MED-02
│   ├── email/
│   │   └── index.ts            ✅ MED-04
│   ├── utils/
│   │   ├── ip.ts               ✅ MED-06
│   │   ├── qr.util.ts          ✅
│   │   └── ...                 ✅
│   ├── mayar/index.ts          ✅ CRIT-01
│   ├── xendit/index.ts         ✅ CRIT-02
│   ├── services/               ✅
│   └── subscription-utils.ts   ✅
├── routes/
│   ├── api/
│   │   ├── auth/               ✅ (login, register, forgot, reset, dll.)
│   │   ├── links/              ✅ LOW-01
│   │   ├── microsites/         ✅ LOW-03
│   │   ├── upload/             ✅ HIGH-04
│   │   ├── monitoring/         ✅ CRIT-03
│   │   ├── cron/               ✅ CRIT-03
│   │   └── webhooks/           ✅ CRIT-01, CRIT-02, HIGH-05, HIGH-06
│   ├── dashboard/              ✅
│   ├── [slug]/                 ✅
│   ├── m/[slug]/               ✅
│   └── uploads/[filename]/     ✅
└── lib/subscription-utils.ts   ✅
```

---

*End of Report — Generated from full code audit.*
