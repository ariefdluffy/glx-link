# Update Log - Email Verification & Promo Codes Management

**Tanggal:** 15 Mei 2026
**Status:** ✅ Selesai

## Perubahan yang Dilakukan

### 1. Email Verification di Settings Page ✅

#### File yang Diubah:
- `src/routes/dashboard/settings/+page.server.ts`
  - Menambahkan field `emailVerified` di load function
  
- `src/routes/dashboard/settings/+page.svelte`
  - Menambahkan state untuk email verification
  - Menambahkan function `handleResendVerification()`
  - Menambahkan UI badge status verifikasi (verified/unverified)
  - Menambahkan button "Kirim Verifikasi" untuk email yang belum diverifikasi

#### Fitur:
- ✅ Badge status email (terverifikasi/belum terverifikasi)
- ✅ Button untuk kirim ulang email verifikasi
- ✅ Toast notification setelah kirim email
- ✅ Menggunakan endpoint existing `/api/auth/resend-verification`

### 2. Promo Codes Management System ✅

#### Database Schema:
- `src/lib/db/schema.ts`
  - Menambahkan tabel `promoCodes` dengan fields:
    - `id` - Primary key
    - `code` - Kode promo (unique)
    - `discountType` - Tipe diskon (percent/fixed)
    - `discountValue` - Nilai diskon
    - `maxUses` - Maksimal penggunaan (optional)
    - `usedCount` - Jumlah sudah digunakan
    - `isActive` - Status aktif/nonaktif
    - `expiresAt` - Tanggal expired (optional)
    - `createdAt` - Tanggal dibuat
    - `description` - Deskripsi (optional)

#### Migration:
- `drizzle/0011_promo_codes.sql`
  - SQL untuk create table `promo_codes`
  - Insert 3 kode promo default (GLX20, HEMAT10, NEWUSER)

#### Admin Page (Baru):
- `src/routes/dashboard/admin/promo-codes/+page.server.ts`
  - Load semua promo codes dari database
  - Action `create` - Buat kode promo baru
  - Action `toggleActive` - Aktifkan/nonaktifkan kode promo
  - Action `delete` - Hapus kode promo

- `src/routes/dashboard/admin/promo-codes/+page.svelte`
  - UI untuk list semua kode promo
  - Modal untuk create kode promo baru
  - Button toggle active/inactive
  - Button delete dengan confirmation
  - Badge status (Aktif/Expired/Nonaktif)
  - Tampilan usage count (digunakan/max uses)

#### Billing Page Update:
- `src/routes/dashboard/billing/+page.server.ts`
  - Update logic validasi promo code menggunakan database
  - Check expired date
  - Check max uses
  - Increment used count setelah digunakan
  - Support percent dan fixed discount

## Cara Menggunakan

### Email Verification
1. Login ke dashboard
2. Buka `/dashboard/settings`
3. Jika email belum diverifikasi, akan muncul badge kuning "Email belum diverifikasi"
4. Klik button "Kirim Verifikasi"
5. Cek email untuk link verifikasi

### Promo Codes Management (Admin Only)
1. Login sebagai admin
2. Buka `/dashboard/admin/promo-codes`
3. Klik "Buat Kode Promo"
4. Isi form:
   - Kode Promo (contoh: PROMO50)
   - Tipe Diskon (Persentase/Nominal)
   - Nilai Diskon
   - Maksimal Penggunaan (optional)
   - Tanggal Expired (optional)
   - Deskripsi (optional)
5. Klik "Buat Kode Promo"

### Menggunakan Promo Code (User)
1. Buka `/dashboard/billing`
2. Klik tombol "Xendit"
3. Pilih durasi langganan
4. Masukkan kode promo di field "Kode Promo"
5. Diskon akan otomatis diterapkan
6. Klik "Lanjut ke Pembayaran"

## Migration Database

Jalankan SQL berikut:

```sql
-- Create promo_codes table
CREATE TABLE `promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL UNIQUE,
	`discount_type` enum('percent','fixed') NOT NULL,
	`discount_value` int NOT NULL,
	`max_uses` int,
	`used_count` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`expires_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`description` varchar(255),
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`)
);

-- Insert default promo codes
INSERT INTO `promo_codes` (`code`, `discount_type`, `discount_value`, `description`, `is_active`) VALUES
('GLX20', 'percent', 20, 'Diskon 20% untuk semua paket', true),
('HEMAT10', 'fixed', 10000, 'Diskon Rp 10.000', true),
('NEWUSER', 'percent', 50, 'Diskon 50% untuk user baru', true);
```

Atau:
```bash
mysql -u username -p database_name < drizzle/0011_promo_codes.sql
```

## Fitur Promo Codes

### Validasi Otomatis:
- ✅ Check kode promo aktif/nonaktif
- ✅ Check tanggal expired
- ✅ Check maksimal penggunaan
- ✅ Increment usage count otomatis
- ✅ Case insensitive (GLX20 = glx20)

### Tipe Diskon:
- **Persentase** - Diskon berdasarkan % dari harga
- **Fixed** - Diskon nominal tetap (Rp)

### Management Features:
- ✅ Create kode promo baru
- ✅ Toggle active/inactive
- ✅ Delete kode promo
- ✅ Set max uses (optional)
- ✅ Set expired date (optional)
- ✅ Tracking usage count

## Kode Promo Default

| Kode | Tipe | Nilai | Deskripsi |
|------|------|-------|-----------|
| GLX20 | Persentase | 20% | Diskon 20% untuk semua paket |
| HEMAT10 | Fixed | Rp 10.000 | Diskon Rp 10.000 |
| NEWUSER | Persentase | 50% | Diskon 50% untuk user baru |

## Akses Admin

Untuk mengakses halaman promo codes:
1. User harus memiliki role `admin` di database
2. URL: `/dashboard/admin/promo-codes`
3. Jika bukan admin, akan redirect ke `/dashboard`

## Testing

### Test Email Verification:
1. Register user baru
2. Login dan buka settings
3. Klik "Kirim Verifikasi"
4. Cek console log untuk melihat email terkirim

### Test Promo Codes:
1. Login sebagai admin
2. Buat kode promo baru (contoh: TEST50, 50%, max 10 uses)
3. Logout dan login sebagai user biasa
4. Buka billing page
5. Klik Xendit, masukkan kode TEST50
6. Verify diskon diterapkan
7. Check di admin page bahwa used_count bertambah

## Notes

- Kode promo otomatis diubah ke uppercase
- Kode promo yang expired tetap ada di database tapi tidak bisa digunakan
- Kode promo yang mencapai max uses tidak bisa digunakan lagi
- Admin bisa toggle active/inactive tanpa menghapus kode promo
- Used count akan terus bertambah meskipun kode sudah nonaktif (untuk tracking)

## Next Steps

1. ✅ Jalankan migration `0011_promo_codes.sql`
2. ✅ Test email verification di settings page
3. ✅ Test create promo code di admin page
4. ✅ Test apply promo code di billing page
5. ⏳ Deploy ke production
