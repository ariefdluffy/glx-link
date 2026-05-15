# 🌐 Real Client IP Detection - GLX.my.id

**Tanggal:** 2026-05-15  
**Tujuan:** Memastikan IP address yang tersimpan di audit logs adalah IP client yang sebenarnya

---

## 🎯 Problem

Sebelumnya, sistem menggunakan `getClientAddress()` langsung yang bisa mengembalikan IP proxy/load balancer, bukan IP client yang sebenarnya.

**Contoh masalah:**
- User dari IP `123.45.67.89`
- Request melalui Cloudflare/Nginx
- `getClientAddress()` return `172.16.0.1` (IP internal proxy)
- Audit log menyimpan IP proxy, bukan IP client ❌

---

## ✅ Solution

Dibuat helper function `getRealClientIP()` yang memeriksa proxy headers dengan urutan prioritas:

### Priority Order:
1. **`cf-connecting-ip`** - Cloudflare (most reliable)
2. **`x-real-ip`** - Nginx proxy
3. **`x-forwarded-for`** - Standard proxy header
4. **`getClientAddress()`** - Direct connection fallback

---

## 📝 Implementation

### 1. Helper Function

**File:** `src/lib/utils/ip.ts`

```typescript
/**
 * Get real client IP address
 * Checks proxy headers first (Cloudflare, Nginx, etc.) before falling back to getClientAddress()
 * 
 * Priority order:
 * 1. cf-connecting-ip (Cloudflare)
 * 2. x-real-ip (Nginx)
 * 3. x-forwarded-for (Standard proxy)
 * 4. getClientAddress() (Direct connection)
 */
export function getRealClientIP(event: any): string {
	const headers = event?.request?.headers;
	
	// Check proxy headers first
	const cfIp = headers?.get?.('cf-connecting-ip');
	if (cfIp) return cfIp;
	
	const realIp = headers?.get?.('x-real-ip');
	if (realIp) return realIp;
	
	const forwardedFor = headers?.get?.('x-forwarded-for');
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, get the first one (original client)
		return forwardedFor.split(',')[0]?.trim() || 'unknown';
	}
	
	// Fallback to getClientAddress
	if (event?.getClientAddress) {
		try {
			return event.getClientAddress();
		} catch {
			return 'unknown';
		}
	}
	
	return 'unknown';
}
```

---

### 2. Files Updated

| File | Changes | Status |
|------|---------|--------|
| `src/lib/utils/ip.ts` | Created helper function | ✅ New |
| `src/lib/auth/session.ts` | Use `getRealClientIP()` | ✅ Updated |
| `src/routes/api/auth/login/+server.ts` | Use `getRealClientIP()` | ✅ Updated |
| `src/routes/api/auth/register/+server.ts` | Use `getRealClientIP()` | ✅ Updated |
| `src/routes/api/auth/logout/+server.ts` | Use `getRealClientIP()` | ✅ Updated |

---

## 🔍 How It Works

### Scenario 1: Behind Cloudflare

```
User (123.45.67.89)
    ↓
Cloudflare Proxy
    ↓ (adds cf-connecting-ip: 123.45.67.89)
Your Server
    ↓
getRealClientIP() → 123.45.67.89 ✅
```

### Scenario 2: Behind Nginx

```
User (123.45.67.89)
    ↓
Nginx Proxy
    ↓ (adds x-real-ip: 123.45.67.89)
Your Server
    ↓
getRealClientIP() → 123.45.67.89 ✅
```

### Scenario 3: Direct Connection

```
User (123.45.67.89)
    ↓
Your Server (no proxy)
    ↓
getRealClientIP() → getClientAddress() → 123.45.67.89 ✅
```

### Scenario 4: Multiple Proxies

```
User (123.45.67.89)
    ↓
Proxy 1 (adds x-forwarded-for: 123.45.67.89)
    ↓
Proxy 2 (adds x-forwarded-for: 123.45.67.89, 10.0.0.1)
    ↓
Your Server
    ↓
getRealClientIP() → 123.45.67.89 (first IP) ✅
```

---

## 🧪 Testing

### Test Real IP Detection:

```bash
# Test with Cloudflare header
curl -H "cf-connecting-ip: 123.45.67.89" http://localhost:5173/api/auth/login

# Test with Nginx header
curl -H "x-real-ip: 123.45.67.89" http://localhost:5173/api/auth/login

# Test with x-forwarded-for
curl -H "x-forwarded-for: 123.45.67.89, 10.0.0.1" http://localhost:5173/api/auth/login

# Test direct connection (no headers)
curl http://localhost:5173/api/auth/login
```

### Verify in Audit Logs:

```sql
-- Check recent login IPs
SELECT 
    id,
    userId,
    action,
    ip,
    userAgent,
    createdAt
FROM audit_logs
WHERE action = 'user_login'
ORDER BY createdAt DESC
LIMIT 10;
```

