# Ringkasan Migrasi: Xendit → Mayar.id Payment Gateway

**Tanggal:** 2026-05-15  
**Status:** ✅ Selesai  
**Versi:** 1.0.0

---

## 📋 Ringkasan Perubahan

Sistem pembayaran telah berhasil dimigrasi dari **Xendit** ke **Mayar.id** dengan tetap mempertahankan struktur code dan logic yang sudah ada.

---

## 🎯 Tujuan Migrasi

1. ✅ Mengganti payment gateway dari Xendit ke Mayar.id
2. ✅ Mempertahankan struktur code dan logic existing
3. ✅ Tidak mengubah flow pembayaran yang sudah ada
4. ✅ Kompatibel dengan sistem subscription yang sudah berjalan

---

## 📦 File yang Dibuat (New Files)

### 1. **Mayar Service**
- **File:** `src/lib/mayar/index.ts`
- **Fungsi:** Service utama untuk integrasi Mayar API
- **Fitur:**
  - `createInvoice()` - Membuat invoice pembayaran
  - `getInvoice()` - Mengambil detail invoice
  - `mapMayarStatus()` - Mapping status Mayar ke internal
  - `verifyWebhookSignature()` - Verifikasi webhook (basic)

### 2. **Webhook Handler**
- **File:** `src/routes/api/webhooks/mayar/+server.ts`
- **Fungsi:** Menerima callback dari Mayar saat pembayaran berhasil
- **Endpoint:**
  - `POST /api/webhooks/mayar` - Webhook callback
  - `GET /api/webhooks/mayar` - Health check

### 3. **Database Migration**
- **File:** `drizzle/0011_mayar_payment_method.sql`
- **Fungsi:** Menambahkan 'mayar' ke enum payment_method
- **SQL:**
  ```sql
  ALTER TABLE subscriptions MODIFY COLUMN payment_method 
  ENUM('bank_transfer', 'xendit', 'mayar', 'manual') DEFAULT 'manual';
  ```

### 4. **Dokumentasi**
- **File:** `MAYAR_SETUP.md`
- **Fungsi:** Panduan lengkap setup dan troubleshooting

---

## 🔧 File yang Dimodifikasi (Modified Files)

### 1. **Database Schema**
- **File:** `src/lib/db/schema.ts`
- **Perubahan:** Tambah 'mayar' ke enum payment_method
- **Before:**
  ```typescript
  paymentMethod: mysqlEnum('payment_method', ['bank_transfer', 'xendit', 'manual'])
  ```
- **After:**
  ```typescript
  paymentMethod: mysqlEnum('payment_method', ['bank_transfer', 'xendit', 'mayar', 'manual'])
  ```

### 2. **Billing Page Server**
- **File:** `src/routes/dashboard/billing/+page.server.ts`
- **Perubahan:**
  - Import: `import { createInvoice } from '$lib/mayar'` (was xendit)
  - Payment method: `paymentMethod: 'mayar'` (was xendit)
  - Log messages: `[Mayar]` (was [Xendit])
  - Invoice response: `invoice.data.link` (was invoice.invoice_url)
  - Invoice ID: `invoice.data.id` (was invoice.id)

### 3. **Billing Page UI**
- **File:** `src/routes/dashboard/billing/+page.svelte`
- **Perubahan:**
  - Comment: "Auto-redirect to Mayar payment page" (was Xendit)
  - Log message: "Redirecting to Mayar payment page" (was Xendit)

---

## 🔄 Perbandingan API

### Xendit API
```typescript
// Create Invoice
const invoice = await createInvoice({
  externalId: 'sub_123_456_789',
  amount: 29000,
  description: 'GLX Pro Plan',
  payerEmail: 'user@example.com',
  payerName: 'User Name',
  metadata: { subscription_id: 123 }
});

// Response
{
  id: 'invoice-id',
  invoice_url: 'https://checkout.xendit.co/...',
  status: 'PENDING'
}
```

### Mayar API
```typescript
// Create Invoice
const invoice = await createInvoice({
  externalId: 'sub_123_456_789',
  amount: 29000,
  description: 'GLX Pro Plan',
  payerEmail: 'user@example.com',
  payerName: 'User Name',
  payerMobile: '081234567890',
  metadata: { subscription_id: 123 }
});

// Response
{
  statusCode: 200,
  messages: 'success',
  data: {
    id: 'invoice-id',
    transactionId: 'transaction-id',
    link: 'https://store.mayar.shop/invoices/...',
    expiredAt: 1234567890000,
    extraData: { subscription_id: 123 }
  }
}
```

---

## 🔐 Environment Variables

### Before (Xendit)
```env
XENDIT_SECRET_KEY=xnd_development_xxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxx
XENDIT_CALLBACK_TOKEN=xxxxx
PUBLIC_BASE_URL=https://glx.my.id
```

### After (Mayar)
```env
MAYAR_API_KEY=your_api_key_here
PUBLIC_BASE_URL=https://glx.my.id
```

**Catatan:** Mayar lebih sederhana, hanya butuh 1 API key.

---

## 🌐 Webhook Comparison

### Xendit Webhook
```json
{
  "id": "invoice-id",
  "external_id": "sub_123_456_789",
  "status": "PAID",
  "amount": 29000,
  "paid_at": "2026-05-15T05:00:00.000Z"
}
```

### Mayar Webhook
```json
{
  "event": "payment.received",
  "data": {
    "id": "webhook-id",
    "status": true,
    "amount": 29000,
    "customerEmail": "user@example.com",
    "extraData": {
      "external_id": "sub_123_456_789",
      "subscription_id": 123,
      "user_id": 456
    }
  }
}
```

---

## ✅ Testing Checklist

