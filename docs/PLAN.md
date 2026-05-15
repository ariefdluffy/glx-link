# GLX.my.id — Rancangan Aplikasi Web

> Shortlink & Microsite Platform untuk Generasi Digital Indonesia

---

## 📌 Gambaran Umum

**Nama Produk:** GLX  
**Domain Produksi:** `glx.my.id`  
**Domain Development:** `localhost:5173` (SvelteKit dev server)  
**Tagline:** _Satu link, banyak cerita._

Platform GLX adalah layanan shortlink dan microsite yang ditargetkan untuk anak muda Indonesia yang aktif di media sosial. Mirip dengan s.id, GLX memungkinkan pengguna membuat tautan pendek yang mudah dibagikan dan halaman microsite/landing page sederhana tanpa perlu coding.

---

## ✅ Status Implementasi (Terakhir Diperbarui: 14 Mei 2026)

### ✅ Frontend & UI
- SvelteKit + Tailwind CSS v4 + Drizzle ORM + MySQL sudah terintegrasi penuh.
- Svelte 5 runes mode ($state(), $props(), $derived(), event atribut baru).
- Landing page lengkap: hero, form shortlink guest (slug progresif 4→5→6), fitur 3 card, pricing, footer.
- **Admin session handling di homepage:** Jika admin sudah login, tombol "Login" berubah menjadi "Dashboard" dan tombol "Daftar" dinonaktifkan.
- **Preview microsite interaktif:** Card preview dengan tampilan microsite lengkap (header gradient, avatar, 4 link items dengan icon sosial media, social icons row) yang mencerminkan template microsite sebenarnya.
- Dashboard: layout sidebar/nav, ringkasan statistik, quick actions, daftar link & microsite terbaru.
- **Dashboard admin button:** Tombol "Upgrade Pro" berubah menjadi "Beranda" (link ke `/`) untuk user dengan role admin.
- Auto-refresh stats setiap 10 detik di dashboard dan halaman list.
- Live indicator "Live" dengan animasi ping di dashboard.

### ✅ Auth System
- Auth register/login + session cookie (httpOnly, SameSite=Strict, HMAC-signed), bcrypt cost 12.
- Turnstile CAPTCHA integration untuk keamanan.
- Session management: create, verify, clear session.
- User profile: edit nama/email, ganti password.
- Session revocation (logout dari perangkat lain).
- Server-side redirect: user sudah login dikembalikan ke `/dashboard`.

### ✅ Shortlink CRUD
- CRUD shortlink: create (random + custom untuk Pro), list, edit modal, hapus.
- Guest user: 1 link, random slug saja.
- Free user: max 5 shortlink, random slug.
- Pro user: max 15 custom slug/bulan + unlimited random.
- Slug validation: 3-24 karakter, huruf/angka/tanda hubung.
- Copy to clipboard untuk shortlink.
- QR Code generator untuk shortlink (per-item).
- Search dan pagination di halaman list.
- Delete confirmation modal: custom glass-panel modal.

### ✅ Microsite CRUD
- CRUD microsite: create/edit dengan live preview, 4 tema (default/gradient/minimal/neon).
- 7 animasi global (fade, slide-up, scale, bounce, flip, zoom, none).
- 4 tipe link: link (dengan icon), divider (garis), image (gambar + caption), text (label tanpa link).
- Upload avatar + header bg (5MB max, JPG/PNG/WebP/GIF).
- Drag-and-drop urutan link (native HTML5 DnD + tombol ▲/▼).
- Animasi per-link override.
- QR Code generator untuk microsite (per-item + halaman buat/edit).
- Social media links: Facebook, Instagram, YouTube, Website.
- Link text color customization.
- Multi-step form untuk create microsite.
- Empty state dengan CTA upgrade untuk Free user.

### ✅ Halaman Publik
- Halaman publik microsite: `/m/[slug]`.
- Redirect `/[slug]`: lookup → redirect ke tujuan + catat klik.
- Microsite clicks tracking.
- Responsive mobile-first (max-width 480px).
- Footer "Dibuat dengan GLX".

### ✅ API Endpoints
- **Auth (6 endpoint):** register, login, logout, me, update, password.
- **Shortlink (4 endpoint):** GET list, POST create, PATCH update, DELETE.
- **Microsite (5 endpoint):** POST create, GET list, GET detail, PATCH update, DELETE.
- **Upload (1 endpoint):** POST `/api/upload`.
- **Redirect (3 endpoint):** `/[slug]`, `/m/[slug]`, GET fallback.

### ✅ File Upload
- Endpoint: POST `/api/upload`.
- Validasi: file type (JPG/PNG/WebP/GIF), max size 5MB.
- Storage: `static/uploads/{uuid}.{ext}`.
- Return: URL path `/uploads/{filename}`.
- Digunakan untuk: avatar microsite, header background, gambar link.

### ✅ Halaman Dashboard
- `/dashboard` — Beranda (statistik, quick actions, link & microsite terbaru).
- `/dashboard/links` — List shortlink (search, pagination, edit, delete, QR).
- `/dashboard/links/new` — Buat shortlink baru.
- `/dashboard/microsites` — List microsite (stats, edit, delete, QR).
- `/dashboard/microsites/new` — Buat microsite baru (multi-step form).
- `/dashboard/microsites/[id]/edit` — Edit microsite.
- `/dashboard/billing` — Overview paket, perbandingan fitur, riwayat langganan.
- `/dashboard/settings` — Edit profil, ganti password, session management.
- `/dashboard/admin` — Admin panel (overview sistem, user management, microsite management).

