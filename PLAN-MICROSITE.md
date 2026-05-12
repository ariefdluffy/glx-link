# GLX — Microsite Editor: Live Preview Split-Panel

> Rancangan teknis halaman editor microsite dengan preview real-time (seperti s.id)

---

## 🎯 Konsep Utama

Editor microsite menggunakan layout **split-panel dua kolom**:

- **Panel Kiri (Editor):** Daftar komponen yang bisa ditambah, dihapus, toggle aktif/nonaktif, dan diurutkan
- **Panel Kanan (Preview):** Tampilan live yang langsung berubah saat pengaturan di kiri diubah — tanpa reload halaman

Komunikasi antara dua panel menggunakan **Svelte store (reactive state)** — setiap perubahan di panel kiri langsung dipropagasi ke panel kanan secara real-time.

---

## 🖼️ Layout Halaman Editor

```
┌─────────────────────────────────────────────────────────────────┐
│  Navbar: [← Kembali]  "Edit Microsite"         [Simpan] [Share] │
├───────────────────────┬─────────────────────────────────────────┤
│   PANEL KIRI (400px)  │   PANEL KANAN (flex-1)                  │
│                       │                                         │
│  [Components][Settings│   ┌──────────────────┐                  │
│  ─────────────────    │   │  glx.my.id/site/ │  [Share]         │
│  [+ Add Component]    │   │  slug            │                  │
│                       │   ├──────────────────┤                  │
│  ┌──────────────────┐ │   │                  │                  │
│  │ 👤 Profile    🗑 ∨│ │   │   [Preview       │                  │
│  ├──────────────────┤ │   │    Konten        │                  │
│  │ 🖼 Image  ● 🗑 ⋮ ∨│ │   │    Microsite]   │                  │
│  ├──────────────────┤ │   │                  │                  │
│  │ ✏ Text    ● 🗑 ⋮ ∨│ │   │                  │                  │
│  ├──────────────────┤ │   └──────────────────┘                  │
│  │ — Divider ● 🗑 ⋮ ∨│ │   (simulasi tampilan HP / mobile)      │
│  └──────────────────┘ │                                         │
│  10 of 50 Components  │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

---

## 🧩 Sistem Komponen

Setiap microsite terdiri dari daftar **komponen** yang bisa ditambah dan diatur bebas.

### Tipe Komponen yang Tersedia

| Tipe      | Ikon | Keterangan                        |
| --------- | ---- | --------------------------------- |
| `profile` | 👤   | Foto, nama, bio — wajib ada 1     |
| `image`   | 🖼   | Upload gambar / banner            |
| `text`    | ✏    | Teks bebas / catatan / keterangan |
| `link`    | 🔗   | Tombol link ke URL eksternal      |
| `divider` | —    | Garis pemisah antar section       |
| `social`  | 📱   | Kumpulan ikon media sosial        |
| `video`   | 🎬   | Embed YouTube / video             |
| `map`     | 📍   | Embed Google Maps (v2)            |

### Struktur Data Komponen (JSON / Svelte Store)

```typescript
// types.ts
type ComponentType = 'profile' | 'image' | 'text' | 'link' | 'divider' | 'social' | 'video';

interface MicrositeComponent {
  id: string;           // UUID
  type: ComponentType;
  isActive: boolean;    // toggle on/off
  sortOrder: number;    // urutan tampil
  data: Record<string, any>; // konten per tipe
}

// Contoh data per tipe:
// profile:  { name, bio, avatarUrl, coverUrl }
// image:    { url, caption, linkTo }
// text:     { content, align }
// link:     { label, url, icon, style }
// divider:  { style: 'solid' | 'dashed' | 'dots' }
```

---

## ⚙️ State Management (Svelte Store)

Ini adalah **inti** dari fitur live preview. Satu store tunggal menjadi sumber kebenaran untuk editor dan preview.

```typescript
// stores/micrositeEditor.ts
import { writable, derived } from 'svelte/store';

// Store utama — dipakai oleh KEDUA panel
export const components = writable<MicrositeComponent[]>([]);
export const micrositeSettings = writable({
  slug: '',
  theme: 'default',
  title: '',
  bio: '',
  avatarUrl: '',
});

