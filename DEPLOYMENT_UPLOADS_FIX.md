# Fix Upload Images di Production

## Masalah
File yang di-upload (avatar dan background header) tidak bisa diakses di production server (https://glx.my.id) dengan error 404.

## Penyebab
1. File upload disimpan di `static/uploads/` yang merupakan bagian dari build artifacts
2. Setiap rebuild akan menghapus folder uploads
3. SvelteKit adapter-node tidak serve static files dari `static/` di production

## Solusi yang Diimplementasikan

### 1. Persistent Upload Directory
- **Development**: File disimpan di `static/uploads/` (seperti biasa)
- **Production**: File disimpan di `/var/www/glx-link/uploads/` (di luar build directory)

### 2. File Changes

#### `src/routes/api/upload/+server.ts`
- Menggunakan environment variable `UPLOAD_DIR` untuk production
- Fallback ke `/var/www/glx-link/uploads` jika tidak ada env var

#### `src/routes/uploads/[filename]/+server.ts` (NEW)
- Endpoint baru untuk serve uploaded files
- Security: mencegah directory traversal attacks
- Cache headers untuk performance

#### `ecosystem.config.cjs`
- Menambahkan `UPLOAD_DIR` environment variable
- Set ke `/var/www/glx-link/uploads`

#### `deploy.sh`
- Menambahkan step untuk create uploads directory jika belum ada
- Set permissions yang tepat (755)

## Cara Deploy

### 1. Push code ke repository
```bash
git add .
git commit -m "Fix: Upload images not accessible in production"
git push origin main
```

### 2. Di server, jalankan deploy script
```bash
cd /var/www/glx-link
./deploy.sh
```

Deploy script akan otomatis:
- Create folder `/var/www/glx-link/uploads/` jika belum ada
- Pull latest code
- Install dependencies
- Build aplikasi
- Restart PM2

### 3. Verifikasi
Setelah deploy, test upload avatar/background di:
https://glx.my.id/dashboard/microsites/new

## Manual Setup (jika perlu)

Jika deploy script gagal, buat folder uploads secara manual:

```bash
# Di server
cd /var/www/glx-link
mkdir -p uploads
chmod 755 uploads
chown -R $USER:$USER uploads

# Restart PM2
pm2 restart glx-link
```

## Testing

1. Login ke dashboard
2. Buat microsite baru
3. Di Step 2 (Appearance), upload avatar dan background
4. Pastikan gambar muncul di preview
5. Check console browser tidak ada error 404

## Troubleshooting

### Jika masih 404 setelah deploy:

1. **Check folder uploads exists:**
   ```bash
   ls -la /var/www/glx-link/uploads/
   ```

2. **Check permissions:**
   ```bash
   chmod 755 /var/www/glx-link/uploads
   ```

3. **Check PM2 environment variables:**
   ```bash
   pm2 show glx-link
   ```
   Pastikan `UPLOAD_DIR` ada di environment variables

4. **Check PM2 logs:**
   ```bash
   pm2 logs glx-link --lines 50
   ```

5. **Restart PM2:**
   ```bash
   pm2 restart glx-link
   ```

### Jika upload gagal (tidak ada file tersimpan):

1. Check write permissions:
   ```bash
   sudo chown -R $USER:$USER /var/www/glx-link/uploads
   ```

2. Check disk space:
   ```bash
   df -h
   ```

## Notes

- Folder `/var/www/glx-link/uploads/` akan tetap ada meskipun rebuild/redeploy
- File yang sudah di-upload tidak akan hilang
- Maksimal ukuran file: 5MB
- Format yang didukung: JPG, PNG, WebP, GIF
