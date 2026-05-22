<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import MicrositePreview from '$lib/components/MicrositePreview.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import StepIndicator from '$lib/components/microsite-form/StepIndicator.svelte';
	import Step1_BasicInfo from '$lib/components/microsite-form/Step1_BasicInfo.svelte';
	import Step2_Appearance from '$lib/components/microsite-form/Step2_Appearance.svelte';
	import Step3_Links from '$lib/components/microsite-form/Step3_Links.svelte';
	import Step4_Review from '$lib/components/microsite-form/Step4_Review.svelte';

	let plan = $derived($page.data.plan);
	let isProActive = $derived($page.data.isProActive);

	// Force refresh data on mount to get latest from database
	onMount(() => {
		if (browser) {
			console.log('[Microsites New] Refreshing data on mount...');
			invalidateAll().then(() => {
				console.log('[Microsites New] Data refreshed, plan:', plan, 'isProActive:', isProActive);
			});
		}
	});

	// Multi-step state
	let currentStep = $state(1);
	const totalSteps = 4;

	// Form state
	let title = $state('');
	let slug = $state('');
	let bio = $state('');
	let theme = $state('default');
	let animation = $state('fade');
	let avatarUrl = $state('');
	let headerBg = $state('');
	let linkTextColor = $state('');
	let facebookUrl = $state('');
	let instagramUrl = $state('');
	let youtubeUrl = $state('');
	let websiteUrl = $state('');
	let isActive = $state(true);
	let errorMessage = $state('');
	let isLoading = $state(false);
	let qrUrl = $state('');
	let showQr = $state(false);
	let copiedQrLink = $state(false);
	let draggedIndex: number | null = $state(null);
	let dragOverIndex: number | null = $state(null);
	let links = $state([
		{ label: '', url: '', icon: '', type: 'link', caption: '', animation: '', isHidden: false }
	]);

	const slugTakenMessage = 'Slug microsite sudah dipakai.';
	let slugCheckTimer: ReturnType<typeof setTimeout> | null = null;
	let lastCheckedSlug = '';
	let slugCheckRequestId = 0;
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

		if (normalizedSlug === lastCheckedSlug) {
			return errorMessage !== slugTakenMessage;
		}

		lastCheckedSlug = normalizedSlug;
		slugCheckRequestId += 1;
		const requestId = slugCheckRequestId;
		isCheckingSlug = true;
		slugValidationMessage = 'Mengecek ketersediaan slug...';

		try {
			const response = await fetch(
				`/api/microsites/check-slug?slug=${encodeURIComponent(normalizedSlug)}`
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

	// Upload handlers
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

	// Drag and drop handlers
	const handleDragStart = (index: number) => {
		draggedIndex = index;
	};

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

	// QR Code handlers
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
		setTimeout(() => {
			copiedQrLink = false;
		}, 2000);
	};

	const handleDownloadQr = async () => {
		if (!qrUrl) return;
		try {
			const QRCode = (await import('qrcode')).default;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			// Set canvas size (QR + padding + footer)
			const qrSize = 400;
			const padding = 40;
			const footerHeight = 60;
			canvas.width = qrSize + padding * 2;
			canvas.height = qrSize + padding * 2 + footerHeight;

			// Background with rounded corners
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

			// Generate QR code
			const qrCanvas = document.createElement('canvas');
			await QRCode.toCanvas(qrCanvas, qrUrl, {
				width: qrSize,
				margin: 1,
				color: { dark: '#000000', light: '#ffffff' }
			});

			// Draw QR code on main canvas
			ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

			// Draw footer text
			ctx.fillStyle = '#6366f1';
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`glx.my.id/m/${slug}`, canvas.width / 2, qrSize + padding + 30);

			ctx.fillStyle = '#64748b';
			ctx.font = '14px sans-serif';
			ctx.fillText(title || 'Microsite Baru', canvas.width / 2, qrSize + padding + 50);

			// Download
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

	// Link management
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
				isHidden: false
			}
		];
	};

	// Wrapper for Step3_Links compatibility
	const handleAddLink = (type: string) => {
		addLink(type as 'link' | 'divider' | 'image' | 'text');
	};

	const removeLink = (index: number) => {
		links = links.filter((_, idx) => idx !== index);
	};

	const duplicateLink = (index: number) => {
		const original = links[index];
		const copy = { ...original };
		links = [...links.slice(0, index + 1), copy, ...links.slice(index + 1)];
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

	// Step validation
	const validateStep = (step: number): boolean => {
		errorMessage = '';

		if (step === 1) {
			if (title.trim().length < 2) {
				errorMessage = 'Judul minimal 2 karakter.';
				return false;
			}
			if (slug.trim().length < 3) {
				errorMessage = 'Slug minimal 3 karakter.';
				return false;
			}
		}

		return true;
	};

	// Navigation handlers
	const nextStep = () => {
		if (!validateStep(currentStep)) {
			return;
		}

		if (currentStep < totalSteps) {
			currentStep++;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			currentStep--;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const goToStep = (step: number) => {
		if (step <= currentStep) {
			currentStep = step;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// Submit handler
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

		const socialLinks = [];
		if (facebookUrl)
			socialLinks.push({
				type: 'social',
				label: 'Facebook',
				url: facebookUrl,
				icon: 'facebook',
				caption: '',
				animation: '',
				isHidden: false
			});
		if (instagramUrl)
			socialLinks.push({
				type: 'social',
				label: 'Instagram',
				url: instagramUrl,
				icon: 'instagram',
				caption: '',
				animation: '',
				isHidden: false
			});
		if (youtubeUrl)
			socialLinks.push({
				type: 'social',
				label: 'YouTube',
				url: youtubeUrl,
				icon: 'youtube',
				caption: '',
				animation: '',
				isHidden: false
			});
		if (websiteUrl)
			socialLinks.push({
				type: 'social',
				label: 'Website',
				url: websiteUrl,
				icon: 'website',
				caption: '',
				animation: '',
				isHidden: false
			});

		isLoading = true;
		try {
			const response = await fetch('/api/microsites', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					slug: slug.trim(),
					bio: bio.trim() || null,
					theme,
					animation,
					avatarUrl: avatarUrl.trim() || null,
					headerBg: headerBg.trim() || null,
					isActive,
					facebookUrl: facebookUrl || null,
					instagramUrl: instagramUrl || null,
					youtubeUrl: youtubeUrl || null,
					websiteUrl: websiteUrl || null,
					links: [...links, ...socialLinks].map((l) => ({
						type: l.type || 'link',
						label: l.label || '',
						url: l.url || '',
						icon: l.icon || '',
						caption: l.caption || '',
						animation: l.animation || '',
						isHidden: (l as { isHidden?: boolean }).isHidden === true
					}))
				})
			});
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Gagal membuat microsite.';
				return;
			}
			window.location.href = '/dashboard/microsites';
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Buat Microsite</title>
</svelte:head>

{#if plan !== 'pro'}
	<div class="mx-auto w-full max-w-6xl px-6 pb-16">
		<div class="py-6">
			<h1 class="font-display text-2xl font-semibold">Buat Microsite Baru</h1>
			<p class="text-sm text-white/60">Lengkapi profil, lihat pratinjau langsung di samping.</p>
		</div>

		<div class="glass-panel rounded-3xl p-6 text-center">
			<p class="text-sm text-white/60">
				Microsite adalah fitur <span
					class="rounded bg-linear-to-r from-violet-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-semibold text-white"
					>Pro</span
				>
			</p>
			<p class="mt-2 text-xs text-white/40">
				Upgrade untuk membuat halaman profil bio dengan 4 tema dan animasi.
			</p>
			<button
				type="button"
				onclick={() => goto(resolve('/dashboard/billing'))}
				class="mt-4 inline-block rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
				>Upgrade Sekarang</button
			>
		</div>
	</div>
{:else}
	<div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
		<div class="py-2">
			<h1 class="font-display text-2xl font-semibold">Buat Microsite Baru</h1>
			<p class="text-sm text-white/60">Ikuti langkah-langkah untuk membuat microsite Anda.</p>
		</div>

		<!-- Pro Expired Warning -->
		{#if !isProActive}
			<div class="glass-panel mb-6 rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-6">
				<div class="flex items-start gap-4">
					<div class="text-3xl">🚫</div>
					<div class="flex-1">
						<h3 class="font-display text-lg font-semibold text-red-400">
							Langganan Pro Anda Telah Berakhir
						</h3>
						<p class="mt-2 text-sm text-white/80">
							Anda tidak dapat membuat microsite baru karena langganan Pro Anda telah berakhir.
							Perpanjang langganan untuk mengaktifkan kembali fitur ini.
						</p>
						<div class="mt-4 flex gap-3">
							<a
								href={resolve('/dashboard/billing')}
								class="rounded-full bg-linear-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:shadow-amber-500/40"
							>
								🔄 Perpanjang Langganan
							</a>
							<a
								href={resolve('/dashboard/microsites')}
								class="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5"
							>
								← Kembali
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Step Indicator -->
		<div class="mb-8 py-2">
			<StepIndicator {currentStep} {totalSteps} onStepClick={goToStep} />
		</div>

		<!-- Main Content Grid -->
		<div class="grid gap-6 lg:grid-cols-[1fr_420px] lg:gap-8">
			<!-- Left: Form Panel -->
			<div class="space-y-6">
				<div class="glass-panel max-w-3xl rounded-3xl px-4 py-4 md:px-8 md:py-8">
					<!-- Step Content -->
					{#if currentStep === 1}
						<Step1_BasicInfo
							bind:title
							bind:slug
							bind:bio
							{plan}
							onGenerateQR={openQr}
							bind:facebookUrl
							bind:instagramUrl
							bind:youtubeUrl
							bind:websiteUrl
							slugChecking={isCheckingSlug}
							slugAvailability={slugAvailable}
							slugStatusMessage={slugValidationMessage}
						/>
					{:else if currentStep === 2}
						<Step2_Appearance
							bind:avatarUrl
							bind:headerBg
							bind:linkTextColor
							bind:theme
							bind:animation
							onAvatarUpload={handleAvatarUpload}
							onHeaderUpload={handleHeaderUpload}
						/>
					{:else if currentStep === 3}
						<Step3_Links
							bind:links
							onAddLink={handleAddLink}
							onRemoveLink={removeLink}
							onMoveLink={moveLink}
							onDragStart={handleDragStart}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onDragEnd={handleDragEnd}
							onLinkImageUpload={handleLinkImageUpload}
							onDuplicateLink={duplicateLink}
							{dragOverIndex}
						/>
					{:else if currentStep === 4}
						<Step4_Review
							{title}
							{slug}
							{theme}
							{animation}
							{avatarUrl}
							{links}
							{facebookUrl}
							{instagramUrl}
							{youtubeUrl}
							{websiteUrl}
							bind:isActive
							onGenerateQR={openQr}
						/>
					{/if}

					<!-- Navigation Buttons -->
					<div
						class="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
					>
						<button
							type="button"
							class="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
							onclick={prevStep}
							disabled={currentStep === 1}
						>
							← Kembali
						</button>

						{#if currentStep < totalSteps}
							<button
								type="button"
								class="rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 sm:px-6"
								onclick={nextStep}
							>
								Lanjut →
							</button>
						{:else}
							<button
								type="button"
								class="rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
								onclick={handleSubmit}
								disabled={isLoading}
							>
								{isLoading ? 'Memproses...' : '✓ Buat Microsite'}
							</button>
						{/if}
					</div>

					<!-- Error Message -->
					{#if errorMessage}
						<div class="mt-4">
							<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
						</div>
					{/if}
				</div>
			</div>

			<!-- Right: Preview Sidebar (Sticky) -->
			<div class="lg:sticky lg:top-6 lg:h-fit">
				<div class="glass-panel max-w-full overflow-hidden rounded-3xl p-5 md:p-8">
					<div class="mb-2 text-center text-[10px] text-white/50 sm:mb-3 sm:text-xs">
						Pratinjau Langsung
					</div>
					<div class="flex items-center justify-center">
						<MicrositePreview
							{title}
							{slug}
							{bio}
							{theme}
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
					</div>
				</div>
				<p class="mt-3 text-center text-[9px] text-white/40 sm:mt-4 sm:text-[10px]">
					glx.my.id/m/{slug || 'slug'} &middot; Tema {theme} &middot; Animasi {animation}
				</p>
			</div>
		</div>
	</div>

	<!-- QR Code Modal -->
	{#if showQr}
		<div
			class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
			role="button"
			tabindex="0"
			onclick={() => (showQr = false)}
			onkeydown={(e) => {
				if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
					showQr = false;
				}
			}}
		>
			<div
				class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl"
				role="dialog"
				aria-modal="true"
				tabindex="0"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						e.stopPropagation();
					}
				}}
			>
				<div class="mb-5 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
							></path>
						</svg>
					</div>
					<div class="flex-1">
						<h2 class="font-display text-lg font-semibold">QR Code Microsite</h2>
						<p class="text-xs text-white/60">Scan untuk akses cepat</p>
					</div>
					<button
						class="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
						type="button"
						onclick={() => (showQr = false)}
						aria-label="Tutup"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>

				<!-- QR Code Display -->
				<div class="mb-5 flex justify-center">
					{#if qrUrl}
						<div class="rounded-2xl bg-white p-4 shadow-xl">
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`}
								alt="QR Code"
								class="h-55 w-55"
							/>
						</div>
					{:else}
						<div
							class="flex h-55 w-55 items-center justify-center rounded-2xl bg-white/5 text-xs text-white/40"
						>
							Isi slug terlebih dahulu
						</div>
					{/if}
				</div>

				<!-- Link Info -->
				{#if qrUrl}
					<div class="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
						<div class="mb-2 flex items-center gap-2">
							<svg
								class="h-4 w-4 text-violet-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								></path>
							</svg>
							<span class="flex-1 font-mono text-sm font-semibold text-white"
								>glx.my.id/m/{slug}</span
							>
							<button
								class="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
								type="button"
								onclick={handleCopyQrLink}
								aria-label="Copy link"
							>
								{#if copiedQrLink}
									<svg
										class="h-4 w-4 text-green-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										></path>
									</svg>
								{:else}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										></path>
									</svg>
								{/if}
							</button>
						</div>
						<div class="text-xs break-all text-white/60">{title || 'Microsite Baru'}</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex gap-3">
					{#if qrUrl}
						<button
							class="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
							type="button"
							onclick={handleDownloadQr}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								></path>
							</svg>
							Download
						</button>
					{/if}
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
						type="button"
						onclick={() => (showQr = false)}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						Selesai
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