// Derived: hanya komponen yang aktif, sudah terurut
export const activeComponents = derived(components, ($c) =>
  $c
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
);
```

**Panel Kiri** → menulis ke store  
**Panel Kanan** → subscribe/baca dari store  
Hasilnya: setiap perubahan di kiri **langsung** refleks di kanan tanpa API call.

---

## 📁 Struktur File SvelteKit

```
src/routes/dashboard/microsites/[id]/edit/
│
├── +page.svelte              ← Layout split-panel utama
├── +page.server.ts           ← Load data awal dari DB
│
├── _components/
│   ├── EditorPanel.svelte    ← Panel kiri (daftar komponen)
│   ├── PreviewPanel.svelte   ← Panel kanan (live preview)
│   ├── ComponentCard.svelte  ← Card satu komponen di panel kiri
│   └── AddComponentModal.svelte ← Modal pilih tipe komponen baru
│
├── _editors/                 ← Form edit per tipe komponen
│   ├── ProfileEditor.svelte
│   ├── ImageEditor.svelte
│   ├── TextEditor.svelte
│   ├── LinkEditor.svelte
│   └── DividerEditor.svelte
│
└── _preview/                 ← Renderer komponen di panel kanan
    ├── PreviewProfile.svelte
    ├── PreviewImage.svelte
    ├── PreviewText.svelte
    ├── PreviewLink.svelte
    └── PreviewDivider.svelte
```

---

## 🔧 Implementasi Panel Kiri (EditorPanel)

### `+page.svelte` — Root Editor

```svelte
<script lang="ts">
	import EditorPanel from './_components/EditorPanel.svelte';
	import PreviewPanel from './_components/PreviewPanel.svelte';
	import { components, micrositeSettings } from '$lib/stores/micrositeEditor';

	export let data; // dari +page.server.ts

	// Inisialisasi store dengan data dari DB
	components.set(data.microsite.components);
	micrositeSettings.set(data.microsite.settings);

	async function handleSave() {
		const res = await fetch(`/api/microsites/${data.microsite.id}`, {
			method: 'PATCH',
			body: JSON.stringify({
				components: $components,
				settings: $micrositeSettings
			})
		});
		// toast notifikasi
	}
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Panel Kiri: fixed width -->
	<div class="border-border w-[400px] flex-shrink-0 overflow-y-auto border-r">
		<EditorPanel on:save={handleSave} />
	</div>

	<!-- Panel Kanan: flex grow, bg abu / simulasi HP -->
	<div class="bg-surface/50 flex flex-1 items-center justify-center overflow-y-auto p-8">
		<PreviewPanel />
	</div>
</div>
```

### `ComponentCard.svelte` — Card satu komponen

```svelte
<script lang="ts">
	import { components } from '$lib/stores/micrositeEditor';

	export let component: MicrositeComponent;

	function toggleActive() {
		components.update((list) =>
			list.map((c) => (c.id === component.id ? { ...c, isActive: !c.isActive } : c))
		);
	}

	function deleteComponent() {
		components.update((list) => list.filter((c) => c.id !== component.id));
	}

	let expanded = false; // expand/collapse form edit
</script>

