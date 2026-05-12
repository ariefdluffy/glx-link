<script>
	let {
		facebookUrl = $bindable(''),
		instagramUrl = $bindable(''),
		youtubeUrl = $bindable(''),
		websiteUrl = $bindable('')
	} = $props();
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<p class="mb-3 text-xs font-semibold text-white/60">Sosial Media</p>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div class="flex items-center gap-2">
			<img src="/icons/social/facebook.svg" alt="Facebook" class="h-4 w-4 shrink-0" />
			<input
				type="url"
				bind:value={facebookUrl}
				placeholder="https://facebook.com/..."
				class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<img src="/icons/social/instagram.svg" alt="Instagram" class="h-4 w-4 shrink-0" />
			<input
				type="url"
				bind:value={instagramUrl}
				placeholder="https://instagram.com/..."
				class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<img src="/icons/social/youtube.svg" alt="YouTube" class="h-4 w-4 shrink-0" />
			<input
				type="url"
				bind:value={youtubeUrl}
				placeholder="https://youtube.com/..."
				class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<img src="/icons/social/website.svg" alt="Website" class="h-4 w-4 shrink-0" />
			<input
				type="url"
				bind:value={websiteUrl}
				placeholder="https://..."
				class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
			/>
		</div>
	</div>
</div>
