<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MicrositePreview from '$lib/components/MicrositePreview.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';

	// Sub-components
	import AppearanceSection from './components/AppearanceSection.svelte';
	import SocialSection from './components/SocialSection.svelte';
	import LinkSection from './components/LinkSection.svelte';
	import SidebarSection from './components/SidebarSection.svelte';
	import QrModal from './components/QrModal.svelte';

	// Types & Constants
	import {
		type MicrositeLink,
		themes,
		animations,
		iconOptions,
		iconSvgPath
	} from '$lib/types/microsite.edit';

	// State
	let title = $state('');
	let slug = $state('');
	let bio = $state('');
	let theme = $state('default');
	let animation = $state('fade');
	let avatarUrl = $state('');
	let headerBg = $state('');
	let linkTextColor = $state('');
	let facebookUrl = $state('');
	let websiteUrl = $state('');
	let youtubeUrl = $state('');
	let instagramUrl = $state('');
	let isActive = $state(true);
	let errorMessage = $state('');
	let isLoading = $state(false);
	let dataLoaded = $state(false);
	let links = $state<MicrositeLink[]>([]);

	let qrUrl = $state('');
	let showQr = $state(false);
	let copiedQrLink = $state(false);
	let draggedIndex: number | null = $state(null);
	let dragOverIndex: number | null = $state(null);
	let expandedIndex: number | null = $state(null);

	// Handlers
	const handleAvatarUpload = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch('/api/upload', { method: 'POST', body: formData });
		const data = await res.json();
		if (data.url) avatarUrl = data.url;
	};

	const handleHeaderUpload = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch('/api/upload', { method: 'POST', body: formData });
		const data = await res.json();
		if (data.url) headerBg = `url(${data.url})`;
	};

	const addLink = (
		type: 'link' | 'divider' | 'image' | 'text' = 'link',
		preset?: { label?: string; icon?: string; url?: string }
	) => {
		links = [
			...links,
			{
				label: preset?.label ?? '',
				url: preset?.url ?? '',
				icon: preset?.icon ?? '',
				type,
				caption: '',
				animation: '',
				fontSize: 14,
				alignment: 'left'
			}
		];
	};

	const addTextLabel = () => addLink('text', { label: 'Label tanpa link' });

	const iconPreview = (icon: string | null | undefined) => {
		if (!icon) return '—';
		const key = icon.toLowerCase().trim();
		const found = iconOptions.find((o) => o.name === key);
		if (found?.svg) return null;
		return found?.display ?? icon.slice(0, 2);
	};

	const removeLink = (index: number) => {
		links = links.filter((_, idx) => idx !== index);
	};

	const openQr = () => {
		if (slug.trim()) {
			qrUrl = `https://glx.my.id/m/${slug.trim()}`;
		} else {
			qrUrl = '';
		}
		showQr = true;
	};

	const handleCopyQrLink = async () => {
		if (!qrUrl) return;
		await navigator.clipboard.writeText(qrUrl);
		copiedQrLink = true;
		setTimeout(() => (copiedQrLink = false), 2000);
	};

	const handleDownloadQr = async () => {
		if (!qrUrl) return;
		try {
			const QRCode = (await import('qrcode')).default;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const qrSize = 400;
			const padding = 40;
			const footerHeight = 60;
			canvas.width = qrSize + padding * 2;
			canvas.height = qrSize + padding * 2 + footerHeight;

			ctx.fillStyle = '#ffffff';
			const radius = 20;
			ctx.beginPath();
			ctx.moveTo(radius, 0);
			ctx.lineTo(canvas.width - radius, 0);
			ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
			ctx.lineTo(canvas.width, canvas.height - radius);
			ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
			ctx.lineTo(radius, canvas.height);
			ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
			ctx.lineTo(0, radius);
			ctx.quadraticCurveTo(0, 0, radius, 0);
			ctx.closePath();
			ctx.fill();

			const qrCanvas = document.createElement('canvas');
			await QRCode.toCanvas(qrCanvas, qrUrl, {
				width: qrSize,
				margin: 1,
				color: { dark: '#000000', light: '#ffffff' }
			});

			ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);
			ctx.fillStyle = '#6366f1';
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`glx.my.id/m/${slug}`, canvas.width / 2, qrSize + padding + 30);
			ctx.fillStyle = '#64748b';
			ctx.font = '14px sans-serif';
			ctx.fillText(title, canvas.width / 2, qrSize + padding + 50);

			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `qr-${slug}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			});
		} catch (error) {
			console.error('Failed to download QR code:', error);
		}
	};

	const handleDragStart = (index: number) => (draggedIndex = index);
	const handleDragOver = (e: DragEvent, index: number) => {
		e.preventDefault();
		dragOverIndex = index;
	};
	const handleDrop = (index: number) => {
		if (draggedIndex === null || draggedIndex === index) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}
		const newLinks = [...links];
		const [removed] = newLinks.splice(draggedIndex, 1);
		newLinks.splice(index, 0, removed);
		links = newLinks;
		draggedIndex = null;
		dragOverIndex = null;
	};
	const handleDragEnd = () => {
		draggedIndex = null;
		dragOverIndex = null;
	};

	const moveLink = (index: number, direction: -1 | 1) => {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= links.length) return;
		const newLinks = [...links];
		const [removed] = newLinks.splice(index, 1);
		newLinks.splice(newIndex, 0, removed);
		links = newLinks;
	};

	const duplicateLink = (index: number) => {
		const original = links[index];
		const copy = { ...original };
		links = [...links.slice(0, index + 1), copy, ...links.slice(index + 1)];
		expandedIndex = index + 1;
	};

	const handleLinkImageUpload = async (index: number, e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch('/api/upload', { method: 'POST', body: formData });
		const data = await res.json();
		if (data.url) links[index].url = data.url;
	};

	const loadMicrosite = async () => {
		const id = $page.params.id;
		try {
			const response = await fetch(`/api/microsites/${id}`);
			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				errorMessage = payload?.message ?? 'Gagal memuat microsite.';
				dataLoaded = true;
				return;
			}
			const payload = await response.json();
			if (!payload.microsite) {
				errorMessage = 'Data microsite tidak ditemukan.';
				dataLoaded = true;
				return;
			}
			const m = payload.microsite;
			title = m.title ?? '';
			slug = m.slug ?? '';
			bio = m.bio ?? '';
			theme = m.theme ?? 'default';
			animation = m.animation ?? 'fade';
			avatarUrl = m.avatarUrl ?? '';
			headerBg = m.headerBg ?? '';
			linkTextColor = m.linkTextColor ?? '';
			facebookUrl = m.facebookUrl ?? '';
			websiteUrl = m.websiteUrl ?? '';
			youtubeUrl = m.youtubeUrl ?? '';
			instagramUrl = m.instagramUrl ?? '';
			isActive = m.isActive !== false;
			links = (payload.links ?? []).map((l: any) => ({
				label: l.label,
				url: l.url,
				icon: l.icon ?? '',
				type: l.type ?? 'link',
				caption: l.caption ?? '',
				animation: l.animation ?? '',
				alignment: l.alignment ?? 'left',
				fontSize: l.fontSize ?? 14
			}));
			if (links.length === 0) {
				links = [
					{
						label: '',
						url: '',
						icon: '',
						type: 'link',
						caption: '',
						animation: '',
						alignment: 'left',
						fontSize: 14
					}
				];
			}
			dataLoaded = true;
		} catch (err) {
			console.error('Error loading microsite:', err);
			errorMessage = 'Gagal terhubung ke server.';
			dataLoaded = true;
		}
	};

	const handleSubmit = async () => {
		errorMessage = '';
		if (title.trim().length < 2) {
			errorMessage = 'Judul minimal 2 karakter.';
			return;
		}
		if (slug.trim().length < 3) {
			errorMessage = 'Slug minimal 3 karakter.';
			return;
		}
		isLoading = true;
		try {
			const response = await fetch(`/api/microsites/${$page.params.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title,
					slug,
					bio,
					theme,
					animation,
					avatarUrl,
					headerBg,
					linkTextColor,
					facebookUrl,
					websiteUrl,
					youtubeUrl,
					instagramUrl,
					isActive,
					links: links.map((l) => ({
						type: l.type || 'link',
						label: l.label || '',
						url: l.url || '',
						icon: l.icon || '',
						caption: l.caption || '',
						animation: l.animation || '',
						alignment: l.alignment || 'left',
						fontSize: l.fontSize || 14
					}))
				})
			});
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Gagal menyimpan microsite.';
				return;
			}
			window.location.href = '/dashboard/microsites';
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};

	onMount(loadMicrosite);
