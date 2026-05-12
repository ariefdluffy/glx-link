# Toast Notification Component

Komponen notifikasi yang menarik dengan animasi dan auto-dismiss untuk memberikan feedback kepada user.

## Features

- ✨ Animasi smooth (slide & fade)
- ⏱️ Auto-dismiss (default 4 detik)
- 🎨 4 tipe notifikasi (success, error, warning, info)
- 🎯 Icon yang sesuai dengan tipe
- ❌ Tombol close manual
- 🌈 Styling yang konsisten dengan design system

## Usage

```svelte
<script>
  import Toast from '$lib/components/toast/Toast.svelte';
  
  let errorMessage = $state('');
  let successMessage = $state('');
</script>

{#if errorMessage}
  <Toast 
    message={errorMessage} 
    type="error" 
    onClose={() => (errorMessage = '')} 
  />
{/if}

{#if successMessage}
  <Toast 
    message={successMessage} 
    type="success" 
    duration={3000}
    onClose={() => (successMessage = '')} 
  />
{/if}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | **required** | Pesan yang ditampilkan |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Tipe notifikasi |
| `duration` | `number` | `4000` | Durasi tampil (ms), 0 = tidak auto-dismiss |
| `onClose` | `() => void` | `undefined` | Callback saat toast ditutup |

## Types

### Success (✓)
- Warna: Emerald/Green
- Digunakan untuk: Login berhasil, data tersimpan, operasi sukses

### Error (✕)
- Warna: Red
- Digunakan untuk: Error validasi, gagal menyimpan, koneksi gagal

### Warning (⚠)
- Warna: Amber/Yellow
- Digunakan untuk: Logout notification, peringatan

### Info (ℹ)
- Warna: Blue
- Digunakan untuk: Informasi umum, tips

## Implementation

Komponen ini sudah diimplementasikan di:
- ✅ `/login` - Login & logout notifications
- ✅ `/register` - Registration notifications
- ✅ `/` (homepage) - Shortlink creation errors
- ✅ `/dashboard/links` - Link management notifications
- ✅ `/dashboard/links/new` - New link creation
- ✅ `/dashboard/microsites` - Microsite management
- ✅ `/dashboard/microsites/new` - New microsite creation
- ✅ `/dashboard/microsites/[id]/edit` - Edit microsite
- ✅ `/dashboard/settings` - Profile & password updates
