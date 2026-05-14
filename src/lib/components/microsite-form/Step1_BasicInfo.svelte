<script lang="ts">
	let {
		title = $bindable(''),
		slug = $bindable(''),
		bio = $bindable(''),
		plan = 'free',
		onGenerateQR = () => {},
		facebookUrl = $bindable(''),
		instagramUrl = $bindable(''),
		youtubeUrl = $bindable(''),
		websiteUrl = $bindable('')
	} = $props<{
		title: string;
		slug: string;
		bio: string;
		plan?: string;
		onGenerateQR?: () => void;
		facebookUrl: string;
		instagramUrl: string;
		youtubeUrl: string;
		websiteUrl: string;
	}>();

	// Auto-generate slug from title
	const generateSlug = () => {
		if (!slug && title) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	};
</script>

<div class="max-w-full min-w-0 space-y-6">
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-medium text-white/60" for="title">
				Judul Microsite <span class="text-red-400">*</span>
			</label>
			<span class="text-[10px] text-white/40">{title.length}/100</span>
		</div>
		<input
			id="title"
			type="text"
			bind:value={title}
			onblur={generateSlug}
			maxlength="100"
			placeholder="Contoh: Naya's Links, Toko Kue Mama, Portfolio Saya"
			class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
		/>
		<p class="mt-1.5 text-[10px] text-white/40">
			Nama yang akan ditampilkan di bagian atas microsite Anda
		</p>
	</div>

	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-medium text-white/60" for="slug">
				Slug (URL) <span class="text-red-400">*</span>
			</label>
			{#if plan === 'pro'}
				<button
					type="button"
					class="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 transition hover:bg-violet-500/20"
					onclick={onGenerateQR}
					title="Generate QR Code"
				>
					📱 QR Code
				</button>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm text-white/40">glx.my.id/m/</span>
			<input
				id="slug"
				type="text"
				bind:value={slug}
				maxlength="50"
				placeholder="naya-links"
				pattern="[a-z0-9-]+"
				class="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
				disabled={plan !== 'pro'}
			/>
		</div>
		<p class="mt-1.5 text-[10px] text-white/40">
			{#if plan !== 'pro'}
				<span class="text-amber-400">⚠️ Upgrade ke Pro untuk custom slug</span>
			{:else}
				Hanya huruf kecil, angka, dan tanda hubung (-)
			{/if}
		</p>
	</div>

	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-medium text-white/60" for="bio">Bio / Deskripsi</label>
			<span class="text-[10px] text-white/40">{bio.length}/200</span>
		</div>
		<textarea
			id="bio"
			rows="4"
			bind:value={bio}
			maxlength="200"
			placeholder="Ceritakan singkat tentang diri Anda atau brand Anda. Contoh: 'Content Creator & Entrepreneur. Sharing tips bisnis online 🚀'"
			class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
		></textarea>
		<p class="mt-1.5 text-[10px] text-white/40">
			Deskripsi singkat yang akan muncul di bawah nama Anda
		</p>
	</div>

	<!-- Social Media -->
	<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
		<div class="mb-3 flex items-center gap-2">
			<svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
			<span class="text-xs font-medium text-white/60">Social Media</span>
			<span class="text-[10px] text-white/30">(opsional)</span>
		</div>
		<p class="mb-3 text-[10px] text-white/40">
			Akan tampil sebagai ikon di footer microsite (lihat preview di samping)
		</p>
		<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1.5">
					<img src="/icons/social/facebook.svg" alt="Facebook" class="h-full w-full" />
				</div>
				<div class="min-w-0 flex-1">
					<label class="text-[10px] text-white/40" for="fb-url">Facebook</label>
					<input
						id="fb-url"
						type="url"
						bind:value={facebookUrl}
						placeholder="https://facebook.com/..."
						class="w-full border-none bg-transparent p-0 text-xs text-white outline-none placeholder:text-white/30"
					/>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1.5">
					<img src="/icons/social/instagram.svg" alt="Instagram" class="h-full w-full" />
				</div>
				<div class="min-w-0 flex-1">
					<label class="text-[10px] text-white/40" for="ig-url">Instagram</label>
					<input
						id="ig-url"
						type="url"
						bind:value={instagramUrl}
						placeholder="https://instagram.com/..."
						class="w-full border-none bg-transparent p-0 text-xs text-white outline-none placeholder:text-white/30"
					/>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1.5">
					<img src="/icons/social/youtube.svg" alt="YouTube" class="h-full w-full" />
				</div>
				<div class="min-w-0 flex-1">
					<label class="text-[10px] text-white/40" for="yt-url">YouTube</label>
					<input
						id="yt-url"
						type="url"
						bind:value={youtubeUrl}
						placeholder="https://youtube.com/@..."
						class="w-full border-none bg-transparent p-0 text-xs text-white outline-none placeholder:text-white/30"
					/>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1.5">
					<img src="/icons/social/website.svg" alt="Website" class="h-full w-full" />
				</div>
				<div class="min-w-0 flex-1">
					<label class="text-[10px] text-white/40" for="web-url">Website</label>
					<input
						id="web-url"
						type="url"
						bind:value={websiteUrl}
						placeholder="https://example.com"
						class="w-full border-none bg-transparent p-0 text-xs text-white outline-none placeholder:text-white/30"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Tips Section -->
	<div class="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
		<div class="mb-2 flex items-center gap-2">
			<svg class="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span class="text-xs font-medium text-cyan-300">Tips</span>
		</div>
		<ul class="space-y-1 text-[11px] text-cyan-200/80">
			<li>• Gunakan judul yang mudah diingat dan mencerminkan brand Anda</li>
			<li>• Slug akan menjadi URL permanen, pilih dengan hati-hati</li>
			<li>• Bio yang menarik dapat meningkatkan engagement pengunjung</li>
		</ul>
	</div>
</div>