### Development (Sandbox)
- [ ] Setup Mayar sandbox account
- [ ] Dapatkan sandbox API key
- [ ] Set `MAYAR_API_KEY` di `.env`
- [ ] Jalankan database migration
- [ ] Test create invoice
- [ ] Test webhook dengan ngrok
- [ ] Test payment flow end-to-end

### Production
- [ ] Setup Mayar production account
- [ ] Dapatkan production API key
- [ ] Set `MAYAR_API_KEY` di production `.env`
- [ ] Setup webhook URL di Mayar Dashboard
- [ ] Deploy ke production
- [ ] Test payment real dengan amount kecil
- [ ] Monitor webhook logs
- [ ] Verify subscription activation

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Backup database dulu
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Run migration
mysql -u username -p database_name < drizzle/0011_mayar_payment_method.sql

# Verify
mysql -u username -p database_name -e "SHOW COLUMNS FROM subscriptions LIKE 'payment_method';"
```

### 2. Environment Variables
```bash
# Add to .env
echo "MAYAR_API_KEY=your_api_key_here" >> .env

# Verify
grep MAYAR_API_KEY .env
```

### 3. Build & Deploy
```bash
# Install dependencies (if needed)
npm install

# Build
npm run build

# Deploy (sesuaikan dengan deployment method Anda)
# Contoh: PM2
pm2 restart glx-link

# Atau: Docker
docker-compose up -d --build
```

### 4. Setup Webhook
1. Login ke https://web.mayar.id
2. Pergi ke Integration > Webhook
3. Set URL: `https://glx.my.id/api/webhooks/mayar`
4. Save & Test

---

## 📊 Monitoring

### Logs to Monitor
```bash
# Application logs
tail -f logs/app.log | grep -i mayar

# Webhook logs
tail -f logs/app.log | grep -i "Mayar Webhook"

# Payment logs
tail -f logs/app.log | grep -i "PAYMENT_"
```

### Database Queries
```sql
-- Check recent Mayar payments
SELECT * FROM subscriptions 
WHERE payment_method = 'mayar' 
ORDER BY started_at DESC 
LIMIT 10;

-- Check pending Mayar payments
SELECT * FROM subscriptions 
WHERE payment_method = 'mayar' 
AND status = 'pending' 
ORDER BY started_at DESC;

-- Check successful Mayar payments today
SELECT COUNT(*) as total, SUM(price) as revenue
FROM subscriptions 
WHERE payment_method = 'mayar' 
AND status = 'active'
AND DATE(started_at) = CURDATE();
```

---

## ⚠️ Rollback Plan

Jika terjadi masalah dan perlu rollback ke Xendit:

### 1. Revert Code Changes
```bash
# Revert billing server
git checkout HEAD~1 -- src/routes/dashboard/billing/+page.server.ts

# Revert billing UI
git checkout HEAD~1 -- src/routes/dashboard/billing/+page.svelte

# Revert schema (optional, karena 'xendit' masih ada di enum)
# git checkout HEAD~1 -- src/lib/db/schema.ts
```

### 2. Restore Environment Variables
```bash
# Restore Xendit keys
XENDIT_SECRET_KEY=xnd_development_xxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxx
XENDIT_CALLBACK_TOKEN=xxxxx
```

### 3. Rebuild & Redeploy
```bash
npm run build
pm2 restart glx-link
```

**Catatan:** Database migration tidak perlu di-rollback karena 'xendit' masih ada di enum.

---

## 📈 Success Metrics

### KPI to Track
1. **Payment Success Rate**
   - Target: > 95%
   - Query: `(successful_payments / total_payments) * 100`

2. **Webhook Delivery Rate**
   - Target: > 99%
   - Monitor: Mayar Dashboard > Webhook History

3. **Average Payment Time**
   - Target: < 5 minutes
   - Track: Time from invoice creation to payment success

4. **Error Rate**
   - Target: < 1%
   - Monitor: Application logs for Mayar errors

---

## 🔍 Troubleshooting Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "MAYAR_API_KEY is not set" | Env var tidak ada | Set `MAYAR_API_KEY` di `.env` |
| "Mayar API Error: 401" | API key invalid | Verify API key di Mayar Dashboard |
| "Mayar API Error: 400" | Request payload invalid | Check console log untuk detail |
| Webhook tidak diterima | URL tidak accessible | Setup ngrok atau verify production URL |
| Payment success tapi subscription tidak aktif | Webhook gagal | Check webhook logs, manual activate jika perlu |
| Invoice expired | User tidak bayar dalam 24 jam | Normal behavior, user bisa create invoice baru |

---

## 📞 Support Contacts

### Mayar Support
- Website: https://mayar.id
- Dashboard: https://web.mayar.id
- Docs: https://docs.mayar.id
- Telegram: https://t.me/mcngroup

### Internal Team
- Developer: [Your Name]
- DevOps: [DevOps Name]
- Support: [Support Email]

---

## 📝 Notes

1. **Xendit code tidak dihapus** - Folder `src/lib/xendit` masih ada untuk referensi
2. **Database backward compatible** - Enum masih include 'xendit' untuk data lama
3. **Webhook URL berbeda** - `/api/webhooks/mayar` (bukan `/api/webhooks/xendit`)
4. **API response structure berbeda** - Mayar pakai nested `data` object
5. **No signature verification** - Mayar basic plan tidak ada signature verification

---

## ✅ Sign-off

- [x] Code changes completed
- [x] Database migration created
- [x] Documentation written
- [x] Testing checklist prepared
- [x] Rollback plan documented

**Status:** Ready for deployment  
**Next Action:** Setup Mayar account & get API key

---

**End of Migration Summary**
