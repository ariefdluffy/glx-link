<script lang="ts">
	let {
		avatarUrl = $bindable(''),
		headerBg = $bindable(''),
		linkTextColor = $bindable(''),
		theme = $bindable('default'),
		animation = $bindable('fade'),
		themes = ['default', 'gradient', 'minimal', 'neon', 'tech'],
		animations = [
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
		],
		links = [],
		expandedIndex = $bindable(null),
		onavatarupload = (e: Event) => {},
		onheaderupload = (e: Event) => {},
		onlinkanimationchange = (index: number, anim: string) => {}
	} = $props<{
		avatarUrl: string;
		headerBg: string;
		linkTextColor: string;
		theme: string;
		animation: string;
		themes: string[];
		animations: { value: string; label: string; icon: string }[];
		links: { animation: string }[];
		expandedIndex: number | null;
		onavatarupload: (e: Event) => void;
		onheaderupload: (e: Event) => void;
		onlinkanimationchange: (index: number, anim: string) => void;
	}>();

	let animDropdownOpen = $state(false);
	let themeDropdownOpen = $state(false);

	let animDropdownEl = $state<HTMLDivElement | null>(null);
	let themeDropdownEl = $state<HTMLDivElement | null>(null);

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

	$effect(() => {
		if (!animDropdownOpen && !themeDropdownOpen) return;

		function handleClickOutside(e: MouseEvent) {
			if (animDropdownEl && !animDropdownEl.contains(e.target as Node)) {
				animDropdownOpen = false;
			}
			if (themeDropdownEl && !themeDropdownEl.contains(e.target as Node)) {
				themeDropdownOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function toggleAnimDropdown() {
		animDropdownOpen = !animDropdownOpen;
		themeDropdownOpen = false;
	}

	function toggleThemeDropdown() {
		themeDropdownOpen = !themeDropdownOpen;
		animDropdownOpen = false;
	}

	function selectAnim(value: string) {
		animation = value;
		animDropdownOpen = false;
	}

	function selectTheme(value: string) {
		theme = value;
		themeDropdownOpen = false;
	}
</script>

<div class="space-y-6">
	<!-- Avatar Section -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60">Foto Profil</label>
		<div class="flex items-center gap-4">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					class="h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg"
					alt="Avatar"
				/>
			{:else}
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-lg font-bold text-white shadow-lg"
				></div>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10"
					onclick={() => document.getElementById('appearance-avatar-input')?.click()}
				>
					📤 Upload Foto
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
				id="appearance-avatar-input"
				type="file"
				accept="image/jpeg,image/png,image/jpg"
				class="hidden"
				onchange={onavatarupload}
			/>
		</div>
	</div>

	<!-- Header Background Section -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60">Background Header</label>
		<div class="space-y-3">
			{#if headerBg}
				<div
					class="h-32 w-full rounded-xl border border-white/20 shadow-lg"
					style="background: {headerBg}; background-size: cover; background-position: center;"
				></div>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10"
					onclick={() => document.getElementById('appearance-header-input')?.click()}
				>
					📤 Upload Background
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
			<input
				id="appearance-header-input"
				type="file"
				accept="image/jpeg,image/png,image/jpg"
				class="hidden"
				onchange={onheaderupload}
			/>
			<p class="text-[10px] text-white/40">Rekomendasi ukuran: 1200x400px</p>
		</div>
	</div>

	<!-- Link Text Color -->
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

	<!-- Theme Selector -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60">Tema</label>
		<div class="relative" bind:this={themeDropdownEl}>
			<button
				type="button"
				class="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-white/30"
				onclick={toggleThemeDropdown}
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
			{#if themeDropdownOpen}
				<div
					class="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
				>
					{#each themes as item (item)}
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition {theme ===
							item
								? 'bg-cyan-500/20 text-cyan-300'
								: 'text-white/70 hover:bg-white/10'}"
							onclick={() => selectTheme(item)}
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
			{/if}
		</div>
	</div>

	<!-- Animation Selector -->
	<div>
		<label class="mb-3 block text-xs font-medium text-white/60">Animasi Default</label>
		<div class="relative" bind:this={animDropdownEl}>
			<button
				type="button"
				class="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-white/30"
				onclick={toggleAnimDropdown}
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
			{#if animDropdownOpen}
				<div
					class="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
				>
					{#each animations as anim (anim.value)}
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition {animation ===
							anim.value
								? 'bg-cyan-500/20 text-cyan-300'
								: 'text-white/70 hover:bg-white/10'}"
							onclick={() => selectAnim(anim.value)}
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
			{/if}
		</div>
	</div>
</div>