<div class="component-card" class:inactive={!component.isActive}>
	<!-- Header card -->
	<div class="flex items-center gap-3 p-3">
		<!-- Drag handle (⋮⋮) untuk reorder -->
		<span class="drag-handle cursor-grab">⠿</span>

		<!-- Ikon + Label tipe -->
		<span class="icon">{ICONS[component.type]}</span>
		<span class="label flex-1">{LABELS[component.type]}</span>

		<!-- Toggle aktif/nonaktif -->
		<button class="toggle" on:click={toggleActive}>
			<div class="switch" class:on={component.isActive}></div>
		</button>

		<!-- Hapus -->
		<button on:click={deleteComponent}>🗑</button>

		<!-- Expand/collapse detail -->
		<button on:click={() => (expanded = !expanded)}>∨</button>
	</div>

	<!-- Form edit (collapse by default) -->
	{#if expanded}
		<div class="editor-form border-border border-t p-3">
			<!-- Render editor sesuai tipe -->
			{#if component.type === 'profile'}
				<ProfileEditor {component} />
			{:else if component.type === 'image'}
				<ImageEditor {component} />
			{:else if component.type === 'link'}
				<LinkEditor {component} />
				<!-- dst -->
			{/if}
		</div>
	{/if}
</div>
```

---

## 📱 Implementasi Panel Kanan (PreviewPanel)

```svelte
<!-- PreviewPanel.svelte -->
<script lang="ts">
	import { activeComponents, micrositeSettings } from '$lib/stores/micrositeEditor';
	import PreviewProfile from './_preview/PreviewProfile.svelte';
	import PreviewImage from './_preview/PreviewImage.svelte';
	// ... import lainnya

	const PREVIEW_MAP = {
		profile: PreviewProfile,
		image: PreviewImage,
		text: PreviewText,
		link: PreviewLink,
		divider: PreviewDivider
	};
</script>

<!-- Simulasi frame HP -->
<div class="phone-frame">
	<!-- URL bar simulasi -->
	<div class="url-bar">
		glx.my.id/site/{$micrositeSettings.slug}
	</div>

	<!-- Konten microsite -->
	<div class="microsite-content" data-theme={$micrositeSettings.theme}>
		{#each $activeComponents as component (component.id)}
			<!-- Render komponen sesuai tipe, data langsung dari store -->
			<svelte:component this={PREVIEW_MAP[component.type]} data={component.data} />
		{/each}

		{#if $activeComponents.length === 0}
			<p class="empty-state">Tambah komponen untuk mulai membangun micrositemu</p>
		{/if}
	</div>
</div>
```

---

## 🔀 Fitur Drag & Drop (Reorder Komponen)

Gunakan library **`svelte-dnd-action`** untuk drag-and-drop.

```bash
npm install svelte-dnd-action
```

```svelte
<!-- EditorPanel.svelte -->
<script>
	import { dndzone } from 'svelte-dnd-action';
	import { components } from '$lib/stores/micrositeEditor';

	function handleSort(e) {
		// Update urutan di store → preview langsung ikut berubah
		components.set(e.detail.items);
	}
</script>

<div use:dndzone={{ items: $components }} on:consider={handleSort} on:finalize={handleSort}>
	{#each $components as component (component.id)}
		<ComponentCard {component} />
	{/each}
</div>
```

---

## 🎨 Pilihan Tema Microsite

Tema dikontrol via CSS custom properties + `data-theme` attribute di wrapper preview.

```css
/* themes.css */
[data-theme='default'] {
	--ms-bg: #ffffff;
	--ms-text: #1a1a1a;
	--ms-btn-bg: #7c3aed;
	--ms-btn-text: #ffffff;
	--ms-radius: 12px;
}

[data-theme='dark'] {
	--ms-bg: #0f0f12;
	--ms-text: #f4f4f5;
	--ms-btn-bg: #7c3aed;
	--ms-btn-text: #ffffff;
	--ms-radius: 12px;
}

[data-theme='neon'] {
	--ms-bg: #050510;
	--ms-text: #00ffcc;
	--ms-btn-bg: transparent;
	--ms-btn-text: #00ffcc;
	--ms-btn-border: 1px solid #00ffcc;
	--ms-radius: 0px;
}

[data-theme='minimal'] {
	--ms-bg: #fafafa;
	--ms-text: #111111;
	--ms-btn-bg: #111111;
	--ms-btn-text: #fafafa;
	--ms-radius: 4px;
}
```

Tema bisa diubah dari tab **Settings** di panel kiri → preview langsung berubah via reactive store.

---

## 💾 Alur Simpan ke Database

```
User klik [Simpan]
      ↓
PATCH /api/microsites/[id]
Body: { settings, components[] }
      ↓
Server:
  1. Update tabel microsites (settings)
  2. DELETE microsite_components WHERE microsite_id = id (hapus lama)
  3. INSERT baru dari array components[] (dengan sort_order)
      ↓
Response: { success: true }
      ↓
Toast: "Microsite berhasil disimpan ✓"
```

> ⚠️ **Auto-save opsional:** Bisa ditambahkan debounce 2 detik setelah ada perubahan untuk auto-save ke server tanpa perlu klik tombol Simpan.

---

## 📋 Tab Settings (Panel Kiri)

Selain tab Components, ada tab **Settings** untuk pengaturan global microsite:

| Setting          | Tipe Input          | Keterangan                          |
| ---------------- | ------------------- | ----------------------------------- |
| Slug             | text                | `glx.my.id/site/[slug]`             |
| Judul / Nama     | text                | Ditampilkan di browser tab          |
| Tema             | radio / card picker | 4 pilihan tema                      |
| SEO Description  | textarea            | Meta description untuk media sosial |
| Aktifkan halaman | toggle              | Publik / disembunyikan              |

Semua perubahan Settings juga langsung refleks di preview kanan via `micrositeSettings` store.

---

## 📦 Package yang Dibutuhkan

```bash
# Drag and drop reorder
npm install svelte-dnd-action

# Upload gambar (jika self-hosted)
npm install multer  # atau gunakan Cloudinary SDK

# Toast notification
npm install svelte-sonner

# Icon set
npm install lucide-svelte
```

---

## 🔄 Ringkasan Alur Data

```
DB (MySQL)
   ↓ load via +page.server.ts
Svelte Store (components, micrositeSettings)
   ├──→ Panel Kiri: EditorPanel membaca & menulis store
   │      └─ ComponentCard → toggle, delete, edit form
   └──→ Panel Kanan: PreviewPanel subscribe store (reactive)
          └─ Render ulang otomatis setiap ada perubahan

User klik Simpan → PATCH API → Update DB
```

---

_Dokumen teknis ini adalah bagian dari rancangan GLX.my.id_  
_Lihat juga: `GLX_App_Rancangan.md` untuk overview keseluruhan sistem_