### ✅ Billing & Langganan
- Halaman billing: overview paket, perbandingan fitur, riwayat langganan.
- Status paket saat ini: Free / Pro + tanggal expired + sisa hari.
- Panel upgrade: Transfer Bank (manual) dan Midtrans (placeholder).
- Riwayat langganan dari tabel `subscriptions`.
- Filter dan export CSV untuk subscription history.
- Auto-renew toggle.
- Cancel subscription.
- Admin: create subscription untuk user lain.

### ✅ Admin Panel
- Hanya untuk user dengan `role = 'admin'`.
- 5 card statistik: Users, Shortlinks, Microsites, Langganan, Total Klik.
- Tabel user terbaru (10) dengan pagination dan search.
- Tabel semua microsite (20) dengan pagination.
- Form create subscription manual (user, plan, price, duration, payment method, payment ref, auto-renew, notes).

### ✅ Fitur Plan-Based
- Guest: 1 link, random slug saja.
- Free: max 5 shortlink acak, tidak bisa custom slug, tidak bisa microsite.
- Pro: 15 custom slug/bulan + unlimited random + microsite (max 4).
- Enforcement di API level.

### ✅ Keamanan
- Password: bcrypt cost 12.
- Session: Cookie httpOnly, SameSite=Strict, HMAC-signed.
- CSRF: SvelteKit CSRF protection bawaan.
- SQL Injection: Parameterized queries via Drizzle ORM.
- Slug collision: Validasi duplicate di DB + error message.
- Plan enforcement: Guest/Free/Pro limits di API.
- Turnstile CAPTCHA untuk register/login.

### ✅ Fitur Tambahan
- QR Code generator untuk shortlink & microsite (via api.qrserver.com).
- Download QR code dengan custom branding.
- Copy QR link ke clipboard.
- Delete confirmation modal: custom glass-panel style.
- Toast notifications untuk semua aksi.
- Search bar di halaman list shortlink.
- Pagination untuk semua halaman list.
- Empty state dengan CTA yang sesuai.

---

## 🧰 Tech Stack

| Layer          | Teknologi                                     |
| -------------- | --------------------------------------------- |
| Frontend       | SvelteKit (SSR + SPA hybrid)                  |
| Styling        | Tailwind CSS v4                               |
| Database       | MySQL 8.x                                     |
| ORM            | Drizzle ORM                                   |
| Auth           | Session-based (bcrypt untuk hashing password) |
| Hosting (prod) | VPS / shared hosting dengan Node.js support   |
| Dev            | localhost:5173                                |

---

## 📋 Error Handling & Monitoring

### ✅ Error Handling System

#### 1. **Centralized Error Utilities** (`src/lib/utils/error-utils.ts`)

```typescript
// Error codes
export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  VALIDATION_EMAIL_INVALID: 'VALIDATION_EMAIL_INVALID',
  BUSINESS_PLAN_LIMIT: 'BUSINESS_PLAN_LIMIT',
  SERVER_DATABASE_ERROR: 'SERVER_DATABASE_ERROR',
  // ... more
};

// Custom error classes
export class RateLimitError extends Error { ... }
export class ValidationError extends Error { ... }
export class NotFoundError extends Error { ... }
export class ForbiddenError extends Error { ... }
export class UnauthorizedError extends Error { ... }
```

**Features:**
- Consistent error codes untuk debugging
- Human-readable error messages (Indonesian)
- Custom error classes untuk type checking
- Helper functions: `createErrorResponse()`, `isErrorResponse()`, `safeErrorHandler()`

#### 2. **Structured Logging** (`src/lib/logger/index.ts`)

```typescript
import logger from '$lib/logger';

logger.info('User login successful', { userId: 123 }, { ip: '192.168.1.1' });
logger.error('Database connection failed', { error: err.message }, { path: '/api/users' });
logger.errorWithStack('Unexpected error', err, { userId: 123 });
```

**Features:**
- 5 log levels: VERBOSE, DEBUG, INFO, WARN, ERROR, FATAL
- Colored console output (development)
- JSON file output (production)
- Context tracking (IP, userId, path, method)
- Stack trace capture untuk debugging

#### 3. **Global Error Handling** (`src/hooks.server.ts`)

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // HTTPS redirect
  if (!dev && event.url.protocol === 'http:') {
    throw redirect(301, httpsUrl);
  }
  
  return response;
};
```

**Features:**
- Security headers untuk semua responses
- Rate limiting (100 requests/minute per IP)
- HTTPS enforcement (production)
- Automatic error responses

#### 4. **User-Friendly Error Pages** (`src/routes/+error.svelte`)

- 404 Not Found: Helpful tips, quick links
- 500 Server Error: Reassuring message, retry button
- Custom error messages dengan error code badge
- Responsive design dengan illustrations

### ✅ Monitoring System

#### 1. **Health Check API** (`/api/monitoring`)

```json
{
  "success": true,
  "data": {
    "health": {
      "status": "healthy",
      "timestamp": "2026-05-14T11:28:31.735Z",
      "database": "connected"
    },
    "statistics": {
      "totalUsers": 1234,
      "totalLinks": 5678,
      "totalMicrosites": 234,
      "totalClicks": 123456,
      "activeSessions": 456
    },
    "recentActivity": {
      "newUsers24h": 12,
      "newLinks24h": 45,
      "newMicrosites24h": 8
    }
  }
}
```

#### 2. **Audit Logs API** (`/api/monitoring/logs`)

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "action": "user_login",
        "description": "User login successful",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "createdAt": "2026-05-14T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 123,
      "totalPages": 7
    }
  }
}
```

