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
		isHidden?: boolean;
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
		onDuplicateLink = () => {},
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
		onDuplicateLink?: (index: number) => void;
		dragOverIndex?: number | null;
	}>();

	let expandedIndex = $state(-1);

	function toggleExpand(index: number) {
		expandedIndex = expandedIndex === index ? -1 : index;
	}

	const addTextLabel = () => {
		onAddLink('text');
	};

	const toggleHidden = (index: number) => {
		links[index].isHidden = !(links[index].isHidden === true);
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

<div class="max-w-full min-w-0 space-y-6">
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
		<div class="max-h-[650px] space-y-3 overflow-x-hidden overflow-y-auto pr-1">
			{#if links.length === 0}
				<div class="rounded-2xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
					<svg
						class="mx-auto mb-3 h-12 w-12 text-white/20"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 28 28"
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
						class="w-full max-w-full min-w-0 space-y-3 rounded-2xl border bg-white/5 p-4 transition-all duration-150 {dragOverIndex ===
						index
							? 'border-violet-500/50 ring-2 ring-violet-500/20'
							: 'border-white/10'} {link.isHidden ? 'opacity-70' : ''}"
						draggable="true"
						ondragstart={() => onDragStart(index)}
						ondragover={(e) => onDragOver(e, index)}
						ondrop={() => onDrop(index)}
						ondragend={onDragEnd}
					>
						<!-- Header: Collapsed View (clickable to expand) -->
						<div
							class="flex min-w-0 cursor-pointer items-center justify-between gap-2"
							onclick={() => toggleExpand(index)}
						>
							<div class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
								<button
									type="button"
									class="cursor-grab text-white/40 transition hover:text-white/70 active:cursor-grabbing"
									title="Seret untuk urutkan"
									onclick={(e) => e.stopPropagation()}
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
								{#if link.icon && iconSvgPath(link.icon)}
									<img src={iconSvgPath(link.icon)} alt={link.icon} class="h-5 w-5 shrink-0" />
								{/if}
								<div class="min-w-0 flex-1 truncate text-sm text-white/80" title={link.label}>
									{(link.label || 'Untitled Link').slice(0, 20)}{(link.label || '').length > 35
										? '...'
										: ''}
								</div>
								{#if link.isHidden}
									<span
										class="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300"
									>
										Hidden
									</span>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<button
									type="button"
									class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70 disabled:opacity-30"
									disabled={index === 0}
									onclick={(e) => {
										e.stopPropagation();
										onMoveLink(index, -1);
									}}
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
									onclick={(e) => {
										e.stopPropagation();
										onMoveLink(index, 1);
									}}
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
								<button
									type="button"
									class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-amber-300"
									onclick={(e) => {
										e.stopPropagation();
										toggleHidden(index);
									}}
									title={link.isHidden ? 'Unhide' : 'Hide'}
								>
									{#if link.isHidden}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.79.47-3.47 1.292-4.924m2.122-2.122A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.5-.33 2.924-.924 4.202M15 12a3 3 0 10-4.243-4.243M3 3l18 18"
											/>
										</svg>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
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
									{/if}
								</button>
								<button
									type="button"
									class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-cyan-400"
									onclick={(e) => {
										e.stopPropagation();
										onDuplicateLink(index);
									}}
									title="Duplikat"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
										/>
									</svg>
								</button>
								<button
									type="button"
									class="rounded-lg p-1.5 transition {expandedIndex === index
										? 'text-white/70'
										: 'text-white/40 hover:bg-white/10 hover:text-white/70'}"
									onclick={(e) => {
										e.stopPropagation();
										toggleExpand(index);
									}}
								>
									<svg
										class="h-4 w-4 transition {expandedIndex === index ? 'rotate-180' : ''}"
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
							</div>
						</div>

						{#if expandedIndex === index}
							<div class="space-y-4 border-t border-white/10 p-4">
								<!-- Type Selector -->
								<div class="flex gap-2">
									{#each ['link', 'text', 'divider', 'image'] as type (type)}
										<button
											onclick={() =>
												(links[index].type = type as 'link' | 'text' | 'divider' | 'image')}
											class="rounded-lg px-3 py-1.5 text-xs transition-all {link.type === type
												? 'border border-violet-400 bg-violet-500/30 text-white'
												: 'border border-white/10 bg-white/5 text-white/50 hover:border-white/30'}"
										>
											{type === 'link'
												? '🔗 Link'
												: type === 'text'
													? '📝 Text'
													: type === 'image'
														? '🖼 Image'
														: '➖ Divider'}
										</button>
									{/each}
								</div>

								{#if link.type === 'link'}
									<div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
										<div class="min-w-0 space-y-1">
											<label
												for="link-label-{index}"
												class="text-[10px] font-semibold text-white/40 uppercase">Label</label
											>
											<input
												id="link-label-{index}"
												type="text"
												bind:value={link.label}
												maxlength="200"
												placeholder="Nama Link"
												class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
											/>
										</div>
										<div class="relative space-y-1">
											<label class="text-[10px] font-semibold text-white/40 uppercase">Icon</label>
											<button
												type="button"
												class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white hover:border-white/30"
												onclick={() => {
													document
														.getElementById('icon-picker-' + index)
														?.classList.toggle('hidden');
												}}
											>
												<div class="flex items-center gap-2">
													<div class="flex h-5 w-5 items-center justify-center">
														{#if iconSvgPath(link.icon)}
															<img
																src={iconSvgPath(link.icon)}
																alt={link.icon}
																class="h-full w-full"
															/>
														{:else}
															<span>{iconPreview(link.icon) || '🔗'}</span>
														{/if}
													</div>
													<span class="text-white/60"
														>{iconOptions.find((i) => i.name === link.icon)?.label ||
															'Pilih Icon'}</span
													>
												</div>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4 text-white/40"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
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
										<div class="col-span-full min-w-0 space-y-1">
											<label
												for="link-url-{index}"
												class="text-[10px] font-semibold text-white/40 uppercase">URL</label
											>
											<input
												id="link-url-{index}"
												type="url"
												bind:value={link.url}
												placeholder="https://..."
												class="w-full min-w-0 rounded-xl border border-cyan-400/40 bg-cyan-500/5 px-3 py-2 text-xs text-white placeholder-cyan-200/50 transition outline-none focus:border-cyan-400"
											/>
										</div>
										<div class="col-span-full min-w-0 space-y-1">
											<label
												for="link-caption-{index}"
												class="text-[10px] font-semibold text-white/40 uppercase"
												>Caption (Opsional)</label
											>
											<input
												id="link-caption-{index}"
												type="text"
												bind:value={link.caption}
												maxlength="200"
												placeholder="Keterangan singkat"
												class="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
											/>
										</div>
									</div>

									<div class="flex items-center gap-2 pt-2">
										<label class="text-[10px] text-white/40 uppercase">Font Size:</label>
										<input
											type="number"
											min="8"
											max="32"
											bind:value={link.fontSize}
											class="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
										/>
										<span class="text-[10px] text-white/40">px</span>
									</div>
								{:else if link.type === 'text'}
									<div class="space-y-3">
										<div class="space-y-1">
											<label
												for="text-label-{index}"
												class="text-[10px] font-semibold text-white/40 uppercase">Teks</label
											>
											<input
												id="text-label-{index}"
												type="text"
												bind:value={link.label}
												placeholder="Masukkan teks di sini..."
												maxlength="200"
												class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
											/>
										</div>
										<div class="flex flex-wrap gap-4">
											<div class="flex-1 space-y-1">
												<label class="text-[10px] font-semibold text-white/40 uppercase"
													>Alignment</label
												>
												<div class="flex gap-1">
													{#each ['left', 'center', 'right'] as align (align)}
														<button
															type="button"
															onclick={() =>
																(links[index].alignment = align as 'left' | 'center' | 'right')}
															class="rounded-lg border px-3 py-1.5 text-[10px] transition {link.alignment ===
															align
																? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300'
																: 'border-white/10 text-white/60 hover:border-white/30'}"
														>
															{align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
														</button>
													{/each}
												</div>
											</div>
											<div class="flex items-center gap-2 pt-4">
												<label class="text-[10px] text-white/40 uppercase">Font Size:</label>
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
									</div>
								{:else if link.type === 'image'}
									<div class="space-y-3">
										<div
											class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-4"
										>
											{#if link.url}
												<div class="group relative mb-2">
													<img
														src={link.url}
														alt="Preview"
														class="h-32 w-auto rounded-lg shadow-sm"
													/>
													<button
														type="button"
														onclick={() => (link.url = '')}
														class="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-4 w-4"
															viewBox="0 0 20 20"
															fill="currentColor"
														>
															<path
																fill-rule="evenodd"
																d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
																clip-rule="evenodd"
															/>
														</svg>
													</button>
												</div>
											{/if}
											<button
												type="button"
												class="rounded-xl border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
												onclick={() => document.getElementById('link-img-' + index)?.click()}
											>
												{link.url ? '🖼 Ganti Gambar' : '📤 Upload Gambar'}
											</button>
											<input
												id="link-img-{index}"
												type="file"
												accept="image/*"
												class="hidden"
												onchange={(e) => onLinkImageUpload(index, e)}
											/>
										</div>
										<div class="space-y-1">
											<label
												for="image-caption-{index}"
												class="text-[10px] font-semibold text-white/40 uppercase">Caption</label
											>
											<input
												id="image-caption-{index}"
												type="text"
												bind:value={link.caption}
												placeholder="Keterangan gambar"
												maxlength="200"
												class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
											/>
										</div>
									</div>
								{:else if link.type === 'divider'}
									<div
										class="flex h-20 items-center justify-center rounded-xl border border-white/10 bg-white/5"
									>
										<div class="relative h-px w-2/3 bg-white/20">
											<span
												class="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#121212] px-2 text-[10px] font-bold tracking-widest text-white/40 uppercase"
												>Divider</span
											>
										</div>
									</div>
								{/if}

								<!-- Animation Selector -->
								<div class="space-y-1">
									<label class="text-[10px] font-semibold text-white/40 uppercase">Animasi</label>
									<div class="flex flex-wrap gap-1">
										{#each ['', 'fade', 'slide-up', 'scale', 'bounce', 'flip', 'zoom'] as anim (anim)}
											<button
												type="button"
												class="rounded px-2 py-1 text-[10px] transition {(link.animation || '') ===
												anim
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
												class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') ===
												anim
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
												class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') ===
												anim
													? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
													: 'text-white/40 hover:text-white/60'}"
												onclick={() => (links[index].animation = anim || '')}
											>
												{anim.replace('cycle-', '')}
											</button>
										{/each}
									</div>
								</div>

								<div class="flex justify-end pt-2">
									<button
										type="button"
										onclick={() => onRemoveLink(index)}
										class="flex items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
												clip-rule="evenodd"
											/>
										</svg>
										Hapus Item
									</button>
								</div>
							</div>
						{/if}
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
