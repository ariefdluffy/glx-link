# Dokumentasi Fitur Riwayat Langganan

## Overview
Fitur Riwayat Langganan memungkinkan user untuk melihat dan mengelola semua langganan mereka di halaman `/dashboard/billing`.

## Fitur Utama

### 1. **Informasi Langganan Aktif**
- Menampilkan detail langganan yang sedang aktif
- Informasi paket, harga, tanggal berakhir
- Metode pembayaran yang digunakan
- Status auto-renew
- Tombol untuk toggle auto-renew
- Tombol untuk membatalkan langganan

### 2. **Riwayat Langganan**
- Daftar semua langganan (aktif, expired, cancelled)
- Status badge dengan warna berbeda:
  - **Aktif**: Hijau
  - **Kedaluwarsa**: Kuning/Amber
  - **Dibatalkan**: Merah
- Informasi lengkap setiap langganan:
  - ID langganan
  - Paket dan harga
  - Periode langganan (mulai - berakhir)
  - Metode pembayaran
  - Referensi pembayaran
  - Tanggal pembatalan (jika dibatalkan)
  - Catatan tambahan

### 3. **Filter & Pencarian**
- Filter berdasarkan status (Aktif, Kedaluwarsa, Dibatalkan)
- Filter berdasarkan tanggal mulai
- Filter berdasarkan tanggal akhir
- Tombol reset filter

### 4. **Pagination**
- Menampilkan 10 langganan per halaman (default)
- Navigasi halaman sebelumnya/selanjutnya
- Informasi jumlah total langganan

### 5. **Export Data**
- Export riwayat langganan ke format CSV
- File CSV berisi semua informasi langganan

### 6. **Auto-Renew**
- User dapat mengaktifkan/menonaktifkan auto-renew
- Langganan akan otomatis diperpanjang sebelum expired
- Notifikasi status auto-renew

### 7. **Pembatalan Langganan**
- User dapat membatalkan langganan aktif
- Konfirmasi sebelum pembatalan
- Langganan tetap aktif hingga tanggal berakhir

## Database Schema