**Features:**
- Filter by action, date range, search
- Pagination support
- User-specific logs
- IP & User-Agent tracking

#### 3. **Audit Logs Table** (`audit_logs`)

```sql
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `action` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `ip` VARCHAR(45),
  `userAgent` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 📊 Usage Examples

#### Logging in API Routes

```typescript
import logger from '$lib/logger';
import { createErrorResponse, ErrorCodes } from '$lib/utils/error-utils';

export const POST = async ({ request, cookies }) => {
  try {
    const payload = await request.json();
    logger.info('Processing request', { endpoint: '/api/links' });
    
    // ... business logic
    
    return json({ success: true, data: result });
  } catch (error) {
    logger.errorWithStack('Failed to create link', error, {
      userId: getSessionUserId(cookies),
      path: '/api/links'
    });
    
    return json(createErrorResponse(ErrorCodes.SERVER_UNKNOWN_ERROR));
  }
};
```

#### Recording Audit Logs

```typescript
import { db } from '$lib/db';
import { auditLogs } from '$lib/db/schema';

// Record login
await db.insert(auditLogs).values({
  userId: user.id,
  action: 'user_login',
  description: 'User login successful',
  ip: clientIp,
  userAgent: userAgent
});

// Record link creation
await db.insert(auditLogs).values({
  userId: user.id,
  action: 'link_created',
  description: `Created shortlink: ${slug}`,
  ip: clientIp,
  userAgent: userAgent
});
```

### 🔧 Configuration

#### Environment Variables

```env
# Logging
LOG_FILE_PATH=/var/log/glx/app.log

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### 📈 Benefits

1. **Better Debugging**: Structured logs dengan context
2. **Security**: Audit trail untuk semua actions
3. **Performance**: Rate limiting mencegah abuse
4. **User Experience**: User-friendly error messages
5. **Monitoring**: Real-time system health check
6. **Compliance**: Audit logs untuk regulatory requirements

### 🚀 Next Steps

1. Run migration: `mysql -u root -p glx < drizzle/0007_audit_logs.sql`
2. Set `LOG_FILE_PATH` di production
3. Add audit logging ke semua API routes
4. Setup monitoring dashboard (Grafana/Prometheus)
5. Configure alerting untuk critical errors

---

## 🗂️ Struktur Database (MySQL)

### Tabel `users`

```sql
CREATE TABLE users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  role        ENUM('user', 'admin') DEFAULT 'user',     -- kolom tambahan
  plan        ENUM('free', 'pro') DEFAULT 'free',
  plan_expires_at DATETIME NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

> **Catatan:** `email` tanpa UNIQUE constraint (validasi manual di API). Kolom `role` tambahan.
```

### Tabel `short_links`

```sql
CREATE TABLE short_links (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,             -- NULL = guest / tanpa akun
  slug        VARCHAR(50) NOT NULL UNIQUE,   -- kode pendek, misal: glx.my.id/abc123
  destination TEXT NOT NULL,
  is_custom   BOOLEAN DEFAULT FALSE,
  clicks      INT UNSIGNED DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- FOREIGN KEY tidak ada di Drizzle schema
);

> **Catatan:** Tidak ada FOREIGN KEY constraints di schema Drizzle. Relasi dijaga di logika aplikasi.
```

### Tabel `microsites`

```sql
CREATE TABLE microsites (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  slug             VARCHAR(50) NOT NULL UNIQUE,   -- glx.my.id/m/username
  title            VARCHAR(150) NOT NULL,
  bio              TEXT NULL,
  theme            VARCHAR(50) DEFAULT 'default',
  avatar_url       VARCHAR(255) NULL,
  header_bg        VARCHAR(255) NULL,              -- ✅ Background banner 16:9
  link_text_color  VARCHAR(20) NULL,               -- ✅ Custom color untuk teks link
  facebook_url     VARCHAR(255) NULL,              -- ✅ Social media footer
  website_url      VARCHAR(255) NULL,              -- ✅ Social media footer
  youtube_url      VARCHAR(255) NULL,              -- ✅ Social media footer
  instagram_url    VARCHAR(255) NULL,              -- ✅ Social media footer
  animation        VARCHAR(50) DEFAULT 'fade',     -- ✅ Global animation
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

> **Catatan:** 
> - Kolom `header_bg`, `animation`, `link_text_color`, dan 4 kolom social media sudah ditambahkan.
> - Animation options: fade, slide-up, scale, bounce, flip, zoom, none.
> - Social media footer hanya muncul jika URL terisi.
```

