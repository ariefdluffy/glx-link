# ✨ Fitur Baru: Ukuran Font untuk Text dan Link

**Tanggal:** 11 Mei 2026  
**Status:** ✅ Kode Selesai | ⚠️ Perlu Migrasi Database

## 📋 Deskripsi
Fitur ini memungkinkan pengguna untuk mengubah ukuran font (dalam pixel) untuk elemen **Text** dan **Link** di microsite editor.

## 🎯 Fitur yang Ditambahkan

### 1. Input Ukuran Font
- Range: **8px - 32px**
- Default: **14px**
- Tersedia untuk tipe:
  - ✅ **Link** (tombol dengan URL)
  - ✅ **Text** (label tanpa URL)

### 2. Live Preview
- Perubahan ukuran font langsung terlihat di preview panel
- Font size diterapkan pada:
  - Label text di link button
  - Text label standalone

### 3. Halaman Publik
- Font size tersimpan dan ditampilkan di halaman publik `/m/[slug]`
- Konsisten dengan preview di editor

## 📁 File yang Dimodifikasi

### Database
- ✅ `src/lib/db/schema.ts` - Tambah kolom `fontSize`
- ✅ `drizzle/0005_clear_energizer.sql` - Migration file

### Frontend
- ✅ `src/routes/dashboard/microsites/[id]/edit/+page.svelte` - Editor dengan input font size
- ✅ `src/lib/components/MicrositePreview.svelte` - Preview dengan dynamic font size
- ✅ `src/routes/m/[slug]/+page.svelte` - Public page dengan dynamic font size

### Backend
- ✅ `src/routes/m/[slug]/+page.server.ts` - Query fontSize dari DB
- ✅ `src/routes/api/microsites/[id]/+server.ts` - GET & PATCH dengan fontSize
- ✅ `src/routes/api/microsites/+server.ts` - POST dengan fontSize

## 🚀 Cara Menggunakan

### 1. Jalankan Migrasi Database
```sql
ALTER TABLE `microsite_links` ADD `font_size` int DEFAULT 14;
```

### 2. Edit Microsite
1. Buka `/dashboard/microsites/[id]/edit`
2. Tambah atau edit link/text
3. Lihat input **"Ukuran Font"** dengan nilai dalam px
4. Ubah nilai (8-32)
5. Klik **Simpan**

### 3. Lihat Hasil
- Preview langsung update di panel kanan
- Buka halaman publik `/m/[slug]` untuk melihat hasil final

## 🎨 Contoh Penggunaan

```typescript
// Link dengan font size 18px
{
  type: 'link',
  label: 'Kunjungi Website',
  url: 'https://example.com',
  icon: '🌐',
  fontSize: 18,
  alignment: 'left'
}

// Text dengan font size 24px
{
  type: 'text',
  label: 'Judul Besar',
  fontSize: 24,
  alignment: 'center'
}
```

## 🐛 Troubleshooting

### Error 500 saat load microsite
**Penyebab:** Kolom `font_size` belum ada di database  
**Solusi:** Jalankan migrasi SQL (lihat `MIGRATION-INSTRUCTIONS.md`)

### Font size tidak berubah
**Penyebab:** Browser cache  
**Solusi:** Hard refresh (Ctrl+Shift+R atau Cmd+Shift+R)

## 📝 Technical Details

### Database Schema
```typescript
export const micrositeLinks = mysqlTable('microsite_links', {
  // ... kolom lain
  fontSize: int('font_size').default(14),
  alignment: varchar('alignment', { length: 10 }).default('left'),
  sortOrder: tinyint('sort_order').default(0)
});
```

### CSS Implementation
Font size diterapkan via inline style:
```html
<div style="font-size: 18px;">Label Text</div>
```

## ✅ Checklist Implementasi

- [x] Tambah kolom `fontSize` di schema
- [x] Generate migration file
- [x] Tambah input di editor untuk link
- [x] Tambah input di editor untuk text
- [x] Update preview component
- [x] Update public page
- [x] Update API GET endpoint
- [x] Update API PATCH endpoint
- [x] Update API POST endpoint
- [x] Update server-side query
- [ ] **Jalankan migrasi database** ⚠️

## 🔄 Next Steps

1. **Jalankan migrasi database** (lihat `MIGRATION-INSTRUCTIONS.md`)
2. Test fitur di editor
3. Verifikasi di halaman publik
4. (Opsional) Tambah preset font sizes (Small, Medium, Large)

---

**Catatan:** Semua kode sudah siap dan terintegrasi. Tinggal jalankan migrasi database untuk mengaktifkan fitur ini! 🎉
