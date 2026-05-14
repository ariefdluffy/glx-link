<script lang="ts">
	import type { MicrositeLink, IconOption } from '$lib/types/microsite.edit';
	import { animations } from '$lib/types/microsite.edit';
	import { slide } from 'svelte/transition';

	interface Props {
		links: MicrositeLink[];
		expandedIndex: number | null;
		draggedIndex: number | null;
		dragOverIndex: number | null;
		onaddlink: (
			type: 'link' | 'divider' | 'image' | 'text',
			preset?: { label?: string; icon?: string; url?: string }
		) => void;
		onaddtextlabel: () => void;
		onremovelink: (index: number) => void;
		ondragstart: (index: number) => void;
		ondragover: (e: DragEvent, index: number) => void;
		ondrop: (index: number) => void;
		ondragend: () => void;
		onmovelink: (index: number, direction: -1 | 1) => void;
		onduplicatelink: (index: number) => void;
		onlinkimageupload: (index: number, e: Event) => void;
		iconSvgPathFn: (name: string) => string | null;
		iconOptions: IconOption[];
		iconPreviewFn: (icon: string | null | undefined) => string | null;
	}

	let {
		links = $bindable(),
		expandedIndex = $bindable(),
		draggedIndex = $bindable(),
		dragOverIndex = $bindable(),
		onaddlink,
		onaddtextlabel,
		onremovelink,
		ondragstart,
		ondragover,
		ondrop,
		ondragend,
		onmovelink,
		onduplicatelink,
		onlinkimageupload,
		iconSvgPathFn,
		iconOptions,
		iconPreviewFn
	}: Props = $props();

	let searchQuery = $state('');
	let showIconDropdown = $state<number | null>(null);

	const filteredIcons = $derived(
		iconOptions.filter(
			(icon) =>
				icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				icon.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function handleIconSelect(index: number, iconName: string) {
		links[index].icon = iconName;
		showIconDropdown = null;
		searchQuery = '';
	}

	function toggleExpand(index: number) {
		expandedIndex = expandedIndex === index ? null : index;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-xs font-semibold text-white/60">Daftar Link</h3>
		<div class="flex gap-2">
			<button
				onclick={() => onaddlink('link')}
				class="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-violet-400/50 hover:bg-violet-500/10"
			>
				+ Link
			</button>
			<button
				onclick={onaddtextlabel}
				class="rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-violet-500/25"
			>
				+ Text
			</button>
		</div>
	</div>

	<div class="max-h-[300px] space-y-2 overflow-x-hidden overflow-y-auto pr-1 md:max-h-[500px]">
		{#if links.length === 0}
			<div class="rounded-2xl border border-dashed border-white/20 bg-white/5 py-10 text-center">
				<svg
					class="mx-auto mb-3 h-10 w-10 text-white/20"
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
				<p class="mt-1 text-xs text-white/30">Klik "+ Link" untuk menambah</p>
			</div>
		{:else}
			{#each links as link, index (index)}
				<div
					draggable="true"
					ondragstart={() => ondragstart(index)}
					ondragover={(e) => ondragover(e, index)}
					ondrop={() => ondrop(index)}
					{ondragend}
					class="group relative w-full max-w-full min-w-0 rounded-2xl border bg-white/5 transition-all duration-150 {draggedIndex ===
					index
						? 'opacity-50 ring-2 ring-violet-500/20'
						: ''} {dragOverIndex === index ? 'border-violet-500/50' : 'border-white/10'}"
				>
					<!-- Collapsed View -->
					<div
						class="flex min-w-0 cursor-pointer items-center gap-3 p-3"
						onclick={() => toggleExpand(index)}
					>
						<button
							onmousedown={() => ondragstart(index)}
							class="shrink-0 cursor-grab text-white/40 hover:text-white/70 active:cursor-grabbing"
							onclick={(e) => e.stopPropagation()}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-12a2 2 0 10.001 4.001A2 2 0 0013 2zm0 6a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z"
								/>
							</svg>
						</button>

						<span class="shrink-0 text-[10px] text-white/30">#{index + 1}</span>

						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5"
						>
							{#if link.icon && iconSvgPathFn(link.icon)}
								<img src={iconSvgPathFn(link.icon)} alt={link.icon} class="h-5 w-5" />
							{:else}
								<span class="text-base">{iconPreviewFn(link.icon) || '🔗'}</span>
							{/if}
						</div>

						<div class="min-w-0 flex-1 overflow-hidden">
							<p class="truncate text-sm font-medium text-white/80">
								{link.label ||
									(link.type === 'link'
										? 'Untitled Link'
										: link.type.charAt(0).toUpperCase() + link.type.slice(1))}
							</p>
							{#if link.url && link.type === 'link'}
								<p class="truncate text-[10px] text-white/40">{link.url}</p>
							{/if}
						</div>

						<div class="flex shrink-0 items-center gap-3">
							<div class="hidden flex-col gap-0.5 sm:flex">
								{#if index > 0}
									<button
										onclick={(e) => {
											e.stopPropagation();
											onmovelink(index, -1);
										}}
										class="rounded-lg p-0.5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									</button>
								{/if}
								{#if index < links.length - 1}
									<button
										onclick={(e) => {
											e.stopPropagation();
											onmovelink(index, 1);
										}}
										class="rounded-lg p-0.5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									</button>
								{/if}
							</div>
							<button
								onclick={(e) => {
									e.stopPropagation();
									onduplicatelink(index);
								}}
								class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-cyan-400"
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
								class="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
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

					<!-- Expanded View -->
					{#if expandedIndex === index}
						<div transition:slide class="space-y-4 border-t border-white/10 p-4">
							<!-- Type Selector -->
							<div class="flex gap-2">
								{#each ['link', 'text', 'divider', 'image'] as type}
									<button
										onclick={() => (links[index].type = type as any)}
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
									<div class="space-y-1">
										<label
											for="link-label-{index}"
											class="text-[10px] font-semibold text-white/40 uppercase">Label</label
										>
										<input
											id="link-label-{index}"
											type="text"
											bind:value={link.label}
											placeholder="Nama Link"
											class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
										/>
									</div>
									<div class="relative space-y-1">
										<label class="text-[10px] font-semibold text-white/40 uppercase">Icon</label>
										<button
											onclick={() => (showIconDropdown = showIconDropdown === index ? null : index)}
											class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white hover:border-white/30"
										>
											<div class="flex items-center gap-2">
												<div class="flex h-5 w-5 items-center justify-center">
													{#if link.icon && iconSvgPathFn(link.icon)}
														<img
															src={iconSvgPathFn(link.icon)}
															alt={link.icon}
															class="h-full w-full"
														/>
													{:else}
														<span>{iconPreviewFn(link.icon) || '🔗'}</span>
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

										{#if showIconDropdown === index}
											<div
												class="absolute right-0 left-0 z-50 mt-1 rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
											>
												<input
													type="text"
													bind:value={searchQuery}
													placeholder="Cari icon..."
													class="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
												/>
												<div class="grid max-h-48 grid-cols-5 gap-1 overflow-y-auto">
													{#each filteredIcons as icon}
														<button
															onclick={() => handleIconSelect(index, icon.name)}
															class="flex aspect-square flex-col items-center justify-center rounded-lg transition hover:bg-white/10 {link.icon ===
															icon.name
																? 'bg-violet-500/20 ring-1 ring-violet-500/50'
																: ''}"
															title={icon.label}
														>
															{#if icon.svg}
																<img src={icon.svg} alt={icon.label} class="h-5 w-5" />
															{:else}
																<span class="text-lg">{icon.display}</span>
															{/if}
														</button>
													{/each}
												</div>
											</div>
										{/if}
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
											class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition outline-none focus:border-violet-400/50"
										/>
									</div>
									<div class="flex flex-wrap gap-4">
										<div class="flex-1 space-y-1">
											<label class="text-[10px] font-semibold text-white/40 uppercase"
												>Alignment</label
											>
											<div class="flex gap-1">
												{#each ['left', 'center', 'right'] as align}
													<button
														onclick={() => (links[index].alignment = align as any)}
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
											accept="image/jpeg,image/png,image/jpg"
											class="hidden"
											onchange={(e) => onlinkimageupload(index, e)}
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
									{#each ['', 'fade', 'slide-up', 'scale', 'bounce', 'flip', 'zoom'] as anim}
										<button
											onclick={() => (link.animation = anim)}
											class="rounded px-2 py-1 text-[10px] transition {(link.animation || '') ===
											anim
												? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
												: 'text-white/40 hover:text-white/60'}"
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
											onclick={() => (link.animation = anim)}
											class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') ===
											anim
												? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
												: 'text-white/40 hover:text-white/60'}"
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
											onclick={() => (link.animation = anim)}
											class="rounded px-2 py-1 text-[9px] transition {(link.animation || '') ===
											anim
												? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-300'
												: 'text-white/40 hover:text-white/60'}"
										>
											{anim.replace('cycle-', '')}
										</button>
									{/each}
								</div>
							</div>

							<div class="flex justify-end pt-2">
								<button
									onclick={() => onremovelink(index)}
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

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.max-h-\[300px\]::-webkit-scrollbar,
	.md\:max-h-\[500px\]::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.max-h-\[300px\],
	.md\:max-h-\[500px\] {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