### Tabel `microsite_links`

```sql
CREATE TABLE microsite_links (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  microsite_id  INT UNSIGNED NOT NULL,
  type          VARCHAR(20) DEFAULT 'link' NOT NULL,  -- ✅ 'link', 'text', 'image', 'divider', 'social'
  label         VARCHAR(100) DEFAULT '' NOT NULL,
  url           TEXT,                                   -- nullable untuk tipe text/divider
  icon          VARCHAR(50) NULL,                      -- nama icon (instagram, twitter, etc)
  caption       VARCHAR(200) NULL,                     -- ✅ caption untuk image
  animation     VARCHAR(50) NULL,                      -- ✅ animasi per-item
  sort_order    TINYINT UNSIGNED DEFAULT 0
);

> **Catatan:**
> - Tipe `social` digunakan untuk icon social inline di daftar links.
> - Tipe `text` untuk label tanpa URL (tidak clickable).
> - Tipe `divider` untuk pemisah visual antar item.
```

### Tabel `subscriptions`

```sql
CREATE TABLE subscriptions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL UNIQUE,
  plan        ENUM('pro') NOT NULL DEFAULT 'pro',
  price       INT NOT NULL DEFAULT 29000,  -- dalam rupiah
  started_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL,
  payment_ref VARCHAR(100) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📋 Fitur & Batas Penggunaan

### 🆓 Akun Guest (Tanpa Register)

- Bisa membuat **1 shortlink** langsung dari halaman depan
- Slug acak 4 karakter (progresif 4→5→6 jika 4 karakter habis)
- Tidak bisa melihat statistik klik
- Link guest tidak dijamin permanen

### 👤 Akun Free (Sudah Register, Belum Berlangganan)

- Maksimal 5 shortlink dengan slug acak
- **Tidak bisa** custom slug
- **Tidak bisa** membuat microsite
- Dashboard sederhana

### 🚀 Akun Pro — Rp 29.000/bulan

- **15 custom shortlink** per bulan
- **4 microsite / landing page**
- Statistik klik per link
- Pilihan tema microsite
- Badge "GLX Pro" di profil

---

## 🗺️ Peta Halaman (Sitemap)

```
/                        → Halaman Depan (Landing + Form shortlink guest) ✅
/register                → Halaman Daftar Akun ✅
/login                   → Halaman Masuk ✅
/dashboard               → Dashboard utama (protected) ✅
/dashboard/links         → Kelola shortlink ✅
/dashboard/links/new     → Buat shortlink baru ✅
/dashboard/microsites    → Kelola microsite ✅
/dashboard/microsites/new         → Buat microsite baru + live preview ✅
/dashboard/microsites/[id]/edit   → Edit microsite + live preview ✅
/dashboard/billing       → Langganan & pembayaran ✅
/dashboard/settings      → Pengaturan akun (edit nama, ganti password) ✅
/dashboard/admin         → Panel admin (stats, users, microsites) ✅
/[slug]                  → Redirect shortlink + catat klik ✅
/m/[slug]                → Tampil microsite publik (4 tema, 7 animasi) ✅
/site/[slug]             → (sudah dihapus, ganti /m/[slug])
```

---

## 🎨 Desain UI & Identitas Visual

### Filosofi Desain

- **Audience:** Anak muda 17–30 tahun, pengguna aktif Instagram, TikTok, Twitter/X
- **Vibe:** Clean, fresh, confident — tidak terlalu corporate, tidak terlalu childish
- **Inspirasi:** Linktree, s.id, Bento.me

### Palet Warna

```css
--color-brand: #7c3aed; /* Violet utama */
--color-accent: #06b6d4; /* Cyan sekunder */
--color-bg: #0f0f12; /* Background gelap */
--color-surface: #18181f; /* Card / panel */
--color-border: #2d2d3a; /* Border subtle */
--color-text: #f4f4f5; /* Teks utama */
--color-muted: #71717a; /* Teks sekunder */
--color-success: #22c55e;
--color-danger: #ef4444;
```

### Tipografi

- **Display / Heading:** `Plus Jakarta Sans` (Google Fonts) — modern, tegas, cocok untuk Indonesia
- **Body:** `Inter` — readable di semua ukuran
- **Monospace (slug preview):** `JetBrains Mono`

### Komponen UI Kunci

- Tombol: rounded-full, shadow glow pada hover (warna brand)
- Card: glassmorphism ringan dengan border tipis
- Input: border-bottom style pada form penting, rounded-lg pada form biasa
- Dark mode sebagai default, opsi toggle light mode

---

## 📄 Detail Halaman

---

### 1. Halaman Depan `/`

**Tujuan:** Konversi pengunjung — coba shortlink langsung atau daftar akun.

**Layout:**

```
[Navbar: Logo GLX | Login/Dashboard (jika admin) | Daftar (disabled jika admin) →]

[HERO]
  Headline besar: "Satu Link, Semua Kamu."
  Subheadline: Buat shortlink & microsite gratis. Cocok buat content creator, UMKM, dan kamu.

