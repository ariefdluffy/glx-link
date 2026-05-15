# 🗄️ SQL Files - GLX.my.id

Folder ini berisi semua file SQL untuk database migrations, schema, dan backup.

---

## 📋 Daftar File SQL

### 🔄 Drizzle Migrations (Sequential)

| File | Size | Deskripsi | Tanggal |
|------|------|-----------|---------|
| `0000_far_wendigo.sql` | 301 B | Initial migration | 2026-05-04 |
| `0001_free_sally_floyd.sql` | 1.5 KB | Database structure | 2026-05-10 |
| `0002_bored_bloodscream.sql` | 516 B | Schema update | 2026-05-11 |
| `0003_chief_sauron.sql` | 302 B | Schema update | 2026-05-11 |
| `0004_bumpy_preak.sql` | 73 B | Minor update | 2026-05-11 |
| `0005_clear_energizer.sql` | 61 B | Minor update | 2026-05-11 |
| `0006_adorable_falcon.sql` | 548 B | Schema update | 2026-05-12 |
| `0007_audit_logs.sql` | 492 B | Audit logs table | 2026-05-14 |
| `0008_combined_email_verification_password_reset.sql` | 1.5 KB | Email verification & password reset | 2026-05-15 |
| `0009_drop_password_resets.sql` | 269 B | Drop password resets table | 2026-05-15 |
| `0009_fluffy_vermin.sql` | 1.5 KB | Alternative migration | 2026-05-15 |
| `0010_xendit_payment_method.sql` | 485 B | Xendit payment method | 2026-05-15 |
| `0011_mayar_payment_method.sql` | 551 B | Mayar payment method | 2026-05-15 |
| `0011_promo_codes.sql` | 841 B | Promo codes table | 2026-05-15 |
| `0012_short_links_active_columns.sql` | 308 B | Active columns for shortlinks | 2026-05-15 |

---

### 🔧 Manual Migrations

| File | Size | Deskripsi | Tanggal |
|------|------|-----------|---------|
| `migration-font-size.sql` | 1001 B | Font size migration | 2026-05-11 |
| `migration-microsites-clicks.sql` | 440 B | Microsite clicks tracking | 2026-05-12 |
| `migration-subscriptions.sql` | 1.4 KB | Subscriptions table update | 2026-05-11 |
| `migration-user-sessions.sql` | 540 B | User sessions table | 2026-05-13 |

---

### 🛠️ Fixes & Utilities

| File | Size | Deskripsi | Tanggal |
|------|------|-----------|---------|
| `fix-expired-subscription.sql` | 1.5 KB | Fix expired subscriptions | 2026-05-15 |

---

### 📊 Schema & Backups

| File | Size | Deskripsi | Tanggal |
|------|------|-----------|---------|
| `schema.sql` | 2.0 KB | Database schema | 2026-05-10 |
| `shortlink_db.sql` | 9.1 KB | Database dump | 2026-05-11 |
| `shortlink_db_backup_20260515_144813.sql` | 16 KB | Latest backup | 2026-05-15 |

---

## 🚀 Cara Menggunakan

### 1. Run Drizzle Migrations (Recommended)

```bash
# Run all pending migrations
npm run db:push

# Or manually run specific migration
mysql -u root -p glx_db < file-sql/0012_short_links_active_columns.sql
```

### 2. Run Manual Migrations

```bash
# Run manual migration
mysql -u root -p glx_db < file-sql/migration-subscriptions.sql
```

### 3. Restore from Backup

```bash
# Restore latest backup
mysql -u root -p glx_db < file-sql/shortlink_db_backup_20260515_144813.sql
```

### 4. Create New Backup

```bash
# Create backup with timestamp
mysqldump -u root -p glx_db > file-sql/shortlink_db_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## ⚠️ Important Notes

### Migration Order:
- **Drizzle migrations** harus dijalankan secara sequential (0000 → 0001 → 0002 → ...)
- **Manual migrations** bisa dijalankan kapan saja sesuai kebutuhan
- **Backup** sebelum menjalankan migration di production

### Best Practices:
1. ✅ **Always backup** sebelum migration
2. ✅ **Test di development** dulu
3. ✅ **Review SQL** sebelum execute
4. ✅ **Check dependencies** antar migrations
5. ✅ **Document changes** di changelog

### Rollback:
Jika migration gagal:
```bash
# Restore from backup
mysql -u root -p glx_db < file-sql/shortlink_db_backup_YYYYMMDD_HHMMSS.sql
```

---

## 📝 Migration History

### Latest Migrations (2026-05-15):
- ✅ `0012_short_links_active_columns.sql` - Active columns
- ✅ `0011_mayar_payment_method.sql` - Mayar payment
- ✅ `0011_promo_codes.sql` - Promo codes
- ✅ `0010_xendit_payment_method.sql` - Xendit payment
- ✅ `fix-expired-subscription.sql` - Fix expired subscriptions

### Key Migrations:
- ✅ `0007_audit_logs.sql` - Audit logging system
- ✅ `0008_combined_email_verification_password_reset.sql` - Email & password features
- ✅ `migration-subscriptions.sql` - Subscription system
- ✅ `migration-user-sessions.sql` - Session management

---

## 🔍 Quick Reference

### Check Current Schema:
```sql
-- Show all tables
SHOW TABLES;

-- Describe specific table
DESCRIBE users;
DESCRIBE subscriptions;
DESCRIBE audit_logs;
```

### Check Migration Status:
```sql
-- Check if table exists
SHOW TABLES LIKE 'audit_logs';

-- Check column exists
SHOW COLUMNS FROM subscriptions LIKE 'payment_method';
```

### Verify Data:
```sql
-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM subscriptions;
SELECT COUNT(*) FROM audit_logs;

-- Check recent data
SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 10;
```

---

## 📞 Support

Jika ada masalah dengan migrations:
1. Check error message di terminal
2. Review SQL file yang bermasalah
3. Restore from backup jika perlu
4. Check dokumentasi di `docs/`
5. Contact development team

---

**Last Updated:** 2026-05-15  
**Total SQL Files:** 23  
**Latest Backup:** shortlink_db_backup_20260515_144813.sql  
**Status:** ✅ All Migrations Applied
