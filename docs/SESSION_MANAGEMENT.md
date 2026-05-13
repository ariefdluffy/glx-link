# Session Management - GLX Link

## Overview

Sistem session management di GLX Link dirancang untuk melacak perangkat yang login ke akun user dan mencegah duplikasi sesi yang tidak perlu.

## Fitur Utama

### 1. **Smart Session Tracking**
- Setiap login/register mencatat sesi ke database
- Jika IP dan User Agent sama, sesi yang lama akan di-update (tidak membuat record baru)
- Menghindari duplikasi sesi dari perangkat yang sama

### 2. **Informasi yang Disimpan**
Setiap sesi menyimpan:
- `userId` - ID user pemilik sesi
- `token` - Token unik untuk identifikasi sesi
- `ip` - IP address user (mendukung Cloudflare, Nginx, dan proxy headers)
- `userAgent` - Browser dan OS information
- `createdAt` - Waktu sesi pertama kali dibuat
- `lastActiveAt` - Waktu terakhir sesi di-update

### 3. **Tampilan di Settings Page**
User dapat melihat:
- Daftar semua perangkat yang login
- Device name (Browser - OS)
- IP address
- Waktu terakhir aktif
- Badge "Sesi Ini" untuk sesi yang sedang aktif
- Tombol untuk mencabut sesi dari perangkat lain

## Implementasi Teknis

### Database Schema

```sql
CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Logika Update vs Insert

Ketika user login, sistem akan:

1. **Cek sesi yang sudah ada** dengan kriteria:
   - `userId` sama
   - `ip` sama
   - `userAgent` sama

2. **Jika ditemukan:**
   - Update `token` dengan token baru
   - Update `lastActiveAt` ke waktu sekarang
   - Tidak membuat record baru

3. **Jika tidak ditemukan:**
   - Insert record sesi baru

### Kode Implementasi

File: `src/lib/auth/session.ts`

```typescript
// Check if session with same IP and User Agent exists
const existingSession = await db
  .select()
  .from(userSessions)
  .where(
    and(
      eq(userSessions.userId, userId),
      eq(userSessions.ip, ip),
      eq(userSessions.userAgent, userAgent)
    )
  )
  .limit(1);

if (existingSession.length > 0) {
  // Update existing session
  await db
    .update(userSessions)
    .set({
      token: payload,
      lastActiveAt: sql`CURRENT_TIMESTAMP`
    })
    .where(eq(userSessions.id, existingSession[0].id));
} else {
  // Create new session
  await db.insert(userSessions).values({
    userId,
    token: payload,
    ip,
    userAgent
  });
}
```

## User Experience

### Skenario 1: Login dari Perangkat yang Sama
**Sebelum:**
- User login dari Chrome Windows → Record baru
- User login lagi dari Chrome Windows → Record baru lagi (duplikasi)
- User melihat 2 sesi yang sama di settings

**Sesudah:**
- User login dari Chrome Windows → Record baru
- User login lagi dari Chrome Windows → Update record yang ada
- User hanya melihat 1 sesi di settings

### Skenario 2: Login dari Perangkat Berbeda
- User login dari Chrome Windows → Record baru
- User login dari Safari iPhone → Record baru
- User melihat 2 sesi berbeda di settings ✓

### Skenario 3: IP Berubah (Dynamic IP)
- User login dari Chrome Windows (IP: 192.168.1.1) → Record baru
- User login lagi dari Chrome Windows (IP: 192.168.1.2) → Record baru
- User melihat 2 sesi (karena IP berbeda)

## API Endpoints

### GET /api/auth/sessions
Mengambil daftar sesi user yang sedang login

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-05-13T05:00:00.000Z",
      "lastActiveAt": "2026-05-13T05:30:00.000Z",
      "isCurrent": true
    }
  ]
}
```

### DELETE /api/auth/sessions/:id
Mencabut sesi tertentu (logout paksa dari perangkat lain)

**Response:**
```json
{
  "success": true,
  "message": "Sesi berhasil dicabut"
}
```

## Security Considerations

1. **IP Detection Priority:**
   - Cloudflare: `cf-connecting-ip`
   - Nginx: `x-real-ip`
   - Standard Proxy: `x-forwarded-for`
   - Fallback: `getClientAddress()`

2. **Session Token:**
   - Format: `userId.timestamp.signature`
   - Signed dengan HMAC SHA-256
   - TTL: 7 hari

3. **Protection:**
   - User hanya bisa melihat sesi miliknya sendiri
   - User hanya bisa mencabut sesi miliknya sendiri
   - Sesi yang sedang aktif tidak bisa dicabut

## Future Improvements

1. **Auto-cleanup:** Hapus sesi yang sudah expired (> 7 hari tidak aktif)
2. **Session limit:** Batasi maksimal jumlah sesi per user (misal: 10 perangkat)
3. **Notification:** Kirim email jika ada login dari perangkat baru
4. **Geolocation:** Tampilkan lokasi berdasarkan IP address
5. **Device fingerprinting:** Identifikasi perangkat lebih akurat

## Changelog

### 2026-05-13
- ✅ Implementasi smart session tracking
- ✅ Update sesi yang sudah ada jika IP dan User Agent sama
- ✅ Mencegah duplikasi sesi dari perangkat yang sama
- ✅ Dokumentasi lengkap

---

**Dibuat oleh:** GLX Link Team  
**Terakhir diupdate:** 2026-05-13
