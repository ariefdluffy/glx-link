# Migrasi Database - Fitur Font Size

## Masalah
Error 500 terjadi karena kolom `font_size` belum ada di tabel `microsite_links`.

## Solusi

### Opsi 1: Jalankan SQL Langsung (Paling Mudah)
Buka MySQL client (phpMyAdmin, MySQL Workbench, atau terminal) dan jalankan:

```sql
ALTER TABLE `microsite_links` ADD `font_size` int DEFAULT 14;
```

### Opsi 2: Gunakan File Migration yang Sudah Dibuat
Jalankan file `migration-font-size.sql` yang sudah dibuat:

```bash
# Via MySQL command line
mysql -u [username] -p [database_name] < migration-font-size.sql

# Atau via drizzle (jika sudah ada koneksi DB)
# Tapi sepertinya drizzle-kit migrate tidak berfungsi di environment ini
```

### Opsi 3: Manual via phpMyAdmin
1. Buka phpMyAdmin
2. Pilih database Anda
3. Pilih tabel `microsite_links`
4. Klik tab "Structure"
5. Klik "Add column"
6. Isi:
   - Name: `font_size`
   - Type: `INT`
   - Default: `14`
7. Klik "Save"

## Verifikasi
Setelah menjalankan migrasi, refresh halaman `/dashboard/microsites/2/edit` dan error seharusnya hilang.

## File yang Sudah Diubah
✅ Database schema (`src/lib/db/schema.ts`)
✅ Migration file (`drizzle/0005_clear_energizer.sql`)
✅ Editor page dengan input font size
✅ Preview component
✅ Public microsite page
✅ API endpoints (GET, POST, PATCH)

Semua kode sudah siap, tinggal jalankan migrasi database saja! 🚀
