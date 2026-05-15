# Mayar.id Payment Gateway Setup

Integrasi pembayaran Mayar.id telah ditambahkan ke GLX.my.id untuk menggantikan Xendit.

## Environment Variables

Tambahkan variabel berikut ke file `.env` Anda:

```env
# Mayar.id API Key
MAYAR_API_KEY=your_api_key_here

# Base URL untuk redirect setelah pembayaran
PUBLIC_BASE_URL=https://your-domain.com
```

### Cara Mendapatkan API Key

1. Daftar akun di [https://mayar.id](https://mayar.id)
2. Login ke dashboard: [https://web.mayar.id](https://web.mayar.id)
3. Pergi ke menu **API Keys**
4. Klik **Create API Key**
5. Pilih permission: **Read & Write**
6. Copy API Key yang dihasilkan

### Untuk Testing (Sandbox)

Gunakan Mayar Sandbox untuk testing:
- Dashboard: [https://web.mayar.club](https://web.mayar.club)
- API Base: `https://api.mayar.club/hl/v1`

```env
# Development mode akan otomatis menggunakan sandbox
NODE_ENV=development
MAYAR_API_KEY=your_sandbox_api_key_here
PUBLIC_BASE_URL=http://localhost:5173
```

## Setup Webhook

Untuk menerima notifikasi pembayaran otomatis:

1. Login ke Mayar Dashboard
2. Pergi ke **Integration** > **Webhook**
3. Masukkan URL webhook: `https://your-domain.com/api/webhooks/mayar`
4. Klik **Save** dan **Test**

### Testing Webhook di Localhost

Gunakan ngrok untuk testing webhook di localhost:

```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 5173

# Copy URL ngrok (contoh: https://abc123.ngrok.io)
# Set di Mayar Dashboard: https://abc123.ngrok.io/api/webhooks/mayar
```

## Database Migration

Jalankan migration untuk menambahkan 'mayar' ke payment_method enum:

```bash
mysql -u username -p database_name < drizzle/0011_mayar_payment_method.sql
```

Atau jalankan SQL berikut langsung:

```sql
ALTER TABLE subscriptions MODIFY COLUMN payment_method ENUM('bank_transfer', 'xendit', 'mayar', 'manual') DEFAULT 'manual';
```

## Fitur yang Tersedia

### 1. Invoice Payment
Membuat invoice pembayaran yang mendukung berbagai metode:
- Virtual Account (BCA, Mandiri, BNI, BRI, dll)
- E-Wallet (OVO, DANA, LinkAja, ShopeePay, GoPay)
- QRIS
- Retail Outlet (Alfamart, Indomaret)
- Credit Card

### 2. Pilihan Durasi Langganan
- 1 Bulan - Rp 29.000
- 3 Bulan - Rp 87.000
- 1 Tahun - Rp 290.000

### 3. Kode Promo
Sistem mendukung kode promo dengan dua tipe:
- **Persentase**: Diskon berdasarkan persentase harga
- **Fixed**: Diskon nominal tetap

## Endpoint yang Dibuat

### Webhook Callback
```
POST /api/webhooks/mayar
GET /api/webhooks/mayar (health check)
```

Menerima callback dari Mayar saat status pembayaran berubah.

### Billing Page Action
```
POST /dashboard/billing?/createPayment
```

Membuat invoice pembayaran baru untuk subscription Pro.

## Cara Testing

### 1. Development Mode (Sandbox)

1. Set environment variables:
```env
NODE_ENV=development
MAYAR_API_KEY=your_sandbox_api_key
PUBLIC_BASE_URL=http://localhost:5173
```

2. Jalankan dev server:
```bash
npm run dev
```

3. Buka browser: `http://localhost:5173/dashboard/billing`
4. Klik tombol "Bayar"
5. Pilih durasi & masukkan kode promo (opsional)
6. Klik "Lanjutkan ke Pembayaran"
7. Akan redirect ke halaman pembayaran Mayar (sandbox)

### 2. Production Mode

1. Set environment variables:
```env
NODE_ENV=production
MAYAR_API_KEY=your_production_api_key
PUBLIC_BASE_URL=https://glx.my.id
```

2. Setup webhook URL di Mayar Dashboard
3. Deploy aplikasi
4. Test pembayaran real

## Troubleshooting

### Error: "Gagal membuat invoice"

Jika muncul error saat membuat invoice, periksa:

1. **Environment Variables tidak diset**
   - Pastikan `MAYAR_API_KEY` sudah diset di `.env`
   - Cek console log untuk melihat error detail

2. **API Key tidak valid**
   - Pastikan menggunakan API key yang benar (sandbox/production)
   - Verifikasi di Mayar Dashboard > API Keys
   - Pastikan permission adalah **Read & Write**

3. **Network Error**
   - Pastikan server bisa akses `https://api.mayar.id` atau `https://api.mayar.club`
   - Cek firewall atau proxy settings

4. **Amount terlalu kecil**
   - Mayar memiliki minimum amount (biasanya Rp 10.000)
   - Pastikan setelah diskon, harga masih di atas minimum

### Webhook tidak menerima callback

1. **URL tidak accessible**
   - Pastikan callback URL bisa diakses dari internet
   - Gunakan ngrok untuk testing di localhost

2. **URL belum diset di Mayar**
   - Set callback URL di Mayar Dashboard > Integration > Webhook
   - Format: `https://your-domain.com/api/webhooks/mayar`

3. **Test webhook**
   ```bash
   curl -X POST http://localhost:5173/api/webhooks/mayar \
     -H "Content-Type: application/json" \
     -d '{
       "event": "payment.received",
       "data": {
         "id": "test-webhook-id",
         "status": true,
         "amount": 29000,
         "extraData": {
           "external_id": "sub_1_1_123",
           "subscription_id": "1",
           "user_id": "1",
           "plan": "pro",
           "duration_days": 30
         }
       }
     }'
   ```

### Promo code tidak bekerja

1. **Case sensitive**
   - Kode promo otomatis diubah ke uppercase
   - `glx20` akan menjadi `GLX20`

2. **Kode tidak terdaftar**
   - Cek list kode promo di database `promo_codes`
   - Pastikan `is_active = true`
   - Pastikan belum expired

## Alur Pembayaran

1. User klik "Bayar Rp 29.000" di halaman billing
2. Modal muncul dengan pilihan durasi & kode promo
3. User pilih durasi dan masukkan kode promo (opsional)
4. Sistem membuat invoice Mayar dengan external_id `sub_{subscriptionId}_{userId}_{timestamp}`
5. User diarahkan ke halaman pembayaran Mayar
6. User memilih metode pembayaran (VA, E-Wallet, QRIS, dll)
7. User melakukan pembayaran
8. Setelah pembayaran berhasil, Mayar mengirim webhook ke server
9. Webhook handler memverifikasi dan mengaktifkan subscription
10. User plan diupdate ke "pro"
11. User redirect kembali ke billing page dengan status "success"

## File yang Diubah

### Modified Files:
- `src/lib/db/schema.ts` - Tambah 'mayar' ke enum payment_method
- `src/routes/dashboard/billing/+page.server.ts` - Ganti Xendit ke Mayar
- `src/routes/dashboard/billing/+page.svelte` - Update comment Xendit ke Mayar

### New Files:
- `src/lib/mayar/index.ts` - Mayar API service
- `src/routes/api/webhooks/mayar/+server.ts` - Webhook handler
- `drizzle/0011_mayar_payment_method.sql` - Database migration
- `MAYAR_SETUP.md` - Dokumentasi setup (file ini)

## Perbandingan dengan Xendit

| Fitur | Xendit | Mayar.id |
|-------|--------|----------|
| **Invoice API** | ✅ | ✅ |
| **Webhook** | ✅ | ✅ |
| **Virtual Account** | ✅ | ✅ |
| **E-Wallet** | ✅ | ✅ |
| **QRIS** | ✅ | ✅ |
| **Credit Card** | ✅ | ✅ |
| **Retail Outlet** | ✅ | ✅ |
| **Auth Method** | Basic Auth | Bearer Token |
| **External ID** | ✅ | ✅ (via extraData) |
| **Signature Verification** | ✅ | ❌ (basic plan) |
| **Native Subscription** | ❌ | ✅ |
| **Promo Code API** | ❌ | ✅ |
| **Customer Management** | ❌ | ✅ |

## Next Steps

1. ✅ Setup Mayar account dan dapatkan API key
2. ✅ Tambahkan `MAYAR_API_KEY` ke `.env`
3. ✅ Jalankan database migration
4. ✅ Set callback URL di Mayar Dashboard
5. ✅ Test pembayaran di sandbox mode
6. ✅ Deploy ke production
7. ✅ Test pembayaran real

## Catatan Penting

- Mayar memiliki minimum amount (biasanya Rp 10.000)
- Pastikan setelah diskon, harga masih di atas minimum
- Webhook tidak memiliki signature verification di basic plan
- Untuk keamanan tambahan, implementasikan IP whitelist
- Invoice expired dalam 24 jam setelah dibuat
- Sandbox dan production menggunakan API key yang berbeda

## Support

Jika ada masalah:
1. Cek console log untuk error detail
2. Cek Mayar Dashboard > Webhook History
3. Contact Mayar support: [https://mayar.id](https://mayar.id)
4. Dokumentasi API: [https://docs.mayar.id](https://docs.mayar.id)
