# Implementasi Pembatasan Shortlink untuk User Pro Expired

## Tanggal: 2026-05-15

## Ringkasan Perubahan

Implementasi sistem pembatasan otomatis untuk user dengan status Pro expired, termasuk:
1. Pembatasan jumlah shortlink aktif (maksimal 5)
2. Auto-disable link yang melebihi batas
3. Auto-delete link setelah 7 hari tidak perpanjang langganan

---

## 1. Perubahan Database Schema

### File: `glx-link/src/lib/db/schema.ts`

Menambahkan 2 kolom baru ke tabel `short_links`:
- `isActive` (boolean, default: true) - Status aktif/nonaktif link
- `subscriptionExpiredAt` (datetime, nullable) - Timestamp saat link dinonaktifkan karena expired

### Migration SQL: `glx-link/drizzle/0012_short_links_active_columns.sql`

```sql
ALTER TABLE `short_links` 
ADD COLUMN `is_active` boolean DEFAULT true AFTER `clicks`;

ALTER TABLE `short_links` 
ADD COLUMN `subscription_expired_at` datetime AFTER `is_active`;
```

**Cara Menjalankan:**
```bash
mysql -u root -p glx_db < drizzle/0012_short_links_active_columns.sql
```

---

## 2. Cron Job untuk Cleanup Otomatis

### File: `glx-link/src/routes/api/cron/cleanup-shortlinks/+server.ts`

Endpoint cron job yang menangani:

**Skenario 1: User Pro Expired < 7 hari**
- Ambil semua link user yang expired
- Urutkan berdasarkan `createdAt` (terlama ke terbaru)
- Nonaktifkan link yang melebihi 5 link terakhir
- Set `isActive = false` dan `subscriptionExpiredAt = now()`

**Skenario 2: User Pro Expired > 7 hari**
- Hapus SEMUA link yang masih aktif dari user tersebut

**Endpoint:** `GET /api/cron/cleanup-shortlinks`

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "summary": {
    "expiredUsersProcessed": 5,
    "linksDisabled": 12,
    "linksDeleted": 8
  }
}
```

**Setup Cron (Linux/Server):**
```bash
# Edit crontab
crontab -e

# Jalankan setiap 1 jam
0 * * * * curl -X GET https://glx.my.id/api/cron/cleanup-shortlinks

# Atau setiap 6 jam
0 */6 * * * curl -X GET https://glx.my.id/api/cron/cleanup-shortlinks
```

**Setup Cron (Windows Task Scheduler):**
1. Buka Task Scheduler
2. Create Basic Task
3. Trigger: Daily, repeat every 1 hour
4. Action: Start a program
5. Program: `curl`
6. Arguments: `-X GET https://glx.my.id/api/cron/cleanup-shortlinks`

---

## 3. Perubahan API Links

### File: `glx-link/src/routes/api/links/+server.ts`

**POST /api/links - Perubahan:**
- Cek jumlah link AKTIF (bukan total link)
- User Pro expired: maksimal 5 link aktif
- Jika sudah 5, return error (tidak auto-delete lagi)
- Pesan error: "Batas 5 shortlink aktif telah tercapai. Perpanjang langganan untuk mengaktifkan lebih banyak."

**GET /api/links - Perlu Update:**
Saat ini masih return semua link. Perlu ditambahkan field `isActive` di response.

---

## 4. UI/UX Updates

### Dashboard Utama (`glx-link/src/routes/dashboard/+page.svelte`)

Banner peringatan untuk user Pro expired:
- ✗ Tidak dapat membuat microsite baru
- ⚠ Maksimal 5 shortlink aktif (link tidak aktif tidak dihitung)
- ✗ Tidak dapat menggunakan custom slug
- ⚠ Link tidak aktif akan otomatis dihapus setelah 7 hari tidak perpanjang langganan

### Halaman Create Link (`glx-link/src/routes/dashboard/links/new/+page.svelte`)

Banner peringatan dengan counter:
- Menampilkan jumlah link aktif saat ini (X/5)
- Peringatan bahwa link melebihi batas akan dinonaktifkan
- Peringatan link tidak aktif akan dihapus setelah 7 hari

