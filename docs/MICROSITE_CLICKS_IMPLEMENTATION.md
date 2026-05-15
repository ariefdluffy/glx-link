# Implementasi Tracking Klik Microsite

## Tanggal: 12 Mei 2024

## Masalah yang Ditemukan

### Shortlinks
✅ **Sudah berfungsi dengan baik**
- Click tracking sudah diimplementasikan di `src/routes/[slug]/+page.server.ts`
- Statistik clicks ditampilkan di dashboard `/dashboard/links`
- Total clicks dihitung dengan benar di dashboard utama

### Microsites
❌ **TIDAK ADA click tracking**
- File `src/routes/m/[slug]/+page.server.ts` tidak melakukan tracking clicks/visits
- Tabel `microsites` tidak memiliki field `clicks`
- Dashboard microsites tidak menampilkan statistik klik

## Solusi yang Diimplementasikan

### 1. Database Schema
**File: `src/lib/db/schema.ts`**
- ✅ Menambahkan field `clicks: int('clicks').default(0)` ke tabel `microsites`

### 2. Migration SQL
**File: `migration-microsites-clicks.sql`**
- ✅ Script SQL untuk menambahkan kolom `clicks` ke tabel `microsites` yang sudah ada
- ✅ Set default value 0 untuk semua record yang sudah ada

### 3. Click Tracking Logic
**File: `src/routes/m/[slug]/+page.server.ts`**
- ✅ Menambahkan logic untuk increment clicks setiap kali microsite dikunjungi
- ✅ Menggunakan SQL increment: `clicks: sql\`${microsites.clicks} + 1\``

### 4. API Updates
**File: `src/routes/api/microsites/+server.ts`**
- ✅ Menambahkan field `clicks` ke response GET endpoint
- ✅ Memastikan data clicks tersedia untuk frontend

### 5. Type Definitions
**File: `src/lib/types/microsite.types.ts`**
- ✅ Menambahkan `clicks: number | null` ke type `MicrositeItem`
- ✅ Menambahkan `totalClicks: number` ke type `MicrositeStats`

### 6. Dashboard Updates

#### Dashboard Utama (`src/routes/dashboard/+page.server.ts`)
- ✅ Menambahkan query untuk menghitung `totalMicrositeClicks`
- ✅ Menggunakan `sum(microsites.clicks)` untuk aggregate total clicks

#### Dashboard Utama UI (`src/routes/dashboard/+page.svelte`)
- ✅ Mengubah card "Microsite Aktif" menjadi "Klik Microsite"
- ✅ Menampilkan total kunjungan microsite untuk user Pro
- ✅ Menampilkan "-" untuk user Free dengan badge Pro

#### Dashboard Microsites (`src/routes/dashboard/microsites/+page.svelte`)
- ✅ Menambahkan perhitungan `totalClicks` di computed stats
- ✅ Menggunakan `reduce()` untuk menjumlahkan clicks dari semua microsites

#### MicrositeStats Component (`src/lib/components/microsites/MicrositeStats.svelte`)
- ✅ Menambahkan card "Total Klik" ke grid statistik
- ✅ Mengubah grid dari 3 kolom menjadi 4 kolom (sm:grid-cols-4)

#### MicrositeCard Component (`src/lib/components/microsites/MicrositeCard.svelte`)
- ✅ Menampilkan jumlah clicks per microsite dengan icon 👁️
- ✅ Format: "👁️ {clicks} klik"

## Cara Menjalankan Migration

### Opsi 1: Manual via MySQL Client
```bash
mysql -u username -p database_name < migration-microsites-clicks.sql
```

### Opsi 2: Via phpMyAdmin
1. Buka phpMyAdmin
2. Pilih database yang sesuai
3. Klik tab "SQL"
4. Copy-paste isi file `migration-microsites-clicks.sql`
5. Klik "Go"

### Opsi 3: Via Node.js Script
```javascript
// run-migration-microsites.js
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_user',
    password: 'your_password',
    database: 'your_database'
  });

  const sql = fs.readFileSync('./migration-microsites-clicks.sql', 'utf8');
  await connection.query(sql);
  console.log('Migration completed successfully');
  await connection.end();
}

runMigration();
```