</script>

<svelte:head>
	<title>Edit Microsite - GLX</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-1 pb-16">
	<!-- Header -->
	<div class="py-6">
		<div class="mb-1 flex items-start justify-between gap-3">
			<div>
				<h1 class="font-display text-2xl font-semibold">Edit Microsite</h1>
				<p class="text-sm text-white/60">Sesuaikan tampilan dan konten microsite kamu.</p>
			</div>
			<a
				href="/dashboard/microsites"
				class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</a>
		</div>
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_420px]">
		<!-- Left Column: Main Editor -->
		<div class="glass-panel overflow-hidden rounded-3xl p-4 md:p-8">
			<div class="space-y-4">
				<div class="mb-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div class="font-display text-base font-semibold">Pengaturan Form</div>
						<p class="text-[11px] text-white/50">
							Atur tampilan, media, dan daftar link microsite.
						</p>
					</div>
					<button
						type="button"
						onclick={handleSubmit}
						disabled={isLoading}
						class="self-start rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-cyan-400 disabled:opacity-50"
					>
						{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
					</button>
				</div>

				<AppearanceSection
					bind:avatarUrl
					bind:headerBg
					bind:linkTextColor
					bind:theme
					bind:animation
					{themes}
					{animations}
					onavatarupload={handleAvatarUpload}
					onheaderupload={handleHeaderUpload}
				/>

				<SocialSection bind:facebookUrl bind:instagramUrl bind:youtubeUrl bind:websiteUrl />

				<LinkSection
					bind:links
					bind:expandedIndex
					bind:draggedIndex
					bind:dragOverIndex
					onaddlink={addLink}
					onaddtextlabel={addTextLabel}
					onremovelink={removeLink}
					ondragstart={handleDragStart}
					ondragover={handleDragOver}
					ondrop={handleDrop}
					ondragend={handleDragEnd}
					onmovelink={moveLink}
					onduplicatelink={duplicateLink}
					onlinkimageupload={handleLinkImageUpload}
					iconSvgPathFn={iconSvgPath}
					{iconOptions}
					iconPreviewFn={iconPreview}
				/>

				<div class="mt-4">
					<button
						onclick={openQr}
						class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
					>
						Lihat QR Code
					</button>
					{#if errorMessage}
						<div class="mt-4">
							<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Right Column: Sidebar & Preview -->
		<div class="flex flex-col gap-6 lg:sticky lg:top-6">
			<SidebarSection bind:title bind:slug bind:bio bind:isActive />

			<div class="glass-panel rounded-3xl p-4">
				<div class="mb-3 text-center text-xs text-white/50">Pratinjau Langsung</div>
				<div class="flex items-center justify-center">
					{#if dataLoaded}
						<MicrositePreview
							{title}
							{bio}
							{theme}
							{slug}
							{avatarUrl}
							{headerBg}
							{linkTextColor}
							{facebookUrl}
							{websiteUrl}
							{youtubeUrl}
							{instagramUrl}
							{animation}
							{links}
						/>
					{:else}
						<div class="py-20 text-center text-sm text-white/40">Memuat preview...</div>
					{/if}
				</div>
			</div>
			<p class="text-center text-[10px] text-white/40">
				Tampilan mungkin berbeda pada perangkat aslinya.
			</p>
		</div>
	</div>
</div>

<QrModal
	show={showQr}
	{qrUrl}
	{slug}
	{copiedQrLink}
	onclose={() => (showQr = false)}
	oncopylink={handleCopyQrLink}
	ondownload={handleDownloadQr}
/>
