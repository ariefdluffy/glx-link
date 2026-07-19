<script lang="ts">
	import { parseHeaderBg, buildHeaderBg, headerBgStyle } from '$lib/utils/headerBg';

	let {
		avatarUrl = $bindable(''),
		headerBg = $bindable(''),
		linkTextColor = $bindable(''),
		theme = $bindable('default'),
		animation = $bindable('fade'),
		onAvatarUpload = async () => {},
		onHeaderUpload = async () => {},
		avatarUploading = false,
		headerUploading = false
	} = $props<{
		avatarUrl: string;
		headerBg: string;
		linkTextColor: string;
		theme: string;
		animation: string;
		avatarUploading?: boolean;
		headerUploading?: boolean;
		onAvatarUpload?: (e: Event) => Promise<void>;
		onHeaderUpload?: (e: Event) => Promise<void>;
	}>();

	const bgParts = $derived(parseHeaderBg(headerBg));
	const bgStyle = $derived(headerBgStyle(headerBg));

	const updateBgPos = (axis: 'x' | 'y', value: number) => {
		if (!bgParts) return;
		const next = { ...bgParts };
		if (axis === 'x') next.posX = value;
		else next.posY = value;
		headerBg = buildHeaderBg(next);
	};

	const updateBgZoom = (value: number) => {
		if (!bgParts) return;
		headerBg = buildHeaderBg({ ...bgParts, zoom: value });
	};

	const resetBgAdjust = () => {
		if (!bgParts) return;
		headerBg = buildHeaderBg({ ...bgParts, posX: 50, posY: 50, zoom: 100 });
	};

	const themes = ['default', 'gradient', 'minimal', 'neon', 'tech'];
	const animations = [
		{ value: 'none', label: 'Tanpa Animasi', icon: '🚫' },
		{ value: 'fade', label: 'Fade', icon: '💨' },
		{ value: 'slide-up', label: 'Slide Up', icon: '⬆️' },
		{ value: 'slide-down', label: 'Slide Down', icon: '⬇️' },
		{ value: 'slide-left', label: 'Slide Left', icon: '⬅️' },
		{ value: 'slide-right', label: 'Slide Right', icon: '➡️' },
		{ value: 'scale', label: 'Scale', icon: '🔲' },
		{ value: 'bounce', label: 'Bounce', icon: '🔄' },
		{ value: 'flip', label: 'Flip', icon: '🃏' },
		{ value: 'zoom', label: 'Zoom', icon: '🔍' },
		{ value: 'zoom-in', label: 'Zoom In', icon: '🔎' },
		{ value: 'zoom-out', label: 'Zoom Out', icon: '🔭' },
		{ value: 'rotate', label: 'Rotate', icon: '🌀' },
		{ value: 'pulse', label: 'Pulse', icon: '💓' },
		{ value: 'shake', label: 'Shake', icon: '📳' },
		{ value: 'wiggle', label: 'Wiggle', icon: '🐛' },
		{ value: 'glow', label: 'Glow', icon: '✨' },
		{ value: 'blur-in', label: 'Blur In', icon: '👁️' },
		// Continuous (looping)
		{ value: 'continuous-float', label: '▶ Terus Melayang', icon: '🎈' },
		{ value: 'continuous-pulse', label: '▶ Terus Berdenyut', icon: '💗' },
		{ value: 'continuous-wiggle', label: '▶ Terus Goyang', icon: '🦐' },
		{ value: 'continuous-breathe', label: '▶ Terus Bernapas', icon: '🫁' },
		{ value: 'continuous-bounce', label: '▶ Terus Memantul', icon: '🏀' },
		{ value: 'continuous-shake', label: '▶ Terus Gemetar', icon: '📳' },
		{ value: 'continuous-glow', label: '▶ Terus Bercahaya', icon: '💡' },
		// Cycle (1min on / 1min off)
		{ value: 'cycle-float', label: '⟳ Siklus Melayang', icon: '🎈' },
		{ value: 'cycle-pulse', label: '⟳ Siklus Berdenyut', icon: '💗' },
		{ value: 'cycle-wiggle', label: '⟳ Siklus Goyang', icon: '🦐' },
		{ value: 'cycle-breathe', label: '⟳ Siklus Bernapas', icon: '🫁' },
		{ value: 'cycle-bounce', label: '⟳ Siklus Memantul', icon: '🏀' }
	];

	const themeLabels: Record<string, string> = {
		default: 'Default',
		gradient: 'Gradient',
		minimal: 'Minimal',
		neon: 'Neon',
		tech: 'Teknologi'
	};

	const themeIcons: Record<string, string> = {
		default: '🎨',
		gradient: '🌈',
		minimal: '⚪',
		neon: '💡',
		tech: '⚡'
	};
