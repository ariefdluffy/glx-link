# ✅ GLX.my.id — Fitur yang Sudah Diimplementasikan

> Semua fitur di bawah ini **sudah selesai dieksekusi** dan aktif di codebase.
> Terakhir diperbarui: 11 Mei 2026

---

## 📌 Daftar Isi

1. [Tech Stack Terintegrasi](#-tech-stack-terintegrasi)
2. [Database & ORM](#-database--orm)
3. [Auth System](#-auth-system)
4. [Halaman Publik](#-halaman-publik)
5. [Dashboard](#-dashboard)
6. [Shortlink CRUD](#-shortlink-crud)
7. [Microsite CRUD](#-microsite-crud)
8. [Billing & Langganan](#-billing--langganan)
9. [Settings & Admin](#-settings--admin)
10. [API Endpoints](#-api-endpoints)
11. [File Upload](#-file-upload)
12. [Keamanan](#-keamanan)
13. [Roadmap Terverifikasi](#-roadmap-terverifikasi)

---

## 🧰 Tech Stack Terintegrasi

| Layer | Teknologi | Status |
|-------|-----------|--------|
| Frontend | SvelteKit (SSR + SPA hybrid) | ✅ |
| Styling | Tailwind CSS v4 | ✅ |
| Database | MySQL 8.x via Drizzle ORM | ✅ |
| ORM | Drizzle ORM (schema, migrations, queries) | ✅ |
| Auth | Session-based (bcrypt cost 12) | ✅ |
| Svelte 5 | Runes mode (`$state()`, `$props()`, `$derived()`) | ✅ |

---

## 🗂️ Database & ORM

### Semua tabel terdefinisi di `src/lib/db/schema.ts`:

| Tabel | Kolom | Catatan |
|-------|-------|---------|
| `users` | id, name, email, password, **role** (user/admin), plan (free/pro), plan_expires_at, created_at | `role` tambahan dari rencana awal |
| `short_links` | id, user_id, slug, destination, is_custom, clicks, created_at | ✅ |
| `microsites` | id, user_id, slug, title, bio, theme, avatar_url, **header_bg**, **animation**, is_active, created_at | `header_bg` & `animation` tambahan |
| `microsite_links` | id, microsite_id, **type** (link/divider/image), label, url, icon, **caption**, **animation**, sort_order | `type`, `caption`, `animation` tambahan |
| `subscriptions` | id, user_id, plan (pro), price (29000), started_at, expires_at, payment_ref | ✅ |

**Migrations:** 2 file SQL di `drizzle/` (0000 + 0001).

---

## 🔐 Auth System

| Fitur | Detail | File |
|-------|--------|------|
| Register | POST `/api/auth/register` — name, email, password + auto-login | `register/+server.ts` |
| Login | POST `/api/auth/login` — email, password + session cookie | `login/+server.ts` |
| Logout | POST `/api/auth/logout` — hapus session + redirect | `logout/+server.ts` |
| Cek Session | GET `/api/auth/me` — return user object atau null | `me/+server.ts` |
| Update Profil | PATCH `/api/auth/update` — ganti nama | `update/+server.ts` |
| Ganti Password | PATCH `/api/auth/password` — verifikasi password lama + hash baru | `password/+server.ts` |

**Session:** Cookie `glx_session` — httpOnly, SameSite=Strict, HMAC-signed dengan `SESSION_SECRET`. TTL 7 hari.

---

## 🖥️ Halaman Publik

### `/` — Halaman Depan

- Navbar dengan logo GLX, tombol Login & Daftar
- **Admin Session Handling:** Jika admin sudah login, tombol "Login" berubah menjadi "Dashboard" dan tombol "Daftar" dinonaktifkan (disabled)
- Hero: headline "Satu Link, Semua Kamu." + CTA
- Form shortlink guest: input URL → POST `/api/links` → tampilkan slug + tombol salin
- Error handling: URL tidak valid, server error
- Slug progresif: coba panjang 4 → 5 → 6 karakter
- **Preview Microsite Interaktif:** Card preview dengan tampilan microsite lengkap (header gradient, avatar, 4 link items dengan icon sosial media, social icons row) yang mencerminkan template microsite sebenarnya
- 3 card fitur: Shortlink Instan, Microsite Keren, Pantau Statistik
- Section pricing: Free vs Pro (Rp 29.000/bulan)
- Footer
- Efek: background gradient glow, glassmorphism, float animation

**File:** `src/routes/+page.svelte`, `+page.server.ts`

### `/register` — Daftar Akun

- Fields: Nama, Email, Password, Konfirmasi Password
- Password strength indicator (3 bar: merah → oranye → hijau)
- Validasi client: min 2 karakter nama, format email, password min 8 + huruf + angka, confirm match
- POST ke `/api/auth/register` → auto-login → redirect `/dashboard`
- Error handling per field

**File:** `src/routes/register/+page.svelte`

### `/login` — Masuk

- Fields: Email, Password
- Validasi client: required + format email
- POST ke `/api/auth/login` → redirect `/dashboard`
- Error: "Email atau password salah"
- Deteksi param `?logged_out=true` → tampilkan notifikasi logout
- **Server-side redirect**: user yang sudah login langsung dialihkan ke `/dashboard`

**File:** `src/routes/login/+page.svelte`, `+page.server.ts`

### `/[slug]` — Redirect Shortlink

- Loader (`+page.server.ts`): lookup slug → 404 jika tidak ada → increment clicks → 302 redirect ke destination
- Server (`+server.ts`): GET endpoint fallback dengan logic sama

**File:** `src/routes/[slug]/+page.server.ts`, `+server.ts`

### `/m/[slug]` — Microsite Publik

- Loader: query microsite by slug → 404 jika tidak aktif
- Render: 4 tema (default, gradient, minimal, neon)
- 7 animasi (fade, slide-up, scale, bounce, flip, zoom, none)
- Tipe link: link (dengan icon emoji map), divider (garis), image (gambar + caption)
- Animasi per-link override
- Header background (custom image/gradient)
- Responsive mobile-first (max-width 480px)
- Footer "Dibuat dengan GLX"

**File:** `src/routes/m/[slug]/+page.server.ts`, `+page.svelte`



---

## 📊 Dashboard

### Layout (`/dashboard`)

- Navbar: logo + "Dashboard" + tombol "Upgrade Pro" (untuk user biasa) atau tombol "Beranda" ke homepage `/` (untuk admin) + "Buat Link"
- Profile bar: avatar initial + name + plan badge
- Tab navigation: Beranda, Shortlink, Microsite, Langganan, Pengaturan, (Admin jika role=admin), Keluar
- Semua halaman dashboard diproteksi session — redirect `/login` jika tidak login

**File:** `src/routes/dashboard/+layout.server.ts`, `+layout.svelte`

### Beranda (`/dashboard`)

- 4 card statistik: Total Link, Total Klik, Microsite Aktif (dengan slot), Paket Akun
- Tabel "Link Terbaru" (5 item terakhir): slug, destination, klik
- Tabel "Microsite Terbaru" (5 item terakhir): title, slug, status, tema, tombol edit
- Quick Actions: + Buat Shortlink, + Buat Microsite
- Empty state: "Belum ada link/microsite"

**File:** `src/routes/dashboard/+page.server.ts`, `+page.svelte`

---

## 🔗 Shortlink CRUD

### List Shortlink (`/dashboard/links`)

- Tabel: slug, destination (truncate), clicks (Pro only), aksi (Salin, Edit, Hapus)
- Copy to clipboard
- Edit modal in-page: ganti slug + destination
- **Delete modal**: glass-panel konfirmasi style, tombol hapus merah, error di dalam modal
- Empty state: "Belum ada shortlink"

**File:** `src/routes/dashboard/links/+page.svelte`

### Buat Shortlink (`/dashboard/links/new`)

- Input URL tujuan
- Toggle: Random slug (semua user) / Custom slug (Pro only)
- Preview: `glx.my.id/[slug]`
- Validasi client + server
- Hasil: tampilkan slug + tombol salin
- Error handling

**File:** `src/routes/dashboard/links/new/+page.svelte`

### API Shortlink

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/links` | List link milik user |
| POST | `/api/links` | Buat link (guest/user). Body: `{ destination, customSlug? }` |
| PATCH | `/api/links/[id]` | Update slug/destination |
| DELETE | `/api/links/[id]` | Hapus link |

**File:** `src/routes/api/links/+server.ts`, `[id]/+server.ts`

---

## 🪄 Microsite CRUD

### Fitur Lengkap

- Hanya untuk user **Pro** (enforced di API)
- Maksimal **4 microsite** per user
- Slug unik global

### List Microsite (`/dashboard/microsites`)

- Tabel: title, slug, status (aktif/nonaktif), aksi (Salin Link, Edit, Buka, Hapus)
- Copy link microsite ke clipboard
- Empty state: "Microsite adalah fitur Pro" + CTA upgrade
- **Delete modal**: glass-panel konfirmasi style, tombol hapus merah, error di dalam modal

**File:** `src/routes/dashboard/microsites/+page.svelte`

### Buat Microsite (`/dashboard/microsites/new`)

- Fields: Judul, Slug, Bio, Avatar (upload), Background Header (upload)
- Tipe link: **link** (label + URL + icon emoji), **divider** (garis), **image** (upload + caption)
- Animasi per-link (fade, slide-up, scale, bounce, flip, zoom, none)
- Pilih tema: default, gradient, minimal, neon
- Pilih animasi global: fade, slide-up, scale, bounce, flip, zoom, none, tanpa animasi
- Checkbox aktif/nonaktif
- **Live preview** di sidebar kanan (mockup HP 320px)
- Grid layout: form kiri, preview kanan (sticky)
- **Daftar Link UI**: URL input full-width dengan border cyan & shadow glow, Label+Icon 2-col row, tombol hapus full-width merah

**File:** `src/routes/dashboard/microsites/new/+page.svelte`

### Edit Microsite (`/dashboard/microsites/[id]/edit`)

- Load data microsite + links dari API
- Semua field sama dengan halaman buat
- Live preview
- Simpan → PATCH API → redirect ke list
- **Daftar Link UI**: URL input full-width dengan border cyan & shadow glow, Label+Icon 2-col row, tombol hapus full-width merah

**File:** `src/routes/dashboard/microsites/[id]/edit/+page.svelte`

### API Microsite

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/microsites` | List microsite user |
| POST | `/api/microsites` | Buat microsite (Pro only) |
| GET | `/api/microsites/[id]` | Detail microsite + links |
| PATCH | `/api/microsites/[id]` | Update microsite + replace links |
| DELETE | `/api/microsites/[id]` | Hapus microsite + cascade links |

**File:** `src/routes/api/microsites/+server.ts`, `[id]/+server.ts`

---

## 💳 Billing & Langganan

### Halaman `/dashboard/billing`

- Status paket saat ini: Free / Pro + tanggal expired + sisa hari
- Card perbandingan: Free vs Pro (Rp 29.000/bulan)
- Panel upgrade: Transfer Bank (manual) dan Midtrans (placeholder)
- Riwayat langganan dari tabel `subscriptions` (plan, price, tanggal, payment_ref)
- Informasi akun (nama, email)

**File:** `src/routes/dashboard/billing/+page.server.ts`, `+page.svelte`

---

## ⚙️ Settings & Admin

### Pengaturan (`/dashboard/settings`)

- **Informasi Profil:** edit nama (PATCH `/api/auth/update`), email read-only
- **Ubah Password:** password lama + baru + konfirmasi (PATCH `/api/auth/password`)
- **Detail Akun:** paket, aktif hingga, terdaftar sejak

**File:** `src/routes/dashboard/settings/+page.server.ts`, `+page.svelte`

### Admin Panel (`/dashboard/admin`)

- Hanya untuk user dengan `role = 'admin'`
- 5 card statistik: Users, Shortlinks, Microsites, Langganan, Total Klik
- Tabel user terbaru (10): name, email, role, plan, created_at
- Tabel semua microsite (20): title, slug, status, user_id

**File:** `src/routes/dashboard/admin/+page.server.ts`, `+page.svelte`

---

## 📡 API Endpoints

### Auth (✅ 6 endpoint)

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout + redirect |
| GET | `/api/auth/me` | Cek session |
| PATCH | `/api/auth/update` | Update profil |
| PATCH | `/api/auth/password` | Ganti password |

### Shortlink (✅ 4 endpoint)

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/links` | Buat shortlink |
| GET | `/api/links` | List link user |
| PATCH | `/api/links/[id]` | Update link |
| DELETE | `/api/links/[id]` | Hapus link |

### Microsite (✅ 5 endpoint)

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/microsites` | Buat microsite |
| GET | `/api/microsites` | List microsite user |
| GET | `/api/microsites/[id]` | Detail + links |
| PATCH | `/api/microsites/[id]` | Update + links |
| DELETE | `/api/microsites/[id]` | Hapus |

### Upload (✅ 1 endpoint)

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/upload` | Upload file (JPG/PNG/WebP/GIF, max 5MB) |

### Redirect (✅ 3 endpoint)

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/[slug]` | Redirect shortlink + catat klik |
| GET | `/m/[slug]` | Render microsite publik |

---

## 📤 File Upload

- Endpoint: POST `/api/upload`
- Validasi: file type (JPG/PNG/WebP/GIF), max size 5MB
- Storage: `static/uploads/{uuid}.{ext}`
- Return: URL path `/uploads/{filename}`
- Digunakan untuk: avatar microsite, header background, gambar link

**File:** `src/routes/api/upload/+server.ts`

---

## 🔒 Keamanan

| Aspek | Implementasi | Status |
|-------|-------------|--------|
| Password | bcrypt cost 12 | ✅ |
| Session | Cookie httpOnly, SameSite=Strict, HMAC-signed | ✅ |
| CSRF | SvelteKit CSRF protection bawaan | ✅ |
| SQL Injection | Parameterized queries via Drizzle ORM | ✅ |
| Slug collision | Validasi duplicate di DB + error message | ✅ |
| Plan enforcement | Guest: 1 link. Free: max 5 random slug. Pro: 15 custom/month + 4 microsite | ✅ |

---

## 🚀 Roadmap Terverifikasi

### v0.1 — MVP ✅

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
- [x] Pilihan tema (4 tema: default, gradient, minimal, neon)
- [x] 7 animasi (fade, slide-up, scale, bounce, flip, zoom, none)
- [x] 3 tipe link (link, divider, image)
- [x] Drag-and-drop urutan link (native HTML5 DnD + tombol ▲/▼)
- [x] Animasi per-link override

### v0.3 — Monetisasi 🚧 (Partial)

- [x] Halaman billing (UI + riwayat langganan)
- [x] Batasan fitur per plan di API (custom slug, microsite)

### v1.0 — Produksi ✅

- [x] QR Code generator (via api.qrserver.com) — shortlink & microsite

---

## 📁 Struktur File Lengkap

```
glx-link/
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── password.ts           → bcrypt hash/verify
│   │   │   └── session.ts            → Session cookie HMAC
│   │   ├── components/
│   │   │   └── MicrositePreview.svelte  → Live preview HP mockup
│   │   ├── db/
│   │   │   ├── index.ts              → MySQL pool + drizzle
│   │   │   └── schema.ts             → 5 tabel Drizzle
│   │   ├── assets/
│   │   │   └── favicon.svg
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte            → Layout global
│   │   ├── layout.css                → Tailwind + custom CSS
│   │   ├── +page.svelte              → Landing page
│   │   ├── register/+page.svelte     → Daftar
│   │   ├── login/+page.svelte        → Masuk
│   │   ├── dashboard/
│   │   │   ├── +layout.server.ts     → Proteksi session
│   │   │   ├── +layout.svelte        → Navbar + tabs
│   │   │   ├── +page.server.ts       → Load stats
│   │   │   ├── +page.svelte          → Beranda
│   │   │   ├── links/
│   │   │   │   ├── +page.svelte      → List + edit + hapus
│   │   │   │   └── new/+page.svelte  → Buat shortlink
│   │   │   ├── microsites/
│   │   │   │   ├── +page.svelte      → List
│   │   │   │   ├── new/+page.svelte  → Buat + preview
│   │   │   │   └── [id]/edit/+page.svelte → Edit + preview
│   │   │   ├── billing/
│   │   │   │   ├── +page.server.ts   → Load subscription
│   │   │   │   └── +page.svelte      → Paket + upgrade
│   │   │   ├── settings/
│   │   │   │   ├── +page.server.ts   → Load user
│   │   │   │   └── +page.svelte      → Edit profil + password
│   │   │   └── admin/
│   │   │       ├── +page.server.ts   → Load stats
│   │   │       └── +page.svelte      → Admin overview
│   │   ├── [slug]/
│   │   │   ├── +page.server.ts       → Redirect + catat klik
│   │   │   ├── +server.ts            → GET redirect
│   │   │   └── +page.svelte          → (unused)
│   │   ├── m/[slug]/
│   │   │   ├── +page.server.ts       → Load microsite
│   │   └── +page.svelte          → Render 4 tema
│   │   └── api/
│   │       ├── auth/ (6 files)
│   │       ├── links/ (2 files)
│   │       ├── microsites/ (2 files)
│   │       └── upload/+server.ts
├── static/
│   └── uploads/                      → File uploads
├── drizzle/                          → Migrations
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
├── package.json
└── .env                              → DATABASE_URL, SESSION_SECRET
```

---

_Dibuat dari analisis codebase GLX.my.id — 2025_