### Halaman Billing (`glx-link/src/routes/dashboard/billing/+page.svelte`)

**Notifikasi "Langganan Akan Berakhir":**
- Muncul **7 hari sebelum** langganan expired
- Menampilkan countdown hari tersisa
- Menampilkan tanggal expiry
- List pembatasan yang akan terjadi setelah expired
- Tombol CTA "Perpanjang Langganan Sekarang"
- Icon ⏰ untuk visual warning

---

## 5. Logika Pembatasan

### User Free:
- Maksimal 5 shortlink (total)
- Tidak bisa buat microsite
- Tidak bisa pakai custom slug

### User Pro Aktif:
- Unlimited shortlink
- Maksimal 4 microsite
- Custom slug unlimited (15/bulan)

### User Pro Expired:
- Maksimal 5 shortlink **AKTIF**
- Link ke-6 dst akan dinonaktifkan otomatis (via cron)
- Tidak bisa buat microsite baru
- Tidak bisa pakai custom slug
- Setelah 7 hari expired: SEMUA link dihapus permanen

---

## 6. Flow Diagram

```
User Pro Subscription Expires
         |
         v
    Cron Job Runs
         |
         v
   Check Expiry Date
         |
    +----+----+
    |         |
    v         v
< 7 days   > 7 days
    |         |
    v         v
Keep 5     Delete ALL
Latest     Active Links
Links
    |
    v
Disable
Excess
Links
```

---

## 7. Testing Checklist

- [ ] Jalankan migration SQL
- [ ] Test cron endpoint manual: `curl -X GET http://localhost:5173/api/cron/cleanup-shortlinks`
- [ ] Test user Pro expired dengan 10 link:
  - [ ] Cron harus disable 5 link terlama
  - [ ] 5 link terbaru tetap aktif
- [ ] Test user Pro expired > 7 hari:
  - [ ] Cron harus delete semua link
- [ ] Test create link saat sudah 5 aktif:
  - [ ] Harus return error
  - [ ] Tidak boleh create link baru
- [ ] Test UI banner di dashboard
- [ ] Test UI banner di create link page
- [ ] Test counter link aktif (X/5)

---

## 8. Monitoring & Logs

Cron job akan log ke console:
```
[Cron] Disabled link 123 for user 45
[Cron] Deleted 8 links for user 67 (expired >7 days)
```

Untuk monitoring production, setup log aggregation atau check server logs:
```bash
# PM2 logs
pm2 logs glx-link

# Atau direct logs
tail -f /path/to/logs/glx-link.log | grep "\[Cron\]"
```

---

## 9. Rollback Plan

Jika ada masalah:

1. **Disable Cron Job:**
   ```bash
   crontab -e
   # Comment out the cron line
   ```

2. **Revert Migration:**
   ```sql
   ALTER TABLE `short_links` DROP COLUMN `subscription_expired_at`;
   ALTER TABLE `short_links` DROP COLUMN `is_active`;
   ```

3. **Revert Code:**
   ```bash
   git revert <commit-hash>
   ```

---

## 10. Future Improvements

- [ ] Email notification sebelum link dihapus (3 hari sebelum)
- [ ] Dashboard untuk melihat link yang tidak aktif
- [ ] Tombol untuk reaktivasi link (dengan upgrade)
- [ ] Export data link sebelum dihapus
- [ ] Grace period yang bisa dikonfigurasi (bukan hardcode 7 hari)

---

## 11. Related Files

- `glx-link/src/lib/db/schema.ts` - Schema update
- `glx-link/src/lib/auth/plan.ts` - Helper functions
- `glx-link/src/routes/api/cron/cleanup-shortlinks/+server.ts` - Cron job
- `glx-link/src/routes/api/links/+server.ts` - API links update
- `glx-link/src/routes/dashboard/+page.svelte` - Dashboard banner
- `glx-link/src/routes/dashboard/links/new/+page.svelte` - Create link banner
- `glx-link/src/routes/dashboard/links/new/+page.server.ts` - Active links count
- `glx-link/drizzle/0012_short_links_active_columns.sql` - Migration SQL
