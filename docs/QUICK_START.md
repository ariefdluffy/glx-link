# 🚀 QUICK START GUIDE - Deployment

## ⚡ Langkah Cepat Deploy

### 1️⃣ Jalankan Migration (WAJIB!)
```bash
mysql -u root -p glx_db < drizzle/0012_short_links_active_columns.sql
```

### 2️⃣ Restart Dev Server
```bash
# Stop server (Ctrl+C)
rm -rf .svelte-kit
npm run dev
```

### 3️⃣ Test Payment Flow
1. Buka http://localhost:5173/dashboard/billing
2. Klik "Bayar Rp 29.000"
3. Pilih durasi
4. Klik "Lanjut ke Pembayaran"
5. **Harus auto-redirect ke Xendit dalam 1.5 detik**

### 4️⃣ Setup Cron (Production Only)
```bash
crontab -e
# Tambahkan:
0 * * * * curl -X GET https://glx.my.id/api/cron/cleanup-shortlinks
```

---

## 🔍 Quick Test Commands

```bash
# Test environment variables
curl http://localhost:5173/api/test-env

# Test cron job
curl http://localhost:5173/api/cron/cleanup-shortlinks

# Check database columns
mysql -u root -p glx_db -e "DESCRIBE short_links;"
```

---

## ✅ Checklist Sebelum Deploy

- [ ] Migration database sudah jalan
- [ ] `.env` sudah benar (XENDIT_SECRET_KEY, dll)
- [ ] Dev server sudah restart
- [ ] Test payment flow berhasil
- [ ] Auto-redirect ke Xendit berfungsi
- [ ] Backup database production

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| XENDIT_SECRET_KEY not set | Restart dev server + hapus `.svelte-kit` |
| Tidak redirect ke Xendit | Cek console browser untuk error |
| Cron job tidak jalan | Test manual dengan curl |
| Migration error | Cek kolom sudah ada atau belum |

---

## 📞 Support

Jika ada masalah, cek dokumentasi lengkap:
- `FINAL_SUMMARY_2026-05-15.md` - Ringkasan lengkap
- `ENV_SETUP.md` - Setup environment variables
- `FIX_ENV_VARIABLES.md` - Fix env issues

---

**Last Updated:** 2026-05-15 02:32 UTC