### Tabel: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('pro') DEFAULT 'pro',
  price INT DEFAULT 29000,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  payment_ref VARCHAR(100),
  payment_method ENUM('bank_transfer', 'midtrans', 'manual') DEFAULT 'manual',
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT FALSE,
  cancelled_at DATETIME NULL,
  notes TEXT NULL,
  INDEX idx_subscriptions_user_status (user_id, status),
  INDEX idx_subscriptions_started_at (started_at),
  INDEX idx_subscriptions_expires_at (expires_at)
);
```

## File Structure

```
src/
├── lib/
│   ├── db/
│   │   └── schema.ts                    # Database schema dengan field baru
│   └── subscription-utils.ts            # Utility functions untuk subscription
├── routes/
│   ├── api/
│   │   └── cron/
│   │       └── update-subscriptions/
│   │           └── +server.ts           # API endpoint untuk cron job
│   └── dashboard/
│       └── billing/
│           ├── +page.svelte             # UI halaman billing
│           └── +page.server.ts          # Server logic untuk billing
└── migration-subscriptions.sql          # SQL migration file
```

## API Endpoints

### 1. Load Data (GET)
**Endpoint**: `/dashboard/billing`

**Query Parameters**:
- `page` (number): Nomor halaman (default: 1)
- `limit` (number): Jumlah item per halaman (default: 10)
- `status` (string): Filter status ('active', 'expired', 'cancelled')
- `startDate` (string): Filter tanggal mulai (format: YYYY-MM-DD)
- `endDate` (string): Filter tanggal akhir (format: YYYY-MM-DD)

**Response**:
```typescript
{
  user: {
    name: string;
    email: string;
    plan: 'free' | 'pro';
    planExpiresAt: Date | null;
  };
  activeSubscription: {
    id: number;
    plan: string;
    price: number;
    expiresAt: Date;
    autoRenew: boolean;
    paymentMethod: string;
  } | null;
  subscriptions: Array<{
    id: number;
    plan: string;
    price: number;
    startedAt: Date;
    expiresAt: Date;
    paymentRef: string | null;
    paymentMethod: string;
    status: string;
    autoRenew: boolean;
    cancelledAt: Date | null;
    notes: string | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  filters: {
    status: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}
```

### 2. Cancel Subscription (POST)
**Endpoint**: `/dashboard/billing?/cancel`

**Form Data**:
- `subscriptionId` (number): ID langganan yang akan dibatalkan

**Response**:
```typescript
{
  success: boolean;
  message: string;
  error?: string;
}
```

### 3. Toggle Auto-Renew (POST)
**Endpoint**: `/dashboard/billing?/toggleAutoRenew`

**Form Data**:
- `subscriptionId` (number): ID langganan
- `autoRenew` (boolean): Status auto-renew baru

**Response**:
```typescript
{
  success: boolean;
  message: string;
  error?: string;
}
```

### 4. Cron Job - Update Subscriptions (POST)
**Endpoint**: `/api/cron/update-subscriptions`

**Headers**:
- `Authorization: Bearer YOUR_CRON_SECRET`

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    expiredUpdated: any;
    autoRenewals: Array<{
      subscriptionId: number;
      success: boolean;
      newSubscriptionId?: number;
      error?: any;
    }>;
  };
}
```

## Utility Functions

### `updateExpiredSubscriptions()`
Update status langganan yang sudah expired menjadi 'expired'.

### `hasActiveSubscription(userId: number)`
Cek apakah user memiliki langganan aktif.

### `getActiveSubscription(userId: number)`
Ambil data langganan aktif user.

### `createSubscription(data)`
Buat langganan baru untuk user.

**Parameters**:
```typescript
{
  userId: number;
  plan: 'pro';
  price: number;
  durationDays: number;
  paymentRef?: string;
  paymentMethod?: 'bank_transfer' | 'midtrans' | 'manual';
  autoRenew?: boolean;
  notes?: string;
}
```

### `cancelSubscription(subscriptionId: number, userId: number)`
Batalkan langganan.

### `renewSubscription(subscriptionId: number)`
Perpanjang langganan (untuk auto-renew).

### `getSubscriptionStats(userId: number)`
Ambil statistik langganan user.

**Returns**:
```typescript
{
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  totalSpent: number;
}
```

### `processAutoRenewals()`
Proses auto-renewal untuk langganan yang akan expired dalam 24 jam.

## Setup & Installation

### 1. Jalankan Migration
```bash
# Jalankan migration SQL
mysql -u username -p database_name < migration-subscriptions.sql
```

### 2. Setup Environment Variables
Tambahkan ke file `.env`:
```env
CRON_SECRET=your-secret-key-here
```

### 3. Setup Cron Job
Tambahkan cron job untuk update status langganan secara otomatis:

**Setiap jam**:
```bash
0 * * * * curl -X POST https://your-domain.com/api/cron/update-subscriptions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Atau gunakan layanan seperti**:
- Vercel Cron Jobs
- GitHub Actions
- Cron-job.org
- EasyCron

### 4. Vercel Cron (Recommended)
Tambahkan ke `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-subscriptions",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Usage Examples

### Membuat Langganan Baru
```typescript
import { createSubscription } from '$lib/subscription-utils';

const subscription = await createSubscription({
  userId: 1,
  plan: 'pro',
  price: 29000,
  durationDays: 30,
  paymentRef: 'INV-2024-001',
  paymentMethod: 'midtrans',
  autoRenew: true,
  notes: 'Pembayaran via Midtrans'
});
```

### Cek Status Langganan
```typescript
import { hasActiveSubscription } from '$lib/subscription-utils';

const isActive = await hasActiveSubscription(userId);
if (isActive) {
  // User memiliki langganan aktif
}
```

### Ambil Statistik
```typescript
import { getSubscriptionStats } from '$lib/subscription-utils';

const stats = await getSubscriptionStats(userId);
console.log(`Total spent: Rp ${stats.totalSpent}`);
console.log(`Active subscriptions: ${stats.active}`);
```

## UI Components

### Status Badge
```svelte
<span class="rounded-full border px-2 py-0.5 text-xs {getStatusBadge(status)}">
  {getStatusLabel(status)}
</span>
```

### Filter Form
```svelte
<select bind:value={filterStatus}>
  <option value="">Semua Status</option>
  <option value="active">Aktif</option>
  <option value="expired">Kedaluwarsa</option>
  <option value="cancelled">Dibatalkan</option>
</select>
```

### Pagination
```svelte
<button 
  disabled={page <= 1}
  onclick={() => changePage(page - 1)}
>
  Sebelumnya
</button>
<span>Halaman {page} dari {totalPages}</span>
<button 
  disabled={page >= totalPages}
  onclick={() => changePage(page + 1)}
>
  Selanjutnya
</button>
```

## Security Considerations

1. **Authorization**: Semua endpoint memverifikasi user ownership
2. **Cron Secret**: API cron dilindungi dengan secret key
3. **Input Validation**: Semua input divalidasi sebelum diproses
4. **SQL Injection**: Menggunakan Drizzle ORM untuk mencegah SQL injection

## Testing

### Manual Testing
1. Buat langganan baru
2. Cek apakah muncul di riwayat
3. Test filter berdasarkan status
4. Test pagination
5. Test export CSV
6. Test toggle auto-renew
7. Test pembatalan langganan

### Cron Job Testing
```bash
curl -X POST http://localhost:5173/api/cron/update-subscriptions \
  -H "Authorization: Bearer your-secret-key-here"
```

## Troubleshooting

### Langganan tidak muncul
- Cek apakah migration sudah dijalankan
- Cek apakah data ada di database
- Cek console untuk error

### Filter tidak bekerja
- Cek format tanggal (harus YYYY-MM-DD)
- Cek query parameters di URL

### Auto-renew tidak jalan
- Pastikan cron job sudah disetup
- Cek log di server
- Cek environment variable CRON_SECRET

### Export CSV error
- Cek browser console
- Pastikan ada data untuk di-export

## Future Enhancements

1. **Email Notifications**
   - Notifikasi sebelum langganan expired
   - Notifikasi setelah auto-renew berhasil
   - Notifikasi pembatalan

2. **Payment Integration**
   - Integrasi dengan Midtrans
   - Integrasi dengan payment gateway lain
   - Auto-create subscription setelah payment success

3. **Invoice Generation**
   - Generate PDF invoice
   - Download invoice history

4. **Subscription Analytics**
   - Grafik revenue per bulan
   - Retention rate
   - Churn analysis

5. **Promo & Discount**
   - Kode promo
   - Diskon untuk renewal
   - Referral program

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

---

**Last Updated**: 2024-05-11
**Version**: 1.0.0