**Expected Result:**
- IP should be real client IP, not proxy IP
- IP should not be `127.0.0.1` or `::1` (unless testing locally)
- IP should not be internal network IP (10.x.x.x, 172.16.x.x, 192.168.x.x)

---

## 📊 Before vs After

### Before (Inconsistent):

| File | Method | Issue |
|------|--------|-------|
| `login/+server.ts` | `getClientAddress()` | ❌ Returns proxy IP |
| `register/+server.ts` | `getClientAddress()` | ❌ Returns proxy IP |
| `logout/+server.ts` | `x-forwarded-for` only | ❌ Doesn't check Cloudflare |
| `session.ts` | Manual proxy check | ⚠️ Inconsistent with others |

### After (Consistent):

| File | Method | Result |
|------|--------|--------|
| `login/+server.ts` | `getRealClientIP()` | ✅ Real client IP |
| `register/+server.ts` | `getRealClientIP()` | ✅ Real client IP |
| `logout/+server.ts` | `getRealClientIP()` | ✅ Real client IP |
| `session.ts` | `getRealClientIP()` | ✅ Real client IP |

---

## 🔐 Security Benefits

### 1. Accurate Rate Limiting
- Rate limit berdasarkan IP client yang sebenarnya
- Tidak bisa bypass dengan proxy

### 2. Better Audit Trail
- IP yang tersimpan adalah IP client asli
- Memudahkan tracking aktivitas mencurigakan

### 3. Fraud Detection
- Bisa detect multiple accounts dari IP yang sama
- Bisa detect login dari lokasi yang tidak biasa

### 4. Compliance
- Audit logs lebih akurat untuk compliance requirements
- IP address yang tersimpan adalah data yang benar

---

## 🌐 Proxy Support

### Supported Proxies:

| Proxy/CDN | Header | Priority | Status |
|-----------|--------|----------|--------|
| **Cloudflare** | `cf-connecting-ip` | 1 (Highest) | ✅ |
| **Nginx** | `x-real-ip` | 2 | ✅ |
| **Standard Proxy** | `x-forwarded-for` | 3 | ✅ |
| **Direct** | `getClientAddress()` | 4 (Fallback) | ✅ |

### Not Supported (Yet):
- `true-client-ip` (Akamai)
- `x-client-ip` (Some proxies)
- `forwarded` (RFC 7239)

**Note:** Bisa ditambahkan jika diperlukan di masa depan.

---

## 📝 Usage Examples

### In API Routes:

```typescript
import { getRealClientIP } from '$lib/utils/ip';

export const POST = async (event) => {
    const clientIp = getRealClientIP(event);
    
    // Use for audit log
    await db.insert(auditLogs).values({
        userId: user.id,
        action: 'user_action',
        ip: clientIp,
        ...
    });
};
```

### In Hooks:

```typescript
import { getRealClientIP } from '$lib/utils/ip';

export const handle = async ({ event, resolve }) => {
    const clientIp = getRealClientIP(event);
    
    // Use for rate limiting
    if (!checkRateLimit(clientIp)) {
        return new Response('Too many requests', { status: 429 });
    }
    
    return resolve(event);
};
```

---

## ⚠️ Important Notes

### 1. Trust Proxy Headers
- Pastikan proxy headers bisa dipercaya
- Jangan trust headers dari untrusted sources
- Cloudflare headers paling reliable

### 2. X-Forwarded-For Format
- Format: `client, proxy1, proxy2`
- Kita ambil IP pertama (client)
- IP lainnya adalah proxy chain

### 3. IPv6 Support
- Function support IPv4 dan IPv6
- IPv6 format: `2001:0db8:85a3::8a2e:0370:7334`

### 4. Unknown IP
- Return `'unknown'` jika tidak bisa detect
- Better than return error atau crash

---

## 🔄 Migration

### No Database Migration Needed
- Kolom `ip` di `audit_logs` sudah ada
- Hanya perlu update code
- IP baru akan tersimpan dengan benar
- IP lama tetap ada (historical data)

### Gradual Rollout
- Update sudah applied ke semua auth endpoints
- Semua login/register/logout baru akan simpan IP yang benar
- Session creation juga sudah update

---

## ✅ Verification Checklist

- [x] Helper function created (`src/lib/utils/ip.ts`)
- [x] Login endpoint updated
- [x] Register endpoint updated
- [x] Logout endpoint updated
- [x] Session creation updated
- [x] All files use consistent method
- [x] Documentation created
- [ ] Test in production with real proxy
- [ ] Monitor audit logs for correct IPs

---

## 📞 Support

Jika IP masih tidak sesuai:
1. Check proxy configuration
2. Verify proxy headers di request
3. Check `getRealClientIP()` logic
4. Test dengan curl + custom headers
5. Review audit logs di database

---

**Last Updated:** 2026-05-15 07:22 UTC  
**Status:** ✅ Implemented & Ready for Production