[PREVIEW MICROSITE INTERAKTIF]
  Card preview dengan tampilan microsite lengkap:
  - Header gradient (violet-fuchsia-pink)
  - Avatar dengan initial
  - Profile (Naya Aruna - Content Creator & Lifestyle Blogger)
  - 4 Link items dengan icon sosial media (Instagram, YouTube, Toko Online, Portfolio)
  - Social icons row (Facebook, Twitter, Instagram)
  - Footer "Dibuat dengan GLX Pro"

[FORM SHORTLINK GUEST]
  Input: Paste link panjangmu...
  Tombol: Persingkat Sekarang →
  (Hasil muncul di bawah form: glx.my.id/xxxxx | Salin | QR Code)
  Catatan kecil: "Daftar gratis untuk menyimpan & kelola linkmu"

[SECTION FITUR]
  3 kolom card:
  - 🔗 Shortlink Instan
  - 🪄 Microsite Keren
  - 📊 Pantau Statistik

[SECTION PRICING]
  2 pilihan: Free vs Pro (Rp 29.000/bln)
  Tabel perbandingan fitur

[FOOTER]
  © 2025 GLX.my.id | Syarat | Privasi | Kontak
```

**Rincian Implementasi:**

- Struktur: `Navbar`, `Hero`, `MicrositePreview`, `ShortlinkForm`, `FeatureCards`, `Pricing`, `Footer`
- **Admin session handling:** Server load function cek session, jika admin maka navbar menampilkan "Dashboard" dan disable tombol "Daftar"
- **Preview microsite interaktif:** Tampilan lengkap microsite dengan design yang menarik, mencerminkan template sebenarnya
- Shortlink guest: input URL + fetch POST `/api/links` → tampilkan slug hasil + tombol salin
- CTA utama: tombol daftar dan login di navbar + CTA di hero
- Validasi input URL di client (format URL dasar)
- Empty state: placeholder `glx.my.id/xxxxxxxx` sebelum submit
- Status: **Sudah diimplementasikan** (slug acak 4 karakter, progresif 4→5→6, admin handling, preview interaktif)

---

### 2. Halaman Register `/register`

**Form Fields:**
| Field | Tipe | Validasi |
|---|---|---|
| Nama Lengkap | `text` | Required, min 2 karakter |
| Email | `email` | Required, format valid, unique |
| Password | `password` | Required, min 8 karakter, harus ada huruf + angka |
| Konfirmasi Password | `password` | Harus sama dengan password |

**Password Hashing:** `bcrypt` dengan cost factor 12

**Flow:**

1. User isi form → klik Daftar
2. Frontend validasi lokal (Svelte reactive validation)
3. POST ke `/api/auth/register`
4. Server hash password dengan bcrypt
5. Insert ke tabel `users`
6. Auto-login (buat session) → redirect ke `/dashboard`

**UI Notes:**

- Password strength indicator (bar warna: merah → oranye → hijau)
- Toggle show/hide password
- Link ke halaman Login di bawah form

**Rincian Implementasi:**

- Form state: `name`, `email`, `password`, `confirmPassword`
- Validasi client: required, min length, format email, password rules, match confirm
- Submit: disable tombol saat proses, tampilkan error ringkas per field
- Sukses: redirect ke `/dashboard`
- Status: **Sudah diimplementasikan**

---

### 3. Halaman Login `/login`

**Form Fields:**
| Field | Tipe |
|---|---|
| Email | `email` |
| Password | `password` |

**Flow:**

1. POST ke `/api/auth/login`
2. Cari user by email → verifikasi bcrypt
3. Buat session (cookie httpOnly)
4. Redirect ke `/dashboard`

**UI Notes:**

- "Lupa password?" → (bisa dikembangkan di v2)
- Link ke halaman Register

**Rincian Implementasi:**

- Form state: `email`, `password`
- Validasi client: required + format email
- Submit: tampilkan error kredensial jika salah
- Sukses: redirect ke `/dashboard`
- Server-side load: cek session aktif (`getSessionUserId()`) → redirect ke `/dashboard`
- Status: **Sudah diimplementasikan**

---

### 4. Dashboard `/dashboard`

**Layout:** Sidebar kiri + konten kanan (responsive: bottom nav di mobile)

**Header:**
- Logo + "Dashboard"
- Tombol "Upgrade Pro" (untuk user biasa) atau "Beranda" ke `/` (untuk admin)
- Tombol "Buat Link"

**Sidebar Menu:**

```
[Avatar + Nama]
─────────────────
🏠 Beranda
🔗 Shortlink
🪄 Microsite
💳 Langganan
⚙️ Pengaturan
🚪 Keluar
```

**Halaman Beranda Dashboard:**

- Ringkasan: total link, total klik, microsite aktif
- Quick action: + Buat Shortlink | + Buat Microsite
- Tabel link terbaru (5 item)

**Rincian Implementasi:**

- Layout: sidebar desktop, bottom nav mobile
- Konten awal: data mock untuk ringkasan dan tabel
- Proteksi route: redirect ke `/login` jika belum login
- Status: **Sudah diimplementasikan** (dashboard dasar + proteksi session)

---

### 5. Kelola Shortlink `/dashboard/links`

**Tabel link:**
| Kolom | Keterangan |
|---|---|
| Slug | `glx.my.id/[slug]` + tombol salin |
| Tujuan | URL asli (truncate) |
| Klik | Jumlah klik |
| Tanggal | Dibuat pada |
| Aksi | Edit \| Hapus \| QR |

**Buat Shortlink Baru:**

- Input URL tujuan
- Toggle: Random slug / Custom slug (khusus Pro)
- Preview: `glx.my.id/[slug]`
- Tombol Simpan

**Batasan Pro:**

- Jika user Free mencoba custom slug → muncul modal upgrade ke Pro

**Rincian Implementasi:**

- Tabel list: slug, tujuan, klik, tanggal, aksi
- Aksi: copy slug, edit (modal), hapus link (konfirmasi)
- Form buat link: URL + toggle random/custom + preview slug
- Limit Pro: blok custom slug dan tampilkan CTA upgrade
- Status: **Sudah diimplementasikan** (CRUD API + UI)

---

### 6. Microsite `/dashboard/microsites`

**Halaman buat/edit microsite:**

- ✅ Upload avatar/foto profil
- ✅ Upload banner/header background (16:9)
- ✅ Nama / judul halaman
- ✅ Bio singkat (max 160 karakter)
- ✅ Daftar link yang bisa di-drag untuk urutan:
  - Label (misal: Instagram)
  - URL
  - Icon (pilih dari preset: Instagram, TikTok, Twitter, YouTube, WhatsApp, dll)
  - ✅ **Tipe item:** Link, Text, Image, Divider, Social
  - ✅ **Caption untuk image**
  - ✅ **Animasi per-item:** fade, slide-up, scale, bounce, flip, zoom, none
- ✅ Pilih tema tampilan (4 pilihan: Default, Gradient, Minimal, Neon)
- ✅ Pilih animasi global (fade, slide-up, scale, bounce, flip, zoom, none)
- ✅ **Kustomisasi warna teks link** (color picker)
- ✅ **Social Media Footer:** Facebook, Website, YouTube, Instagram (icon 44px)
- ✅ Slug halaman: `glx.my.id/m/[slug]`
- ✅ QR Code generator untuk share
- ✅ Preview real-time di panel kanan

**Tampilan Publik microsite:**

- ✅ Mobile-first, lebar max 390px (max-w-97.5)
- ✅ Banner 16:9 dengan background custom
- ✅ Avatar bulat (80px) tumpang tindih dengan banner
- ✅ Nama + Bio dengan styling per tema
- ✅ Daftar tombol link dengan icon (SVG atau emoji)
- ✅ Support berbagai tipe konten: Link, Text, Image, Divider, Social
- ✅ Animasi entrance per item
- ✅ Warna teks link custom (jika diset)
- ✅ Social media footer (hanya muncul jika ada URL)
- ✅ Responsive untuk semua tema (default, gradient, neon)
- Status: **✅ Fully Implemented** (CRUD + public page + advanced features)

---

### 7. Halaman Langganan `/dashboard/billing`

**Tampilan:**

- Status langganan saat ini (Free / Pro + tanggal expired + sisa hari)
- Card perbandingan: Free vs Pro (Rp 29.000/bulan) dengan daftar fitur
- Panel upgrade: Transfer Bank (manual) dan Midtrans (placeholder)
- Riwayat langganan dari tabel `subscriptions`
- Informasi akun (nama, email)

**Status: ✅ Sudah diimplementasikan** (UI + data dari DB)
**Payment:** Integrasi Midtrans / Duitku masih placeholder. Sementara manual konfirmasi transfer.

---

### 8. Halaman Pengaturan `/dashboard/settings`

**Form Fields:**
| Field | Tipe | Validasi |
|---|---|---|
| Nama | `text` | Required, min 2 karakter |
| Email | `email` | Read-only (tidak bisa diubah) |
| Password Saat Ini | `password` | Required untuk ganti password |
| Password Baru | `password` | Min 8 karakter, huruf + angka |
| Konfirmasi Password | `password` | Harus sama dengan password baru |

**API Endpoints yang digunakan:**
- PATCH `/api/auth/update` — update nama
- PATCH `/api/auth/password` — ganti password

**Status: ✅ Sudah diimplementasikan**

### 9. Halaman Admin `/dashboard/admin`

**Tampilan:**
- Card statistik: Users, Shortlinks, Microsites, Langganan, Total Klik
- Tabel user terbaru (10 terakhir): nama, email, role, plan, created_at
- Tabel semua microsite: title, slug, status aktif, user ID

**Akses:** Hanya user dengan `role = 'admin'`

**Status: ✅ Sudah diimplementasikan**

---

## 🔌 API Endpoints (SvelteKit Server Routes)

### Auth — ✅ Sudah

| Metode | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/register` | Daftar akun baru (name, email, password) — auto-login |
| POST | `/api/auth/login` | Login (email, password) — buat session cookie |
| POST | `/api/auth/logout` | Logout — hapus session + redirect `/login` |
| GET | `/api/auth/me` | Cek session aktif — return user object atau null |
| PATCH | `/api/auth/update` | Update profil (name, email) — protected |
| PATCH | `/api/auth/password` | Ganti password (currentPassword, newPassword) — protected |

