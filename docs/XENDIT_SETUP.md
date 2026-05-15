# Xendit Payment Gateway Integration

Integrasi pembayaran Xendit telah ditambahkan ke GLX.my.id untuk menggantikan Midtrans.

## Environment Variables

Tambahkan variabel berikut ke file `.env` Anda:

```env
# Xendit API Keys
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_PUBLIC_KEY=xnd_public_development_...
XENDIT_CALLBACK_TOKEN=xnd_public_development_...

# Base URL untuk redirect setelah pembayaran
PUBLIC_BASE_URL=https://your-domain.com
```

### Cara Mendapatkan API Keys

1. Daftar akun di [Xendit Dashboard](https://dashboard.xendit.co/)
2. Pergi ke **Settings** > **API Keys**
3. Buat API Key baru dengan permissions:
   - `invoice:read`
   - `invoice:create`
   - `ewallet:read`
   - `ewallet:create`
4. Copy Secret Key dan Public Key

### Callback Token

Untuk mendapatkan callback verification token:
1. Pergi ke **Settings** > **Callbacks**
2. Copy **Callback Verification Token**
3. Set URL callback ke: `https://your-domain.com/api/webhooks/xendit`

## Fitur yang Tersedia

### 1. Invoice Payment
Membuat invoice pembayaran yang mendukung berbagai metode:
- Virtual Account (BCA, Mandiri, BNI, BRI, dll)
- E-Wallet (OVO, DANA, LinkAja, ShopeePay)
- QRIS
- Retail Outlet (Alfamart, Indomaret)

### 2. E-Wallet Direct Charge
Charge langsung ke e-wallet tertentu (OVO, DANA, dll)

### 3. Pilihan Durasi Langganan
- 1 Bulan - Rp 29.000
- 3 Bulan - Rp 87.000
- 1 Tahun - Rp 290.000

### 4. Kode Promo
Sistem mendukung kode promo dengan dua tipe:
- **Persentase**: Diskon berdasarkan persentase harga
- **Fixed**: Diskon nominal tetap

#### Kode Promo Default:
- `GLX20` - Diskon 20%
- `HEMAT10` - Diskon Rp 10.000
- `NEWUSER` - Diskon 50%

Untuk menambah kode promo baru, edit file `src/routes/dashboard/billing/+page.server.ts` di bagian `validPromoCodes`.

## Endpoint yang Dibuat

### Webhook Callback
```
POST /api/webhooks/xendit
```

Menerima callback dari Xendit saat status pembayaran berubah.

### Billing Page Action
```
POST /dashboard/billing?/createPayment
```

Membuat invoice pembayaran baru untuk subscription Pro.

## Database Migration

Migration SQL sudah disediakan di `drizzle/0010_xendit_payment_method.sql`.

Jalankan SQL berikut langsung ke database Anda:

```sql
-- Update existing 'midtrans' values to 'xendit'
UPDATE subscriptions SET payment_method = 'xendit' WHERE payment_method = 'midtrans';

-- Alter the column enum
ALTER TABLE subscriptions MODIFY COLUMN payment_method ENUM('bank_transfer', 'xendit', 'manual') DEFAULT 'manual';
```

Atau jalankan file migration:
```bash
mysql -u username -p database_name < drizzle/0010_xendit_payment_method.sql
```

## Testing

### Development Mode (Tanpa ngrok)

Di development mode, jika `XENDIT_CALLBACK_TOKEN` dan `XENDIT_PUBLIC_KEY` tidak diset, verifikasi callback akan di-skip secara otomatis. Ini memudahkan testing tanpa perlu setup tunneling.

**Peringatan:** Jangan gunakan mode ini di production!

### Testing dengan ngrok

Untuk testing callback real dari Xendit di localhost:

1. Install dan jalankan ngrok:
```bash
ngrok http 5173
```

2. Copy URL ngrok (misal: `https://abc123.ngrok.io`)

3. Update `.env`:
```env
PUBLIC_BASE_URL=https://abc123.ngrok.io
```

4. Set callback URL di Xendit Dashboard:
```
https://abc123.ngrok.io/api/webhooks/xendit
```

### Xendit Sandbox

Gunakan Xendit Sandbox untuk testing:
- Secret Key: `xnd_development_...`
- Test VA numbers dan e-wallet tersedia di dokumentasi Xendit

## Troubleshooting

### Error: "Gagal membuat invoice"

Jika muncul error saat membuat invoice, periksa:

1. **Environment Variables tidak diset**
   - Pastikan `XENDIT_SECRET_KEY` sudah diset di `.env`
   - Cek console log untuk melihat error detail

2. **API Key tidak valid**
   - Pastikan menggunakan API key yang benar (development/production)
   - Verifikasi di Xendit Dashboard > Settings > API Keys

3. **Network Error**
   - Pastikan server bisa akses `https://api.xendit.co`
   - Cek firewall atau proxy settings

4. **Amount terlalu kecil**
   - Xendit memiliki minimum amount (biasanya Rp 10.000)
   - Pastikan setelah diskon, harga masih di atas minimum

### Error: "Callback token invalid"

Jika webhook callback gagal:

1. **Development Mode**
   - Jika `XENDIT_CALLBACK_TOKEN` tidak diset, verifikasi akan di-skip otomatis
   - Ini normal untuk development

2. **Production Mode**
   - Set `XENDIT_CALLBACK_TOKEN` di `.env`
   - Token bisa didapat dari Xendit Dashboard > Settings > Callbacks

### Webhook tidak menerima callback

1. **URL tidak accessible**
   - Pastikan callback URL bisa diakses dari internet
   - Gunakan ngrok untuk testing di localhost

2. **URL belum diset di Xendit**
   - Set callback URL di Xendit Dashboard
   - Format: `https://your-domain.com/api/webhooks/xendit`

3. **Test webhook**
   ```bash
   curl -X POST http://localhost:5173/api/webhooks/xendit \
     -H "Content-Type: application/json" \
     -d '{"id":"test","external_id":"sub_1_1_123","status":"PAID"}'
   ```

### Promo code tidak bekerja

1. **Case sensitive**
   - Kode promo otomatis diubah ke uppercase
   - `glx20` akan menjadi `GLX20`

2. **Kode tidak terdaftar**
   - Cek list kode promo di `src/routes/dashboard/billing/+page.server.ts`
   - Tambahkan kode baru jika diperlukan

## Alur Pembayaran

1. User klik "Bayar Rp 29.000" di halaman billing
2. Sistem membuat invoice Xendit dengan external_id `sub_{subscriptionId}_{userId}_{timestamp}`
3. User diarahkan ke halaman pembayaran Xendit
4. Setelah pembayaran berhasil, Xendit mengirim callback ke webhook
5. Webhook memverifikasi token dan mengaktifkan subscription
6. User plan diupdate ke "pro"

## File yang Diubah

- `src/lib/db/schema.ts` - Enum payment_method diubah dari 'midtrans' ke 'xendit'
- `src/lib/subscription-utils.ts` - Update type payment method
- `src/routes/dashboard/billing/+page.svelte` - UI untuk pembayaran Xendit
- `src/routes/dashboard/billing/+page.server.ts` - Action createPayment
- `src/routes/dashboard/admin/+page.svelte` - Update opsi payment method
- `src/routes/dashboard/admin/+page.server.ts` - Update type payment method

## File Baru

- `src/lib/xendit/index.ts` - Xendit API service
- `src/routes/api/webhooks/xendit/+server.ts` - Webhook handler