## Testing

### 1. Test Click Tracking
1. Buat microsite baru atau gunakan yang sudah ada
2. Kunjungi URL microsite: `https://glx.my.id/m/{slug}`
3. Refresh halaman beberapa kali
4. Cek dashboard microsites - jumlah clicks harus bertambah

### 2. Test Dashboard Stats
1. Login ke dashboard
2. Cek halaman utama - card "Klik Microsite" harus menampilkan total clicks
3. Kunjungi `/dashboard/microsites` - card "Total Klik" harus menampilkan total
4. Setiap microsite card harus menampilkan jumlah clicks individual

### 3. Test API Response
```bash
# Test API endpoint
curl -X GET https://glx.my.id/api/microsites \
  -H "Cookie: session=your_session_cookie"
```

Response harus include field `clicks`:
```json
{
  "microsites": [
    {
      "id": 1,
      "slug": "example",
      "title": "Example",
      "clicks": 42,
      ...
    }
  ]
}
```

## Verifikasi Database

Setelah migration, verifikasi struktur tabel:

```sql
DESCRIBE microsites;
```

Output harus menampilkan kolom `clicks`:
```
+----------------+--------------+------+-----+-------------------+
| Field          | Type         | Null | Key | Default           |
+----------------+--------------+------+-----+-------------------+
| ...            | ...          | ...  | ... | ...               |
| is_active      | tinyint(1)   | YES  |     | 1                 |
| clicks         | int          | YES  |     | 0                 |
| created_at     | datetime     | YES  |     | CURRENT_TIMESTAMP |
+----------------+--------------+------+-----+-------------------+
```

Cek data existing:
```sql
SELECT id, slug, title, clicks FROM microsites;
```

## Files Modified

1. ✅ `src/lib/db/schema.ts` - Added clicks field
2. ✅ `src/routes/m/[slug]/+page.server.ts` - Added click tracking
3. ✅ `src/routes/api/microsites/+server.ts` - Added clicks to API response
4. ✅ `src/lib/types/microsite.types.ts` - Updated types
5. ✅ `src/routes/dashboard/+page.server.ts` - Added microsite clicks query
6. ✅ `src/routes/dashboard/+page.svelte` - Updated UI to show microsite clicks
7. ✅ `src/routes/dashboard/microsites/+page.svelte` - Added totalClicks calculation
8. ✅ `src/lib/components/microsites/MicrositeStats.svelte` - Added clicks card
9. ✅ `src/lib/components/microsites/MicrositeCard.svelte` - Display clicks per microsite

## Files Created

1. ✅ `migration-microsites-clicks.sql` - Database migration script
2. ✅ `MICROSITE_CLICKS_IMPLEMENTATION.md` - This documentation

## Rollback (Jika Diperlukan)

Jika perlu rollback perubahan database:

```sql
-- Remove clicks column from microsites table
ALTER TABLE microsites DROP COLUMN clicks;
```

**Note:** Rollback code changes menggunakan git:
```bash
git checkout HEAD -- src/lib/db/schema.ts
git checkout HEAD -- src/routes/m/[slug]/+page.server.ts
# ... dst untuk file lainnya
```

## Kesimpulan

✅ **Masalah telah diselesaikan:**
- Microsite sekarang memiliki click tracking yang berfungsi
- Dashboard menampilkan statistik clicks untuk microsites
- Setiap kunjungan ke microsite akan menambah counter clicks
- User dapat melihat performa microsite mereka

✅ **Konsistensi dengan Shortlinks:**
- Logic tracking sama dengan shortlinks (SQL increment)
- Tampilan statistik konsisten di dashboard
- API response structure serupa

🎯 **Next Steps (Opsional):**
- Tambahkan analytics lebih detail (per-link clicks dalam microsite)
- Tambahkan grafik trend clicks over time
- Tambahkan export data clicks ke CSV/Excel
- Tambahkan filter berdasarkan tanggal