### Shortlink — ✅ Sudah

| Metode | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/links` | Buat shortlink (guest/user). Body: `{ destination, customSlug? }` |
| GET | `/api/links` | List link milik user (protected) |
| PATCH | `/api/links/[id]` | Update slug/destination (protected) |
| DELETE | `/api/links/[id]` | Hapus link (protected) |

### Microsite — ✅ Sudah

| Metode | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/microsites` | Buat microsite (Pro only). Body: `{ title, slug, bio, theme, avatarUrl, headerBg, animation, links[] }` |
| GET | `/api/microsites` | List microsite milik user |
| GET | `/api/microsites/[id]` | Detail microsite + links |
| PATCH | `/api/microsites/[id]` | Update microsite + replace links |
| DELETE | `/api/microsites/[id]` | Hapus microsite + cascade links |

### Upload — ✅ Sudah

| Metode | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/upload` | Upload file (JPG/PNG/WebP/GIF, max 5MB) — protected |

### Redirect — ✅ Sudah

| Metode | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/[slug]` | Lookup shortlink → redirect ke tujuan + increment clicks |
| GET | `/m/[slug]` | Render halaman microsite publik |
| GET | `/site/[slug]` | (sudah dihapus — ganti `/m/[slug]`)

---

## 🔐 Keamanan — Status Implementasi

