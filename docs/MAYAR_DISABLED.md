# 🔒 Mayar Payment - Temporarily Disabled

**Status:** ⏸️ DISABLED  
**Alasan:** Menunggu verifikasi akun Mayar  
**Tanggal:** 2026-05-15

---

## 📋 Status Saat Ini

Tombol pembayaran Mayar di halaman `/dashboard/billing` telah **di-disable sementara** dengan tampilan:

- ✅ Button disabled (tidak bisa diklik)
- ✅ Opacity 50% (terlihat redup)
- ✅ Badge "Segera Hadir" berwarna amber
- ✅ Text: "Menunggu verifikasi akun Mayar"
- ✅ Cursor: not-allowed

---

## 🔓 Cara Mengaktifkan Kembali

Setelah akun Mayar Anda terverifikasi, ikuti langkah berikut:

### **STEP 1: Dapatkan API Key**

1. Login ke https://web.mayar.id (atau https://web.mayar.club untuk sandbox)
2. Pergi ke menu **API Keys**
3. Klik **Create API Key**
4. Pilih permission: **Read & Write**
5. Copy API Key

### **STEP 2: Set Environment Variable**

Edit file `.env`:

```env
# Mayar.id API Key
MAYAR_API_KEY=your_verified_api_key_here
```

### **STEP 3: Enable Button di UI**

Edit file `src/routes/dashboard/billing/+page.svelte` baris ~513:

**BEFORE (Disabled):**
```svelte
<!-- Mayar Payment - DISABLED (Menunggu Verifikasi Akun) -->
<button
    type="button"
    disabled
    class="group cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 p-4 text-left opacity-50"
>
    <div class="flex items-center justify-between">
        <div>
            <div class="font-display flex items-center gap-2 text-sm font-semibold text-white">
                Mayar
                <span class="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">Segera Hadir</span>
            </div>
            <div class="mt-1 text-xs text-white/50">Menunggu verifikasi akun Mayar</div>
        </div>
        <span class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/40">
            Rp 29.000
        </span>
    </div>
</button>
```

**AFTER (Enabled):**
```svelte
<!-- Mayar Payment -->
<button
    type="button"
    onclick={() => (showPromoModal = true)}
    class="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/5"
>
    <div class="flex items-center justify-between">
        <div>
            <div class="font-display text-sm font-semibold text-white group-hover:text-blue-400">
                Mayar
            </div>
            <div class="mt-1 text-xs text-white/50">Pembayaran instan (QRIS, E-Wallet, VA)</div>
        </div>
        <span
            class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition group-hover:border-blue-500/50 group-hover:bg-blue-500/20 group-hover:text-blue-400"
        >
            Bayar Rp 29.000
        </span>
    </div>
</button>
```

### **STEP 4: Setup Webhook**

1. Login ke Mayar Dashboard
2. Pergi ke **Integration** > **Webhook**
3. Masukkan URL: `https://glx.my.id/api/webhooks/mayar`
4. Klik **Save** dan **Test**

### **STEP 5: Restart & Test**

```bash
# Restart dev server
npm run dev

# Test payment
# Buka: http://localhost:5173/dashboard/billing
# Klik tombol "Mayar" (seharusnya sudah aktif)
```

---

## 🔄 Quick Enable Script

Untuk mempermudah, saya sudah siapkan perubahan yang perlu dilakukan:

**File:** `src/routes/dashboard/billing/+page.svelte` (Line ~513-532)

**Hapus:**
```svelte
disabled
class="group cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 p-4 text-left opacity-50"
```

**Ganti dengan:**
```svelte
onclick={() => (showPromoModal = true)}
class="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/5"
```

**Dan hapus badge "Segera Hadir":**
```svelte
<span class="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">Segera Hadir</span>
```

**Ganti text:**
```svelte
<!-- Before -->
<div class="mt-1 text-xs text-white/50">Menunggu verifikasi akun Mayar</div>

<!-- After -->
<div class="mt-1 text-xs text-white/50">Pembayaran instan (QRIS, E-Wallet, VA)</div>
```

---

## ✅ Checklist Aktivasi

Sebelum enable button, pastikan:

- [ ] Akun Mayar sudah terverifikasi
- [ ] API Key sudah didapatkan
- [ ] `MAYAR_API_KEY` sudah di-set di `.env`
- [ ] Database migration sudah dijalankan
- [ ] Webhook URL sudah di-setup di Mayar Dashboard
- [ ] Dev server sudah di-restart
- [ ] Test payment berhasil

---

## 📊 Status Verifikasi Mayar

### **Sandbox (mayar.club)**
- ✅ Tidak perlu verifikasi
- ✅ Langsung bisa digunakan
- ✅ Untuk testing saja

### **Production (mayar.id)**
- ⏳ Perlu verifikasi bisnis
- ⏳ Upload dokumen (KTP, NPWP, dll)
- ⏳ Tunggu approval (1-3 hari kerja)
- ✅ Setelah approved, bisa terima payment real

---

## 🎯 Sementara Waktu

Selama menunggu verifikasi Mayar:

1. ✅ User masih bisa bayar via **Bank Transfer** (tombol hijau)
2. ✅ Tombol Mayar tampil tapi disabled
3. ✅ User tahu bahwa Mayar "Segera Hadir"
4. ✅ Tidak ada error atau confusion

---

## 📝 Notes

- Tombol disabled hanya di UI, backend code tetap siap
- Setelah enable, langsung bisa digunakan tanpa perlu rebuild
- Xendit code masih ada sebagai backup (tidak dihapus)
- Database sudah support Mayar (migration sudah dibuat)

---

## 🚀 Setelah Verifikasi Selesai

Begitu akun Mayar terverifikasi:

1. Dapatkan production API key
2. Set `MAYAR_API_KEY` di `.env`
3. Enable button (hapus `disabled` attribute)
4. Setup webhook URL
5. Test payment
6. Monitor logs
7. Done! 🎉

---

**Status:** ⏸️ Waiting for Mayar account verification  
**ETA:** 1-3 hari kerja setelah submit dokumen  
**Next Action:** Submit verifikasi bisnis di Mayar Dashboard

---

**Last Updated:** 2026-05-15
