<script lang="ts">
	interface MicrositeLink {
		label: string;
		url: string;
		icon: string;
		type?: string;
		caption?: string;
		animation?: string;
		alignment?: string;
		fontSize?: number;
	}

	let {
		title = '',
		slug = '',
		theme = 'default',
		animation = 'fade',
		avatarUrl = '',
		links = [],
		isActive = $bindable(true),
		onGenerateQR = () => {},
		facebookUrl = '',
		instagramUrl = '',
		youtubeUrl = '',
		websiteUrl = ''
	} = $props<{
		title: string;
		slug: string;
		theme: string;
		animation: string;
		avatarUrl: string;
		links: MicrositeLink[];
		isActive: boolean;
		onGenerateQR?: () => void;
		facebookUrl?: string;
		instagramUrl?: string;
		youtubeUrl?: string;
		websiteUrl?: string;
	}>();
</script>

<div class="space-y-6">
	<!-- Summary Card -->
	<div class="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
		<div class="mb-4 flex items-center gap-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 text-violet-300"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-base font-semibold text-white">Review & Publish</h3>
				<p class="text-xs text-white/60">Periksa kembali sebelum mempublikasikan</p>
			</div>
		</div>

		<!-- Summary Info -->
		<div class="space-y-3">
			<div class="flex items-start justify-between rounded-xl bg-white/5 p-3">
				<div class="flex-1">
					<div class="text-[10px] font-medium tracking-wide text-white/40 uppercase">
						Informasi Dasar
					</div>
					<div class="mt-1 text-sm text-white">{title || 'Belum diisi'}</div>
					<div class="mt-0.5 text-xs text-white/60">
						{#if slug}
							glx.my.id/m/{slug}
						{:else}
							Slug belum diisi
						{/if}
					</div>
				</div>
				<button
					type="button"
					class="rounded-lg border border-white/15 px-2 py-1 text-[10px] text-white/60 transition hover:border-violet-400/50 hover:text-violet-300"
					onclick={onGenerateQR}
				>
					📱 QR Code
				</button>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-white/5 p-3">
					<div class="text-[10px] font-medium tracking-wide text-white/40 uppercase">Tema</div>
					<div class="mt-1 text-sm text-white capitalize">{theme}</div>
				</div>
				<div class="rounded-xl bg-white/5 p-3">
					<div class="text-[10px] font-medium tracking-wide text-white/40 uppercase">Animasi</div>
					<div class="mt-1 text-sm text-white capitalize">{animation}</div>
				</div>
			</div>

			<div class="rounded-xl bg-white/5 p-3">
				<div class="text-[10px] font-medium tracking-wide text-white/40 uppercase">
					Jumlah Komponen
				</div>
				<div class="mt-1 flex items-center gap-2">
					<span class="text-sm text-white">{links.length} Komponen</span>
					{#if links.length === 0}
						<span class="text-xs text-amber-400">⚠️ Belum ada link</span>
					{/if}
				</div>
			</div>

			<div class="rounded-xl bg-white/5 p-3">
				<div class="text-[10px] font-medium tracking-wide text-white/40 uppercase">
					Social Media
				</div>
				<div class="mt-2 flex flex-wrap gap-2">
					{#if facebookUrl}
						<span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300"
							>Facebook</span
						>
					{/if}
					{#if instagramUrl}
						<span class="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] text-pink-300"
							>Instagram</span
						>
					{/if}
					{#if youtubeUrl}
						<span class="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300"
							>YouTube</span
						>
					{/if}
					{#if websiteUrl}
						<span class="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300"
							>Website</span
						>
					{/if}
					{#if !facebookUrl && !instagramUrl && !youtubeUrl && !websiteUrl}
						<span class="text-xs text-white/40">Belum ada social media</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Status Toggle -->
	<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-sm font-medium text-white">Status Publikasi</div>
				<p class="mt-0.5 text-xs text-white/60">
					{isActive ? 'Microsite akan langsung aktif' : 'Microsite akan disimpan sebagai draft'}
				</p>
			</div>
			<label class="relative inline-flex cursor-pointer items-center">
				<input type="checkbox" bind:checked={isActive} class="peer sr-only" />
				<div
					class="peer h-7 w-12 rounded-full bg-white/10 peer-checked:bg-violet-500 peer-focus:ring-2 peer-focus:ring-violet-500/50 after:absolute after:top-[4px] after:left-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5"
				></div>
			</label>
		</div>
	</div>

	<!-- Preview Info -->
	<div class="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
		<div class="mb-2 flex items-center gap-2">
			<svg class="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
				/>
			</svg>
			<span class="text-xs font-medium text-cyan-300">Preview</span>
		</div>
		<p class="text-[11px] text-cyan-200/80">
			Lihat preview real-time microsite Anda di panel sebelah kanan. Preview akan update otomatis
			saat Anda melakukan perubahan.
		</p>
	</div>

	<!-- Checklist -->
	<div class="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
		<div class="mb-3 flex items-center gap-2">
			<svg class="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
				/>
			</svg>
			<span class="text-xs font-medium text-cyan-300">Checklist Sebelum Publish</span>
		</div>
		<ul class="space-y-2 text-[11px] text-cyan-200/80">
			<li class="flex items-start gap-2">
				<span class={title && slug ? 'text-green-400' : 'text-white/40'}>
					{title && slug ? '✓' : '○'}
				</span>
				<span>Judul dan slug sudah diisi</span>
			</li>
			<li class="flex items-start gap-2">
				<span class={avatarUrl ? 'text-green-400' : 'text-white/40'}>
					{avatarUrl ? '✓' : '○'}
				</span>
				<span>Avatar sudah diupload (opsional tapi direkomendasikan)</span>
			</li>
			<li class="flex items-start gap-2">
				<span class={links.length > 0 ? 'text-green-400' : 'text-white/40'}>
					{links.length > 0 ? '✓' : '○'}
				</span>
				<span>Minimal 1 link sudah ditambahkan</span>
			</li>
			<li class="flex items-start gap-2">
				<span
					class={facebookUrl || instagramUrl || youtubeUrl || websiteUrl
						? 'text-green-400'
						: 'text-white/40'}
				>
					{facebookUrl || instagramUrl || youtubeUrl || websiteUrl ? '✓' : '○'}
				</span>
				<span>Social media link sudah ditambahkan (opsional)</span>
			</li>
		</ul>
	</div>

	<!-- Warning if incomplete -->
	{#if !title || !slug}
		<div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
			<div class="flex items-start gap-3">
				<svg
					class="h-5 w-5 shrink-0 text-amber-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div>
					<div class="text-sm font-medium text-amber-300">Data Belum Lengkap</div>
					<p class="mt-1 text-xs text-amber-200/80">
						Judul dan slug wajib diisi sebelum mempublikasikan microsite.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