| Aspek          | Implementasi                                  | Status |
| -------------- | --------------------------------------------- | ------ |
| Password       | bcrypt, cost 12                               | ✅     |
| Session        | Cookie httpOnly, SameSite=Strict, signed HMAC | ✅     |
| Input sanitasi | Validasi manual di server (Zod/Valibot belum) | 🚧     |
| Rate limiting  | Belum diimplementasikan                       | ❌     |
| CSRF           | SvelteKit CSRF protection bawaan              | ✅     |
| SQL Injection  | Parameterized queries via Drizzle ORM         | ✅     |
| Slug collision | Validasi duplicate di DB + error message      | ✅     |

---

## 🚀 Rencana Pengembangan (Roadmap)

### v0.1 — MVP (Localhost) ✅

- [x] Setup SvelteKit + Tailwind + MySQL + Drizzle ORM
- [x] Halaman depan + form shortlink guest (slug progresif 4→5→6)
- [x] Register & Login (bcrypt cost 12)
- [x] Dashboard dasar (statistik, link terbaru, microsite terbaru)
- [x] CRUD shortlink (user, edit modal, custom slug untuk Pro)
- [x] Redirect `/[slug]` + catat klik
- [x] Halaman billing (overview paket, riwayat langganan)
- [x] Settings: edit profil, ganti password
- [x] File upload API (avatar, header bg, gambar link)

### v0.2 — Microsite ✅

- [x] CRUD microsite + live preview saat create/edit
- [x] Halaman publik microsite (`/m/[slug]`)
- [x] Drag-and-drop urutan link (native HTML5 DnD + tombol ▲/▼)
- [x] Pilihan tema (4 tema: default, gradient, minimal, neon)
- [x] 7 animasi (fade, slide-up, scale, bounce, flip, zoom, none)
- [x] 3 tipe link (link, divider, image)
- [x] Animasi per-link override

### v0.3 — Monetisasi 🚧 (Partial)

- [x] Halaman billing (UI + riwayat langganan)
- [x] Batasan fitur per plan di API (custom slug, microsite)
- [ ] Payment gateway (Duitku/Midtrans) — implementasi nyata
- [ ] Middleware rate limiting (10 req/menit)

### v1.0 — Produksi

- [ ] Deploy ke glx.my.id
- [ ] Statistik klik (grafik)
- [x] QR Code generator (via api.qrserver.com)
- [ ] Lupa password (email)
- [ ] Middleware rate limiting formal

### v1.x — Future

- [ ] Analytics UTM
- [ ] Link expiry / password protected link
- [ ] Custom domain untuk microsite
- [ ] API publik untuk developer
- [ ] Light mode toggle

---

## 📁 Struktur Folder Project (SvelteKit) — Aktual

