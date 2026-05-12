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
		links = $bindable([]),
		onAddLink = () => {},
		onRemoveLink = () => {},
		onMoveLink = () => {},
		onDragStart = () => {},
		onDragOver = () => {},
		onDrop = () => {},
		onDragEnd = () => {},
		onLinkImageUpload = async () => {},
		dragOverIndex = null
	} = $props<{
		links: MicrositeLink[];
		onAddLink?: (type: string) => void;
		onRemoveLink?: (index: number) => void;
		onMoveLink?: (index: number, direction: -1 | 1) => void;
		onDragStart?: (index: number) => void;
		onDragOver?: (e: DragEvent, index: number) => void;
		onDrop?: (index: number) => void;
		onDragEnd?: () => void;
		onLinkImageUpload?: (index: number, e: Event) => Promise<void>;
		dragOverIndex?: number | null;
	}>();

	const addTextLabel = () => {
		onAddLink('text');
	};

	interface IconOption {
		name: string;
		label: string;
		display: string;
		svg?: string;
	}

	const iconSvgPath = (name: string): string | null => {
		const svgIcons = [
			'youtube',
			'instagram',
			'twitter',
			'x',
			'facebook',
			'website',
			'globe',
			'web',
			'github',
			'tiktok',
			'linkedin',
			'spotify',
			'telegram',
			'whatsapp',
			'email',
			'discord',
			'store',
			'shop',
			'link'
		];
		const key = name.toLowerCase().trim();
		if (key === 'twitter' || key === 'x') return '/icons/social/x.svg';
		if (key === 'website' || key === 'globe' || key === 'web') return '/icons/social/website.svg';
		if (svgIcons.includes(key)) return `/icons/social/${key}.svg`;
		return null;
	};

	const iconOptions: IconOption[] = [
		{ name: 'globe', label: 'Globe', display: '🌐', svg: '/icons/social/globe.svg' },
		{ name: 'instagram', label: 'Instagram', display: '📸', svg: '/icons/social/instagram.svg' },
		{ name: 'tiktok', label: 'TikTok', display: '🎵', svg: '/icons/social/tiktok.svg' },
		{ name: 'twitter', label: 'Twitter', display: '🐦', svg: '/icons/social/x.svg' },
		{ name: 'youtube', label: 'YouTube', display: '▶️', svg: '/icons/social/youtube.svg' },
		{ name: 'github', label: 'GitHub', display: '🐙', svg: '/icons/social/github.svg' },
		{ name: 'linkedin', label: 'LinkedIn', display: '💼', svg: '/icons/social/linkedin.svg' },
		{ name: 'facebook', label: 'Facebook', display: '👍', svg: '/icons/social/facebook.svg' },
		{ name: 'telegram', label: 'Telegram', display: '✈️', svg: '/icons/social/telegram.svg' },
		{ name: 'whatsapp', label: 'WhatsApp', display: '💬', svg: '/icons/social/whatsapp.svg' },
		{ name: 'email', label: 'Email', display: '✉️', svg: '/icons/social/email.svg' },
		{ name: 'discord', label: 'Discord', display: '🎮', svg: '/icons/social/discord.svg' },
		{ name: 'shop', label: 'Shop', display: '🛍️', svg: '/icons/social/store.svg' },
		{ name: 'store', label: 'Store', display: '🏪', svg: '/icons/social/store.svg' },
		{ name: 'link', label: 'Link', display: '🔗', svg: '/icons/social/link.svg' },
		{ name: 'web', label: 'Web', display: '🌍', svg: '/icons/social/website.svg' },
		{ name: 'spotify', label: 'Spotify', display: '🟢', svg: '/icons/social/spotify.svg' },
		{ name: 'snapchat', label: 'Snapchat', display: '👻' },
		{ name: 'pinterest', label: 'Pinterest', display: '📌' },
		{ name: 'twitch', label: 'Twitch', display: '🎮' },
		{ name: 'threads', label: 'Threads', display: '🧵' },
		{ name: 'linktree', label: 'Linktree', display: '🌳' }
	];

	const iconPreview = (icon: string | null | undefined) => {
		if (!icon) return '—';
		const key = icon.toLowerCase().trim();
		const found = iconOptions.find((o) => o.name === key);
		if (found?.svg) return null;
		return found?.display ?? icon.slice(0, 2);
	};
