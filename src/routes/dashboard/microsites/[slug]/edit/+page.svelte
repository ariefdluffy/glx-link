<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
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

	const slugTakenMessage = 'Slug microsite sudah dipakai.';
	let slugCheckTimer: ReturnType<typeof setTimeout> | null = null;
	let lastCheckedSlug = '';
	let slugCheckRequestId = 0;
	let originalSlug = $state('');
	let isCheckingSlug = $state(false);
	let slugAvailable = $state<boolean | null>(null);
	let slugValidationMessage = $state('');

	const sanitizeSlug = (value: string) =>
		value
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-');

	const clearSlugTakenMessage = () => {
		if (errorMessage === slugTakenMessage) {
			errorMessage = '';
		}
	};

	const checkSlugAvailability = async (rawSlug: string) => {
		const normalizedSlug = sanitizeSlug(rawSlug);
		const normalizedOriginalSlug = sanitizeSlug(originalSlug);
		if (!normalizedSlug) {
			lastCheckedSlug = '';
			slugAvailable = null;
			slugValidationMessage = '';
			isCheckingSlug = false;
			clearSlugTakenMessage();
			return true;
		}

		if (normalizedSlug.length < 3 || normalizedSlug.length > 50) {
			lastCheckedSlug = '';
			slugAvailable = false;
			slugValidationMessage = 'Slug harus 3-50 karakter.';
			isCheckingSlug = false;
			clearSlugTakenMessage();
			return true;
		}

		if (normalizedSlug === normalizedOriginalSlug) {
			lastCheckedSlug = normalizedSlug;
			slugAvailable = true;
			slugValidationMessage = 'Slug tersedia.';
			isCheckingSlug = false;
			clearSlugTakenMessage();
			return true;
		}

		if (normalizedSlug === lastCheckedSlug) {
			return errorMessage !== slugTakenMessage;
		}

		lastCheckedSlug = normalizedSlug;
		slugCheckRequestId += 1;
		const requestId = slugCheckRequestId;
		const slug = $page.params.slug;
		const excludeSlugPart = slug ? `&excludeSlug=${encodeURIComponent(slug)}` : '';
		isCheckingSlug = true;
		slugValidationMessage = 'Mengecek ketersediaan slug...';

		try {
			const response = await fetch(
				`/api/microsites/check-slug?slug=${encodeURIComponent(normalizedSlug)}${excludeSlugPart}`
			);
			const payload = await response.json().catch(() => ({}));
			if (requestId !== slugCheckRequestId) {
				return true;
			}
			isCheckingSlug = false;
			if (!response.ok) {
				slugAvailable = null;
				slugValidationMessage = '';
				clearSlugTakenMessage();
				return true;
			}
			if (payload?.available === false) {
				slugAvailable = false;
				slugValidationMessage = payload?.message ?? slugTakenMessage;
				errorMessage = payload?.message ?? slugTakenMessage;
				return false;
			}

			slugAvailable = true;
			slugValidationMessage = 'Slug tersedia.';
			clearSlugTakenMessage();
			return true;
		} catch {
			if (requestId !== slugCheckRequestId) {
				return true;
			}
			isCheckingSlug = false;
			slugAvailable = null;
			slugValidationMessage = '';
			clearSlugTakenMessage();
			return true;
		}
	};

	$effect(() => {
		if (!dataLoaded) {
			return;
		}

		const watchedSlug = slug;
		slugCheckRequestId += 1;
		isCheckingSlug = false;
		if (slugCheckTimer) {
			clearTimeout(slugCheckTimer);
		}
		slugCheckTimer = setTimeout(() => {
			void checkSlugAvailability(watchedSlug);
		}, 450);

		return () => {
			if (slugCheckTimer) {
				clearTimeout(slugCheckTimer);
			}
		};
	});

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
				alignment: 'left',
				isHidden: false
			}
		];
	};

	const addTextLabel = () => addLink('text', { label: 'Label tanpa link' });

	const handleLinkAnimationChange = (index: number, anim: string) => {
		if (index < 0 || index >= links.length) return;
		const nextLinks = [...links];
		nextLinks[index] = { ...nextLinks[index], animation: anim };
		links = nextLinks;
	};

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
		const slugParam = $page.params.slug;
		try {
			const response = await fetch(`/api/microsites/${slugParam}`);
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
			originalSlug = m.slug ?? '';
			bio = m.bio ?? '';
			theme = m.theme ?? 'default';
			animation = m.animation ?? 'fade';
			avatarUrl = m.avatarUrl ?? '';
			headerBg = m.headerBg ?? '';
			linkTextColor = m.linkTextColor ?? '';
			isActive = m.isActive !== false;

			// Social media URLs - from dedicated columns (new flow) or fallback to type:'social' links (legacy)
			const allLinks: Array<{
				type?: string;
				url?: string;
				icon?: string;
				label?: string;
				caption?: string;
				animation?: string;
				alignment?: string;
				fontSize?: number;
				isHidden?: boolean;
			}> = payload.links ?? [];
			const socials = allLinks.filter((l) => l.type === 'social');
			const getSocialUrl = (icon: string) => socials.find((l) => l.icon === icon)?.url ?? '';

			facebookUrl = m.facebookUrl ?? getSocialUrl('facebook');
			websiteUrl = m.websiteUrl ?? getSocialUrl('website');
			youtubeUrl = m.youtubeUrl ?? getSocialUrl('youtube');
			instagramUrl = m.instagramUrl ?? getSocialUrl('instagram');

			links = allLinks
				.filter((l) => l.type !== 'social')
				.map((l) => ({
					label: l.label ?? '',
					url: l.url ?? '',
					icon: l.icon ?? '',
					type: (l.type ?? 'link') as 'link' | 'divider' | 'image' | 'text',
					caption: l.caption ?? '',
					animation: l.animation ?? '',
					alignment: (l.alignment ?? 'left') as 'left' | 'center' | 'right',
					fontSize: l.fontSize ?? 14,
					isHidden: l.isHidden === true
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
						fontSize: 14,
						isHidden: false
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
		if (!(await checkSlugAvailability(slug))) {
			return;
		}
		isLoading = true;
		try {
			const response = await fetch(`/api/microsites/${$page.params.slug}`, {
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
						fontSize: l.fontSize || 14,
						isHidden: l.isHidden === true
					}))
				})
			});
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Gagal menyimpan microsite.';
				return;
			}
			await goto('/dashboard/microsites', { invalidateAll: true });
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
				href={resolve('/dashboard/microsites')}
				class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
				aria-label="Kembali ke daftar microsite"
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
		<!-- Load Error State -->
		{#if dataLoaded && errorMessage && !title}
			<div class="glass-panel col-span-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
				<div class="text-3xl">⚠️</div>
				<h3 class="font-display mt-3 text-lg font-semibold text-red-400">Gagal Memuat Microsite</h3>
				<p class="mt-2 text-sm text-white/60">{errorMessage}</p>
				<button
					type="button"
					onclick={() => { errorMessage = ''; dataLoaded = false; loadMicrosite(); }}
					class="mt-4 rounded-xl bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20"
				>
					Coba Lagi
				</button>
			</div>
		{:else}
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
					bind:theme
					bind:animation
					{themes}
					{animations}
					{links}
					bind:expandedIndex
					onavatarupload={handleAvatarUpload}
					onheaderupload={handleHeaderUpload}
					onlinkanimationchange={handleLinkAnimationChange}
				/>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label class="mb-3 block text-xs font-medium text-white/60" for="appearance-link-color">
							Warna Teks Link
						</label>
						<div class="flex flex-wrap items-center gap-3">
							<input
								id="appearance-link-color"
								type="color"
								bind:value={linkTextColor}
								class="h-12 w-16 shrink-0 cursor-pointer rounded-xl border border-white/20 bg-white/5 p-1"
							/>
							<input
								type="text"
								bind:value={linkTextColor}
								placeholder="#111827"
								class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white transition outline-none focus:border-violet-400/50"
							/>
							<button
								type="button"
								class="shrink-0 rounded-full border border-white/15 px-3 py-2 text-[11px] text-white/70 transition hover:border-white/40"
								onclick={() => (linkTextColor = '')}
							>
								Reset
							</button>
						</div>
					</div>
					<button
						onclick={openQr}
						class="mt-7 flex w-full items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition-all hover:bg-white/10"
					>
						Lihat QR Code
					</button>
				</div>

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

				<SocialSection bind:facebookUrl bind:instagramUrl bind:youtubeUrl bind:websiteUrl />

				{#if errorMessage}
					<div class="mt-4">
						<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Column: Sidebar & Preview -->
		<div class="flex flex-col gap-6 lg:sticky lg:top-6">
			<SidebarSection
				bind:title
				bind:slug
				bind:bio
				bind:isActive
				slugChecking={isCheckingSlug}
				slugAvailability={slugAvailable}
				slugStatusMessage={slugValidationMessage}
			/>

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
		{/if}
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