```
glx-link/
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            → Koneksi MySQL pool + drizzle
│   │   │   └── schema.ts           → Drizzle schema: users, short_links, microsites, microsite_links, subscriptions
│   │   ├── auth/
│   │   │   ├── password.ts         → bcrypt hash & verify (cost 12)
│   │   │   └── session.ts          → Session cookie HMAC-signed
│   │   ├── components/
│   │   │   └── MicrositePreview.svelte  → Live preview HP mockup
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte          → Layout global (favicon, CSS)
│   │   ├── layout.css              → Tailwind v4 import + custom CSS
│   │   ├── +page.svelte            → Halaman depan (hero, shortlink form, fitur, pricing, footer)
│   │   ├── register/+page.svelte   → Daftar akun
│   │   ├── login/+page.svelte      → Masuk
│   │   ├── dashboard/
│   │   │   ├── +layout.server.ts   → Proteksi session + data user
│   │   │   ├── +layout.svelte      → Navbar + tab nav + slot
│   │   │   ├── +page.server.ts     → Load stats, latest links, latest microsites
│   │   │   ├── +page.svelte        → Beranda dashboard
│   │   │   ├── links/
│   │   │   │   ├── +page.svelte    → List shortlink + edit modal + hapus
│   │   │   │   └── new/+page.svelte → Buat shortlink (random/custom)
│   │   │   ├── microsites/
│   │   │   │   ├── +page.svelte         → List microsite
│   │   │   │   ├── new/+page.svelte     → Buat microsite + live preview
│   │   │   │   └── [id]/edit/+page.svelte → Edit microsite + live preview
│   │   │   ├── billing/
│   │   │   │   ├── +page.server.ts → Load user + subscription history
│   │   │   │   └── +page.svelte    → Paket saat ini, perbandingan, upgrade, riwayat
│   │   │   ├── settings/
│   │   │   │   ├── +page.server.ts → Load user data
│   │   │   │   └── +page.svelte    → Edit profil + ganti password
│   │   │   └── admin/
│   │   │       ├── +page.server.ts → Load stats, users, microsites
│   │   │       └── +page.svelte    → Admin panel overview
│   │   ├── [slug]/
│   │   │   ├── +page.server.ts     → Redirect shortlink + catat klik
│   │   │   ├── +server.ts          → GET redirect (safety)
│   │   │   └── +page.svelte        → (unused — redirect di server)
│   │   ├── login/+page.server.ts → Redirect user sudah login ke `/dashboard`
│   │   ├── m/[slug]/
│   │   │   ├── +page.server.ts     → Load microsite publik
│   │   │   └── +page.svelte        → Render microsite publik 4 tema
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/+server.ts   → POST daftar
│   │       │   ├── login/+server.ts      → POST login
│   │       │   ├── logout/+server.ts     → POST logout (redirect)
│   │       │   ├── me/+server.ts         → GET cek session
│   │       │   ├── update/+server.ts     → PATCH update profil
│   │       │   └── password/+server.ts   → PATCH ganti password
│   │       ├── links/
│   │       │   ├── +server.ts            → GET list, POST create
│   │       │   └── [id]/+server.ts       → PATCH update, DELETE hapus
│   │       ├── microsites/
│   │       │   ├── +server.ts            → GET list, POST create
│   │       │   └── [id]/+server.ts       → GET detail, PATCH update, DELETE hapus
│   │       └── upload/+server.ts         → POST upload file
├── static/
│   ├── uploads/                          → File uploads (avatar, header, images)
│   └── robots.txt
├── drizzle/                               → Migration files
│   ├── 0000_far_wendigo.sql
│   ├── 0001_free_sally_floyd.sql
│   └── meta/
├── src/app.d.ts
├── src/app.html
├── src/lib/index.ts
├── src/lib/assets/favicon.svg
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts (via CSS v4)
├── drizzle.config.ts
├── eslint.config.js
├── package.json
├── schema.sql                           → Backup SQL reference
└── .env                                 → DATABASE_URL, SESSION_SECRET
```

---

## ⚙️ Konfigurasi Environment (`.env`) — Aktual

```env
# Database (wajib)
DATABASE_URL=mysql://root:password@localhost:3306/glx_db

# Session (wajib) — string random panjang, digunakan HMAC signing
SESSION_SECRET=ganti_dengan_string_random_panjang_32_karakter
```

> **Catatan:** `PUBLIC_BASE_URL`, `PUBLIC_APP_NAME`, dan `UPLOAD_DIR` tidak digunakan di kode saat ini. Base URL hardcoded `'glx.my.id'`. Upload path hardcoded `'static/uploads'`.

---

## 🐞 Bug Diketahui

### Login — Session cookie tidak di-apply setelah login

**Lokasi:** `src/routes/login/+page.svelte` → diubah ke form action `?/login`

**Deskripsi:**
Login pakai `fetch('/api/auth/login')` + `window.location.href` — kadang `Set-Cookie` dari response fetch tidak keproses browser sebelum navigasi, menyebabkan dashboard tampilkan data user lama (salah email).

**Fix:**
- Ganti ke SvelteKit form action (`+page.server.ts` dengan `actions.login`)
- Login page pake `<form method="POST" action="?/login" use:enhance>`
- `Set-Cookie` diproses internal SvelteKit, gak ada race condition
- Redirect via `throw redirect(303, '/dashboard')` di form action

**Status:** ✅ Sudah diperbaiki

---

### Admin Dashboard — Data card tidak reload setelah pagination / form action

**Lokasi:** `src/routes/dashboard/admin/+page.svelte` + `+page.server.ts`

**Deskripsi:**
3 section data di halaman `/dashboard/admin` tidak reload otomatis:
1. **Monitoring & Audit Logs** — 4 card stat (Total Logs, Unique Actions, 24h Logs, Status)
2. **User Terbaru** — tabel users + pagination
3. **Microsite** — tabel microsites + pagination

**Masalah:**
- Pagination (`changePage` → `goto()`): data tidak berubah
- Setelah form action (buat subscription via `use:enhance`): data tidak update
- Harus F5 manual agar semua data ter-refresh dari database

**Fix:**
- `changePage` jadi `async`, panggil `invalidateAll()` setelah `await goto()`
- Form subscription `use:enhance` pake callback — panggil `invalidateAll()` setelah `update()` sukses/redirect

**Status:** ✅ Sudah diperbaiki

---

_Dokumen ini adalah rancangan awal (v0.1). Diperbarui sesuai perkembangan pengembangan._  
_Dibuat untuk project glx.my.id — © 2025_