</script>

<div class="space-y-6">
	<!-- Custom Links Section -->
	<div>
		<div class="mb-3 flex items-center justify-between">
			<label class="text-xs font-medium text-white/60">Daftar Link Custom</label>
			<div class="flex gap-2">
				<button
					type="button"
					class="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10"
					onclick={() => onAddLink('link')}
				>
					+ Link
				</button>
				<button
					type="button"
					class="rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-violet-500/25"
					onclick={addTextLabel}
				>
					+ Text
				</button>
			</div>
		</div>

		<!-- Links List -->
		<div class="max-h-[650px] space-y-3 overflow-y-auto pr-1">
			{#if links.length === 0}
				<div class="rounded-2xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
					<svg
						class="mx-auto mb-3 h-12 w-12 text-white/20"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						/>
					</svg>
					<p class="text-sm text-white/40">Belum ada link</p>
					<p class="mt-1 text-xs text-white/30">Klik tombol "+ Link" untuk menambah</p>
				</div>
			{:else}
				{#each links as link, index (index)}
					<div
						class="space-y-3 rounded-2xl border bg-white/5 p-4 transition-all duration-150 {dragOverIndex ===
						index
							? 'border-violet-500/50 ring-2 ring-violet-500/20'
							: 'border-white/10'}"
						draggable="true"
						ondragstart={() => onDragStart(index)}
						ondragover={(e) => onDragOver(e, index)}
						ondrop={() => onDrop(index)}
						ondragend={onDragEnd}
					>
						<!-- Header: Drag Handle + Controls -->
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<button
									type="button"
									class="cursor-grab text-white/40 transition hover:text-white/70 active:cursor-grabbing"
									title="Seret untuk urutkan"
								>
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 8h16M4 16h16"
										/>
									</svg>
								</button>
								<span class="text-xs text-white/30">#{index + 1}</span>
							</div>
							<div class="flex items-center gap-1">
								<button
									type="button"
									class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70 disabled:opacity-30"
									disabled={index === 0}
									onclick={() => onMoveLink(index, -1)}
									title="Pindah ke atas"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 15l7-7 7 7"
										/>
									</svg>
								</button>
								<button
									type="button"
									class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70 disabled:opacity-30"
									disabled={index === links.length - 1}
									onclick={() => onMoveLink(index, 1)}
									title="Pindah ke bawah"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
							</div>
						</div>

						<!-- Type Selector -->
						<div class="flex gap-2">
							{#each ['link', 'text', 'divider', 'image'] as t (t)}
								<button
									type="button"
									class="rounded-lg px-3 py-1.5 text-xs transition-all {(link.type || 'link') === t
										? 'border border-violet-400 bg-violet-500/30 text-white'
										: 'border border-white/10 bg-white/5 text-white/50 hover:border-white/30'}"
									onclick={() => (links[index].type = t)}
								>
									{t === 'link'
										? '🔗 Link'
										: t === 'text'
											? '📝 Text'
											: t === 'image'
												? '🖼 Image'
												: '➖ Divider'}
								</button>
							{/each}
						</div>

						<!-- Content based on type -->
						{#if link.type === 'link'}
							<div class="space-y-2">
								<div class="grid grid-cols-2 gap-2">
									<input
										placeholder="Label"
										bind:value={link.label}
										class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
									/>
									<!-- Icon Dropdown -->
									<div class="relative">
										<button
											type="button"
											class="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:border-white/30"
											onclick={() => {
												document.getElementById('icon-picker-' + index)?.classList.toggle('hidden');
											}}
										>
											<span class="shrink-0">
												{#if iconSvgPath(link.icon)}
													<img src={iconSvgPath(link.icon)} alt={link.icon} class="h-5 w-5" />
												{:else}
													{iconPreview(link.icon) ?? '—'}
												{/if}
											</span>
											<span class="flex-1 text-left text-white/60"
												>{link.icon || 'Pilih icon...'}</span
											>
											<svg
												class="h-3 w-3 text-white/40"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</button>
										<div
											id="icon-picker-{index}"
											class="absolute right-0 z-50 mt-1 hidden w-72 rounded-2xl border border-white/10 bg-zinc-900 p-3 shadow-2xl"
										>
											<div class="mb-2 text-[10px] font-medium text-white/40">Pilih Icon</div>
											<div class="mb-2">
												<input
													type="text"
													placeholder="Cari..."
													class="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
													oninput={(e) => {
														const val = (e.target as HTMLInputElement).value.toLowerCase();
														const p = (e.target as HTMLElement).closest('.absolute');
														if (!p) return;
														p.querySelectorAll('[data-i]').forEach((el) => {
															el.classList.toggle(
																'hidden',
																!!(val && !(el.getAttribute('data-n') || '').includes(val))
															);
														});
													}}
												/>
											</div>
											<div class="grid grid-cols-5 gap-1">
												<button
													type="button"
													data-i
													data-n=""
													class="flex aspect-square items-center justify-center rounded-lg border border-white/10 text-xs text-white/40 transition hover:border-white/30 hover:bg-white/10 {!link.icon
														? 'border-violet-400 bg-violet-500/20'
														: ''}"
													onclick={() => {
														link.icon = '';
														document
															.getElementById('icon-picker-' + index)
															?.classList.add('hidden');
													}}
													title="Tanpa icon">—</button
												>
												{#each iconOptions as opt (opt.name)}
													<button
														type="button"
														data-i
														data-n={opt.name}
														class="flex aspect-square items-center justify-center rounded-lg border text-sm transition {link.icon ===
														opt.name
															? 'border-violet-400 bg-violet-500/20'
															: 'border-white/10 hover:border-white/30 hover:bg-white/10'}"
														onclick={() => {
															link.icon = opt.name;
															document
																.getElementById('icon-picker-' + index)
																?.classList.add('hidden');
														}}
														title={opt.label}
														>{#if opt.svg}
															<img src={opt.svg} alt={opt.name} class="h-5 w-5" />
														{:else}
															{opt.display}
														{/if}</button
													>
												{/each}
											</div>
										</div>
									</div>
								</div>
								<input
									placeholder="https://example.com"
									bind:value={link.url}
									class="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/5 px-3 py-2.5 text-xs text-white placeholder-cyan-200/50 transition outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.15)]"
								/>
								<div class="flex items-center gap-2">
									<label class="text-[10px] text-white/40">Font Size:</label>
									<input
										type="number"
										min="8"
										max="32"
										bind:value={link.fontSize}
										class="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
									/>
									<span class="text-[10px] text-white/40">px</span>
								</div>
							</div>
						{:else if link.type === 'text'}
							<div class="space-y-2">
								<input
									placeholder="Teks Label"
									bind:value={link.label}
									class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
								/>
								<div class="flex items-center gap-2">
									<span class="text-[10px] text-white/40">Alignment:</span>
									<button
										type="button"
										class="rounded-lg border px-2 py-1 text-[10px] transition {link.alignment ===
										'left'
											? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
											: 'border-white/10 text-white/60 hover:border-white/30'}"
										onclick={() => (links[index].alignment = 'left')}
									>
										← Kiri
									</button>
									<button
										type="button"
										class="rounded-lg border px-2 py-1 text-[10px] transition {link.alignment ===
										'center'
											? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
											: 'border-white/10 text-white/60 hover:border-white/30'}"
										onclick={() => (links[index].alignment = 'center')}
									>
										↔ Tengah
									</button>
									<button
										type="button"
										class="rounded-lg border px-2 py-1 text-[10px] transition {link.alignment ===
										'right'
											? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
											: 'border-white/10 text-white/60 hover:border-white/30'}"
										onclick={() => (links[index].alignment = 'right')}
									>
										Kanan →
									</button>
								</div>
								<div class="flex items-center gap-2">
									<label class="text-[10px] text-white/40">Font Size:</label>
									<input
										type="number"
										min="8"
										max="32"
										bind:value={link.fontSize}
										class="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
									/>
									<span class="text-[10px] text-white/40">px</span>
								</div>
							</div>
						{:else if link.type === 'image'}
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									{#if link.url}
										<img
											src={link.url}
											class="h-12 w-12 shrink-0 rounded-lg border border-white/10 object-cover"
											alt=""
										/>
									{/if}
									<button
										type="button"
										class="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 transition hover:border-white/40"
										onclick={() => document.getElementById('link-img-' + index)?.click()}
									>
										{link.url ? '🖼 Ganti' : '📤 Upload Gambar'}
									</button>
									<input
										id="link-img-{index}"
										type="file"
										accept="image/*"
										class="hidden"
										onchange={(e) => onLinkImageUpload(index, e)}
									/>
									{#if link.url}
										<button
											type="button"
											class="text-xs text-red-400 transition hover:text-red-300"
											onclick={() => (links[index].url = '')}>Hapus</button
										>
									{/if}
								</div>
								<input
									placeholder="Caption (opsional)"
									bind:value={link.caption}
									class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
								/>
							</div>
						{:else if link.type === 'divider'}
							<div class="py-2 text-center text-xs text-white/40">
								<div class="mx-auto h-px w-full bg-white/20"></div>
								<p class="mt-2">Garis pemisah</p>
							</div>
						{/if}

						<!-- Animation Picker -->
						<div class="flex flex-wrap gap-1">
							{#each ['', 'fade', 'slide-up', 'scale', 'bounce', 'flip', 'zoom'] as anim (anim)}
								<button
									type="button"
									class="rounded px-2 py-1 text-[10px] transition {(link.animation || '') === anim
										? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
										: 'text-white/40 hover:text-white/60'}"
									onclick={() => (links[index].animation = anim || '')}
								>
									{anim || 'default'}
								</button>
							{/each}
						</div>

						<!-- Continuous Animations (looping) -->
						<div class="mt-1 flex flex-wrap gap-1">
							<span class="mr-1 self-center text-[9px] text-white/30">▶ terus:</span>
							{#each ['continuous-float', 'continuous-pulse', 'continuous-wiggle', 'continuous-breathe', 'continuous-shake', 'continuous-bounce'] as anim (anim)}
								<button
									type="button"
									class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') === anim
										? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
										: 'text-white/40 hover:text-white/60'}"
									onclick={() => (links[index].animation = anim || '')}
								>
									{anim.replace('continuous-', '')}
								</button>
							{/each}
						</div>

						<!-- Cycle Animations (1min on / 1min off) -->
						<div class="mt-1 flex flex-wrap gap-1">
							<span class="mr-1 self-center text-[9px] text-white/30">⟳ siklus:</span>
							{#each ['cycle-float', 'cycle-pulse', 'cycle-wiggle', 'cycle-breathe', 'cycle-bounce'] as anim (anim)}
								<button
									type="button"
									class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') === anim
										? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
										: 'text-white/40 hover:text-white/60'}"
									onclick={() => (links[index].animation = anim || '')}
								>
									{anim.replace('cycle-', '')}
								</button>
							{/each}
						</div>

						<!-- Delete Button -->
						<button
							type="button"
							class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
							onclick={() => onRemoveLink(index)}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Hapus Link
						</button>
					</div>
				{/each}
			{/if}
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
			<span class="text-xs font-medium text-cyan-300">Tips Link</span>
		</div>
		<ul class="space-y-1 text-[11px] text-cyan-200/80">
			<li>• Urutkan link berdasarkan prioritas (paling penting di atas)</li>
			<li>• Gunakan emoji sebagai icon untuk tampilan lebih menarik</li>
			<li>• Text/Label bisa digunakan untuk judul section atau keterangan</li>
			<li>• Divider membantu memisahkan grup link yang berbeda</li>
		</ul>
	</div>
</div>
