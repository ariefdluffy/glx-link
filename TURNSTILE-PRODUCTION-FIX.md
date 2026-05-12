# Fix: Turnstile Tidak Muncul di Production

## Masalah
Turnstile widget tidak muncul di halaman login/register saat production.

## Penyebab
Menggunakan `$env/dynamic/public` langsung di komponen client-side tidak reliable di production karena environment variables mungkin tidak tersedia saat hydration.

## Solusi
Menggunakan server load function (`+page.server.ts`) untuk pass environment variable ke halaman.

## Perubahan yang Dilakukan

### 1. Login Page

**File: `src/routes/login/+page.server.ts`**
```typescript
import { redirect } from '@sveltejs/kit';
import { getSessionUserId } from '$lib/auth/session';
import { env } from '$env/dynamic/public';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	return {
		turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || ''
	};
};
```

**File: `src/routes/login/+page.svelte`**
```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import Turnstile from '$lib/components/turnstile/Turnstile.svelte';

	let { data } = $props<{ data: { turnstileSiteKey: string } }>();
	
	// ... rest of code
</script>

<!-- In template -->
{#if data.turnstileSiteKey}
	<Turnstile
		sitekey={data.turnstileSiteKey}
		onVerify={(token) => (turnstileToken = token)}
		onExpire={() => (turnstileToken = '')}
		onError={() => (turnstileToken = '')}
		theme="dark"
	/>
{/if}
```

### 2. Register Page

**File: `src/routes/register/+page.server.ts`**
```typescript
import { env } from '$env/dynamic/public';

export const load = async () => {
	return {
		turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || ''
	};
};
```

**File: `src/routes/register/+page.svelte`**
```svelte
<script lang="ts">
	import Turnstile from '$lib/components/turnstile/Turnstile.svelte';

	let { data } = $props<{ data: { turnstileSiteKey: string } }>();
	
	// ... rest of code
</script>

<!-- In template -->
{#if data.turnstileSiteKey}
	<Turnstile
		sitekey={data.turnstileSiteKey}
		onVerify={(token) => (turnstileToken = token)}
		onExpire={() => (turnstileToken = '')}
		onError={() => (turnstileToken = '')
		theme="dark"
	/>
{/if}
```

## Cara Testing di Production

### 1. Pastikan Environment Variables Sudah Diset

Di server production, pastikan file `.env` atau environment variables sudah diset:

```bash
PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### 2. Build dan Deploy

```bash
npm run build
node build
```

### 3. Verifikasi

1. Buka halaman login/register
2. Widget Turnstile harus muncul
3. Cek browser console untuk memastikan tidak ada error
4. Test submit form untuk memastikan verifikasi berjalan

## Troubleshooting

### Widget Masih Tidak Muncul

1. **Cek environment variables di server:**
   ```bash
   echo $PUBLIC_TURNSTILE_SITE_KEY
   ```

2. **Cek di browser console:**
   - Buka Developer Tools → Console
   - Cari error terkait Turnstile atau Cloudflare

3. **Cek network tab:**
   - Pastikan script Cloudflare Turnstile berhasil di-load
   - URL: `https://challenges.cloudflare.com/turnstile/v0/api.js`

4. **Cek domain di Cloudflare Dashboard:**
   - Pastikan domain production sudah terdaftar di Turnstile settings
   - Untuk testing, bisa gunakan wildcard atau tambahkan domain spesifik

### Error "Verifikasi Turnstile gagal"

1. **Cek TURNSTILE_SECRET_KEY:**
   - Pastikan secret key sudah diset di environment variables
   - Pastikan tidak ada typo atau extra spaces

2. **Cek domain:**
   - Domain yang digunakan harus match dengan yang terdaftar di Cloudflare

3. **Cek logs server:**
   - Lihat error message dari Cloudflare API
   - Biasanya ada detail error di response

## Best Practices

1. **Development vs Production Keys:**
   - Gunakan test keys untuk development
   - Gunakan production keys untuk production
   - Jangan commit keys ke git

2. **Environment Variables:**
   - Gunakan `.env` untuk local development
   - Gunakan environment variables di hosting provider untuk production
   - Selalu ada fallback empty string untuk graceful degradation

3. **Error Handling:**
   - Widget tidak muncul jika key tidak diset (graceful degradation)
   - User mendapat error message yang jelas jika verifikasi gagal
   - Log error di server untuk debugging

## Referensi

- [SvelteKit Load Functions](https://kit.svelte.dev/docs/load)
- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-dynamic-public)
- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
