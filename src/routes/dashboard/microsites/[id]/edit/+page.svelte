<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MicrositePreview from '$lib/components/MicrositePreview.svelte';
	import SocialIconRow from '$lib/components/SocialIconRow.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';

	const themes = ['default', 'gradient', 'minimal', 'neon'];
	const animations = ['fade', 'slide-up', 'scale', 'bounce', 'flip', 'zoom', 'none'];

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
	let links = $state([
		{
			label: '',
			url: '',
			icon: '',
			type: 'link',
			caption: '',
			animation: '',
			fontSize: 14,
			alignment: 'left'
		}
	]);

	let qrUrl = $state('');
	let showQr = $state(false);
	let copiedQrLink = $state(false);
	let draggedIndex: number | null = $state(null);
	let dragOverIndex: number | null = $state(null);

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

	const addTextLabel = () => {
		addLink('text', { label: 'Label tanpa link' });
	};

	type SocialPlatform = 'facebook' | 'website' | 'youtube' | 'instagram';

	const getSocialValue = (platform: SocialPlatform) => {
		if (platform === 'facebook') return facebookUrl;
		if (platform === 'website') return websiteUrl;
		if (platform === 'youtube') return youtubeUrl;
		if (platform === 'instagram') return instagramUrl;
		return '';
	};

	const setSocialValue = (platform: SocialPlatform, url: string) => {
		if (platform === 'facebook') facebookUrl = url;
		else if (platform === 'website') websiteUrl = url;
		else if (platform === 'youtube') youtubeUrl = url;
		else if (platform === 'instagram') instagramUrl = url;
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
			ctx.fillText(title, canvas.width / 2, qrSize + padding + 50);

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
				console.error('API Error:', response.status, payload);
				errorMessage = payload?.message ?? 'Gagal memuat microsite.';
				dataLoaded = true; // Tetap set true agar preview muncul
				return;
			}

			const payload = await response.json();
			console.log('API Response:', payload);

			if (!payload.microsite) {
				console.error('No microsite data in response');
				errorMessage = 'Data microsite tidak ditemukan.';
				dataLoaded = true; // Tetap set true agar preview muncul
				return;
			}

			title = payload.microsite.title ?? '';
			slug = payload.microsite.slug ?? '';
			bio = payload.microsite.bio ?? '';
			theme = payload.microsite.theme ?? 'default';
			animation = payload.microsite.animation ?? 'fade';
			avatarUrl = payload.microsite.avatarUrl ?? '';
			headerBg = payload.microsite.headerBg ?? '';
			linkTextColor = payload.microsite.linkTextColor ?? '';
			facebookUrl = payload.microsite.facebookUrl ?? '';
			websiteUrl = payload.microsite.websiteUrl ?? '';
			youtubeUrl = payload.microsite.youtubeUrl ?? '';
			instagramUrl = payload.microsite.instagramUrl ?? '';
			isActive = payload.microsite.isActive !== false;
			links = (payload.links ?? []).map(
				(link: {
					label: string;
					url: string;
					icon: string | null;
					type: string | null;
					caption: string | null;
					animation: string | null;
					alignment: string | null;
					fontSize: number | null;
				}) => ({
					label: link.label,
					url: link.url,
					icon: link.icon ?? '',
					type: link.type ?? 'link',
					caption: link.caption ?? '',
					animation: link.animation ?? '',
					alignment: link.alignment ?? 'left',
					fontSize: link.fontSize ?? 14
				})
			);
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
			dataLoaded = true; // Set true agar preview tetap muncul dengan data default
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
	<title>Edit Microsite</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-6 pb-16">
	<div class="py-6">
		<div class="mb-4">
			<a
				class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
				href="/dashboard/microsites"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					></path>
				</svg>
				Kembali ke Daftar Microsite
			</a>
		</div>
		<h1 class="font-display text-2xl font-semibold">Edit Microsite</h1>
		<p class="text-sm text-white/60">Perbarui profil, lihat pratinjau langsung di samping.</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_420px]">
		<!-- Form -->
		<div class="glass-panel rounded-3xl p-6 md:p-8">
			<div class="space-y-4">
				<div class="mb-1 flex items-start justify-between gap-3">
					<div>
						<div class="font-display text-base font-semibold">Pengaturan Form</div>
						<p class="text-[11px] text-white/50">
							Atur tampilan, media, dan daftar link microsite.
						</p>
					</div>
					<button
						type="button"
						class={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${isActive ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200' : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'}`}
						onclick={() => (isActive = !isActive)}
						aria-pressed={isActive}
					>
						<span
							class={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]' : 'bg-white/40'}`}
						></span>
						{isActive ? 'Aktif' : 'Nonaktif'}
					</button>
				</div>

				<label class="text-xs text-white/60">Foto Avatar</label>
				<div class="mt-2 flex items-center gap-4">
					{#if avatarUrl}
						<img
							src={avatarUrl}
							class="h-16 w-16 rounded-full border border-white/20 object-cover"
							alt="Avatar"
						/>
					{:else}
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20 text-xs text-white/40"
						>
							Foto
						</div>
					{/if}
					<button
						type="button"
						class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-white/40"
						onclick={() => document.getElementById('avatar-input')?.click()}>Upload</button
					>
					<input
						id="avatar-input"
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handleAvatarUpload}
					/>
					{#if avatarUrl}
						<button type="button" class="text-xs text-red-400" onclick={() => (avatarUrl = '')}
							>Hapus</button
						>
					{/if}
				</div>

				<label class="text-xs text-white/60">Background Header</label>
				<div class="mt-2 flex items-center gap-4">
					{#if headerBg}
						<div
							class="h-16 w-24 rounded-xl border border-white/20"
							style="background: {headerBg}; background-size: cover; background-position: center;"
						></div>
					{/if}
					<button
						type="button"
						class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-white/40"
						onclick={() => document.getElementById('header-input')?.click()}
						>Upload Background</button
					>
					<input
						id="header-input"
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handleHeaderUpload}
					/>
					{#if headerBg}
						<button type="button" class="text-xs text-red-400" onclick={() => (headerBg = '')}
							>Hapus</button
						>
					{/if}
				</div>
				<p class="mt-1 text-[10px] text-white/40">
					Resolusi ideal: 375x200px (smartphone). Bisa juga pakai CSS gradient.
				</p>

				<label class="text-xs text-white/60" for="linkTextColor">Warna Teks Daftar Link</label>
				<div class="mt-2 flex items-center gap-3">
					<input
						id="linkTextColor"
						type="color"
						bind:value={linkTextColor}
						class="h-10 w-14 cursor-pointer rounded-xl border border-white/20 bg-white/5 p-1"
					/>
					<input
						type="text"
						bind:value={linkTextColor}
						placeholder="#111827"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
					/>
					<button
						type="button"
						class="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70"
						onclick={() => (linkTextColor = '')}
					>
						Reset
					</button>
				</div>

				<label class="text-xs text-white/60">Tema</label>
				<div class="grid gap-3 md:grid-cols-4">
					{#each themes as item (item)}
						<button
							class={`rounded-2xl border px-3 py-2 text-xs transition ${theme === item ? 'border-violet-400 bg-violet-500/20 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}
							type="button"
							onclick={() => (theme = item)}
						>
							{item}
						</button>
					{/each}
				</div>

				<label class="text-xs text-white/60">Animasi Teks & Card</label>
				<div class="grid gap-2 md:grid-cols-4">
					{#each animations as item (item)}
						<button
							class={`rounded-2xl border px-3 py-2 text-xs transition ${animation === item ? 'border-cyan-400 bg-cyan-500/20 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}
							type="button"
							onclick={() => (animation = item)}
						>
							{item === 'none' ? 'Tanpa Animasi' : item}
						</button>
					{/each}
				</div>

				<!-- Daftar Link -->
				<div class="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="mb-3 flex items-center justify-between">
						<label class="text-xs font-semibold text-white/60">Daftar Link</label>
						<button
							class="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/40"
							type="button"
							onclick={() => addLink('link')}
						>
							+ Tambah
						</button>
					</div>
					<div class="mb-3 flex flex-wrap gap-2">
						<button
							type="button"
							class="rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-[11px] text-violet-200 transition hover:bg-violet-500/25"
							onclick={addTextLabel}
						>
							+ Tambah Text/Label
						</button>
					</div>
					<div class="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
						<SocialIconRow
							editable={true}
							facebookUrl={getSocialValue('facebook')}
							websiteUrl={getSocialValue('website')}
							youtubeUrl={getSocialValue('youtube')}
							instagramUrl={getSocialValue('instagram')}
							onUpdate={(platform, value) => setSocialValue(platform, value)}
						/>
					</div>
					<div class="max-h-[500px] space-y-2 overflow-y-auto pr-1">
						{#each links as link, index (index)}
							<div
								class="space-y-2 rounded-2xl border bg-white/5 p-3 transition-all duration-150 {dragOverIndex ===
								index
									? 'border-violet-500/50'
									: 'border-white/10'}"
								draggable="true"
								ondragstart={() => handleDragStart(index)}
								ondragover={(e) => handleDragOver(e, index)}
								ondrop={() => handleDrop(index)}
								ondragend={handleDragEnd}
							>
								<div class="flex items-center justify-between gap-2">
									<div class="flex items-center gap-1">
										<button
											type="button"
											class="cursor-grab text-xs text-white/40 hover:text-white/70 active:cursor-grabbing"
											title="Seret untuk urutkan">⠿</button
										>
										<span class="text-[10px] text-white/30">#{index + 1}</span>
									</div>
									<div class="flex items-center gap-1">
										<button
											type="button"
											class="rounded px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 disabled:opacity-20"
											disabled={index === 0}
											onclick={() => moveLink(index, -1)}>▲</button
										>
										<button
											type="button"
											class="rounded px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 disabled:opacity-20"
											disabled={index === links.length - 1}
											onclick={() => moveLink(index, 1)}>▼</button
										>
									</div>
								</div>
								<!-- Type selector -->
								<div class="flex gap-2">
									{#each ['link', 'text', 'divider', 'image'] as t (t)}
										<button
											class="rounded-lg px-2 py-1 text-[10px] {(link.type || 'link') === t
												? 'border border-violet-400 bg-violet-500/30 text-white'
												: 'border border-white/10 text-white/50'}"
											type="button"
											onclick={() => (links[index].type = t)}>{t}</button
										>
									{/each}
								</div>

								{#if link.type === 'link'}
									<!-- Label + Icon row -->
									<div class="grid grid-cols-2 gap-2">
										<input
											placeholder="Label"
											bind:value={link.label}
											class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white"
										/>
										<input
											placeholder="Icon (emoji)"
											bind:value={link.icon}
											class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white"
										/>
									</div>
									<!-- URL row full-width prominent -->
									<input
										placeholder="URL"
										bind:value={link.url}
										class="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/5 px-3 py-2.5 text-xs text-white placeholder-cyan-200/50 transition outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.15)]"
									/>
									<!-- Font Size -->
									<div class="flex items-center gap-2">
										<label class="text-[10px] text-white/40">Ukuran Font:</label>
										<input
											type="number"
											min="8"
											max="32"
											bind:value={link.fontSize}
											class="w-16 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-white"
										/>
										<span class="text-[10px] text-white/40">px</span>
									</div>
								{:else if link.type === 'text'}
									<div class="space-y-2">
										<input
											placeholder="Teks Label"
											bind:value={link.label}
											class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white"
										/>
										<div class="flex items-center gap-2">
											<span class="text-[10px] text-white/40">Alignment:</span>
											<button
												type="button"
												class="rounded-lg border px-2 py-1 text-[10px] {link.alignment === 'left'
													? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
													: 'border-white/10 text-white/60'}"
												onclick={() => (links[index].alignment = 'left')}
											>
												← Kiri
											</button>
											<button
												type="button"
												class="rounded-lg border px-2 py-1 text-[10px] {link.alignment === 'center'
													? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
													: 'border-white/10 text-white/60'}"
												onclick={() => (links[index].alignment = 'center')}
											>
												↔ Tengah
											</button>
											<button
												type="button"
												class="rounded-lg border px-2 py-1 text-[10px] {link.alignment === 'right'
													? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
													: 'border-white/10 text-white/60'}"
												onclick={() => (links[index].alignment = 'right')}
											>
												Kanan →
											</button>
										</div>
										<!-- Font Size -->
										<div class="flex items-center gap-2">
											<label class="text-[10px] text-white/40">Ukuran Font:</label>
											<input
												type="number"
												min="8"
												max="32"
												bind:value={link.fontSize}
												class="w-16 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-white"
											/>
											<span class="text-[10px] text-white/40">px</span>
										</div>
										<p class="text-[10px] text-white/40">Ditampilkan sebagai teks tanpa URL.</p>
									</div>
								{:else if link.type === 'image'}
									<div class="space-y-2">
										<div class="flex items-center gap-2">
											{#if link.url}
												<img
													src={link.url}
													class="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
													alt=""
												/>
											{/if}
											<button
												type="button"
												class="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] text-white/70 hover:border-white/40"
												onclick={() => document.getElementById('link-img-' + index)?.click()}
											>
												{link.url ? 'Ganti' : 'Upload Gambar'}
											</button>
											<input
												id="link-img-{index}"
												type="file"
												accept="image/*"
												class="hidden"
												onchange={(e) => handleLinkImageUpload(index, e)}
											/>
											{#if link.url}
												<button
													type="button"
													class="text-[10px] text-red-400"
													onclick={() => (links[index].url = '')}>Hapus</button
												>
											{/if}
										</div>
										<input
											placeholder="Caption (opsional)"
											bind:value={link.caption}
											class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white"
										/>
									</div>
								{:else if link.type === 'divider'}
									<div class="py-2 text-center text-xs text-white/40">Garis pemisah</div>
								{/if}

								<!-- Animation picker -->
								<div class="flex flex-wrap gap-1">
									{#each ['', 'fade', 'slide-up', 'scale', 'bounce', 'flip', 'zoom'] as anim (anim)}
										<button
											class="rounded px-1.5 py-0.5 text-[10px] {(link.animation || '') === anim
												? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
												: 'text-white/40 hover:text-white/60'}"
											type="button"
											onclick={() => (links[index].animation = anim || '')}
											>{anim || 'default'}</button
										>
									{/each}
								</div>

								<!-- Delete button -->
								<button
									class="flex w-full items-center justify-center gap-1 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/30 hover:text-red-200"
									type="button"
									onclick={() => removeLink(index)}
								>
									🗑 Hapus
								</button>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-4">
					<button
						class="w-full rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
						onclick={handleSubmit}
						disabled={isLoading}
						type="button"
					>
						{isLoading ? 'Memproses...' : 'Simpan Perubahan'}
					</button>

					<div class="mt-4">
						{#if errorMessage}
							<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Identitas + Live Preview -->
		<div class="flex flex-col gap-6 lg:sticky lg:top-6">
			<!-- Identitas Microsite -->
			<div class="glass-panel rounded-3xl p-4">
				<div class="mb-3 flex items-center justify-between">
					<label class="text-xs font-semibold text-white/60">Identitas Microsite</label>
					<button
						type="button"
						class="rounded-xl border border-white/15 px-3 py-2 text-[11px] text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10"
						onclick={openQr}
						title="Tampilkan QR Code"
					>
						QR
					</button>
				</div>
				<div class="space-y-3">
					<div>
						<label class="text-xs text-white/60" for="title">Judul</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							placeholder="Nama brand atau personal"
							class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
						/>
					</div>
					<div>
						<label class="text-xs text-white/60" for="slug">Slug</label>
						<input
							id="slug"
							type="text"
							bind:value={slug}
							placeholder="misal: naya"
							class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
						/>
					</div>
					<div>
						<label class="text-xs text-white/60" for="bio">Bio</label>
						<textarea
							id="bio"
							rows="3"
							bind:value={bio}
							placeholder="Ceritakan singkat tentang kamu"
							class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Live Preview -->
			<div class="glass-panel rounded-3xl p-4">
				<div class="mb-3 text-center text-xs text-white/50">Pratinjau Langsung</div>
				{#if errorMessage && !dataLoaded}
					<div
						class="flex h-[600px] w-[320px] flex-col items-center justify-center gap-3 text-center"
					>
						<p class="text-sm text-red-400">{errorMessage}</p>
						<button
							type="button"
							onclick={loadMicrosite}
							class="rounded-lg bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/20"
						>
							Coba Lagi
						</button>
					</div>
				{:else}
					<div class="flex items-center justify-center">
						{#if dataLoaded}
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
						{:else}
							<div
								class="flex h-[600px] w-[320px] items-center justify-center text-xs text-white/40"
							>
								Memuat...
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<p class="text-center text-[10px] text-white/40">
				glx.my.id/m/{slug || 'slug'} &middot; Tema {theme} &middot; Animasi {animation}
			</p>
		</div>
	</div>
</div>

{#if showQr}
	<div
		class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
		onclick={() => (showQr = false)}
		onkeydown={(e) => e.key === 'Escape' && (showQr = false)}
		role="button"
		tabindex="0"
	>
		<div
			class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
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
						class="flex h-[220px] w-[220px] items-center justify-center rounded-2xl bg-white/5 text-xs text-white/40"
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
						<span class="flex-1 font-mono text-sm font-semibold text-white">glx.my.id/m/{slug}</span
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
					<div class="text-xs break-all text-white/60">{title}</div>
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
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					Selesai
				</button>
			</div>
		</div>
	</div>
{/if}