</script>

<div class="space-y-6">
	<!-- Avatar Section -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60" for="avatar-input"><span>Foto Avatar</span></label>
		<div class="flex items-center gap-4">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					class="h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg"
					alt="Avatar"
				/>
			{:else}
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5 text-white/40"
				>
					<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					disabled={avatarUploading}
					class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => document.getElementById('avatar-input')?.click()}
				>
					{avatarUploading ? '⏳ Mengunggah...' : avatarUrl ? '📷 Ganti Foto' : '📤 Upload Foto'}
				</button>
				{#if avatarUrl}
					<button
						type="button"
						class="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/20"
						onclick={() => (avatarUrl = '')}
					>
						🗑 Hapus
					</button>
				{/if}
			</div>
			<input
				id="avatar-input"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="hidden"
				onchange={onAvatarUpload}
			/>
		</div>
		<p class="mt-2 text-[10px] text-white/40">Rekomendasi: Foto persegi 400x400px, maksimal 2MB</p>
	</div>

	<!-- Header Background Section -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60" for="header-input"><span>Background Header</span></label>
		<div class="space-y-3">
			{#if headerBg}
				<div
					class="h-32 w-full rounded-xl border border-white/20 shadow-lg"
					style={bgStyle}
				></div>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					disabled={headerUploading}
					class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => document.getElementById('header-input')?.click()}
				>
					{headerUploading ? '⏳ Mengunggah...' : headerBg ? '🖼 Ganti Background' : '📤 Upload Background'}
				</button>
				{#if headerBg}
					<button
						type="button"
						class="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/20"
						onclick={() => (headerBg = '')}
					>
						🗑 Hapus
					</button>
				{/if}
			</div>
			{#if bgParts}
				<div class="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-medium text-white/50">Atur Posisi & Zoom</span>
						<button
							type="button"
							class="text-[10px] text-white/40 transition hover:text-white/70"
							onclick={resetBgAdjust}
						>
							Reset
						</button>
					</div>
					<div>
						<div class="mb-1 flex justify-between text-[10px] text-white/40">
							<span>Horizontal</span>
							<span>{Math.round(bgParts.posX)}%</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							step="1"
							value={bgParts.posX}
							oninput={(e) => updateBgPos('x', Number(e.currentTarget.value))}
							class="w-full accent-violet-500"
						/>
					</div>
					<div>
						<div class="mb-1 flex justify-between text-[10px] text-white/40">
							<span>Vertikal</span>
							<span>{Math.round(bgParts.posY)}%</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							step="1"
							value={bgParts.posY}
							oninput={(e) => updateBgPos('y', Number(e.currentTarget.value))}
							class="w-full accent-violet-500"
						/>
					</div>
					<div>
						<div class="mb-1 flex justify-between text-[10px] text-white/40">
							<span>Zoom</span>
							<span>{Math.round(bgParts.zoom)}%</span>
						</div>
						<input
							type="range"
							min="100"
							max="400"
							step="5"
							value={bgParts.zoom}
							oninput={(e) => updateBgZoom(Number(e.currentTarget.value))}
							class="w-full accent-violet-500"
						/>
					</div>
				</div>
			{/if}
			<input
				id="header-input"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="hidden"
				onchange={onHeaderUpload}
			/>
		</div>
		<p class="mt-2 text-[10px] text-white/40">
			Apapun ukurannya otomatis dikecilkan backend. Atur posisi & zoom di atas. Bisa juga pakai CSS gradient seperti:
			linear-gradient(135deg, #667eea 0%, #764ba2 100%)
		</p>
	</div>

	<!-- Link Text Color -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60" for="linkTextColor">
			Warna Teks Link
		</label>
		<div class="flex items-center gap-3">
			<input
				id="linkTextColor"
				type="color"
				bind:value={linkTextColor}
				class="h-12 w-16 cursor-pointer rounded-xl border border-white/20 bg-white/5 p-1"
			/>
			<input
				type="text"
				bind:value={linkTextColor}
				placeholder="#111827"
				class="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white transition outline-none focus:border-violet-400/50"
			/>
			<button
				type="button"
				class="rounded-full border border-white/15 px-3 py-2 text-[11px] text-white/70 transition hover:border-white/40"
				onclick={() => (linkTextColor = '')}
			>
				Reset
			</button>
		</div>
		<p class="mt-2 text-[10px] text-white/40">Warna teks untuk label link di microsite</p>
	</div>

	<!-- Theme Selection -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60" for="step2-theme-button"><span>Tema</span></label>
		<div class="relative">
			<button
				id="step2-theme-button"
				type="button"
				class="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-white/30"
				onclick={() => {
					const dd = document.getElementById('theme-dropdown-step2');
					if (dd) dd.classList.toggle('hidden');
				}}
			>
				<span class="text-base">{themeIcons[theme] || '🎨'}</span>
				<span class="flex-1 text-left text-sm text-white">{themeLabels[theme] || theme}</span>
				<svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			<div
				id="theme-dropdown-step2"
				class="absolute left-0 z-50 mt-1 hidden max-h-60 w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
			>
				{#each themes as item (item)}
					<button
						type="button"
						class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition {theme ===
						item
							? 'bg-cyan-500/20 text-cyan-300'
							: 'text-white/70 hover:bg-white/10'}"
						onclick={() => {
							theme = item;
							document.getElementById('theme-dropdown-step2')?.classList.add('hidden');
						}}
					>
						<span class="text-base">{themeIcons[item] || '🎨'}</span>
						<span class="flex-1 text-left text-sm">{themeLabels[item] || item}</span>
						{#if theme === item}
							<svg
								class="ml-auto h-4 w-4 shrink-0 text-cyan-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Animation Selection -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60" for="step2-anim-button"><span>Animasi</span></label>
		<div class="relative">
			<button
				id="step2-anim-button"
				type="button"
				class="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-white/30"
				onclick={() => {
					const dropdown = document.getElementById('anim-dropdown-step2');
					if (dropdown) dropdown.classList.toggle('hidden');
				}}
			>
				<span class="text-base">
					{animations.find((a) => a.value === animation)?.icon ?? animations[0].icon}
				</span>
				<span class="flex-1 text-left text-sm text-white">
					{animations.find((a) => a.value === animation)?.label ?? animations[0].label}
				</span>
				<svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			<div
				id="anim-dropdown-step2"
				class="absolute left-0 z-50 mt-1 hidden max-h-60 w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
			>
				{#each animations as anim (anim.value)}
					<button
						type="button"
						class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition {animation ===
						anim.value
							? 'bg-cyan-500/20 text-cyan-300'
							: 'text-white/70 hover:bg-white/10'}"
						onclick={() => {
							animation = anim.value;
							document.getElementById('anim-dropdown-step2')?.classList.add('hidden');
						}}
					>
						<span class="text-base">{anim.icon}</span>
						<span class="text-sm">{anim.label}</span>
						{#if animation === anim.value}
							<svg
								class="ml-auto h-4 w-4 shrink-0 text-cyan-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<p class="mt-2 text-[10px] text-white/40">Efek animasi saat link muncul di microsite</p>
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
			<span class="text-xs font-medium text-cyan-300">Tips Desain</span>
		</div>
		<ul class="space-y-1 text-[11px] text-cyan-200/80">
			<li>• Pilih tema yang sesuai dengan brand identity Anda</li>
			<li>• Pastikan warna teks kontras dengan background untuk keterbacaan</li>
			<li>• Animasi yang subtle (fade/slide-up) lebih profesional</li>
		</ul>
	</div>
</div>
