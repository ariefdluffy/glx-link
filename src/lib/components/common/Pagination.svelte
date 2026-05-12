<script lang="ts">
	import { getPaginationRange } from '$lib/utils/pagination.util';

	type Props = {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};

	let { currentPage, totalPages, onPageChange }: Props = $props();

	const pageRange = $derived(getPaginationRange(currentPage, totalPages));

	const handlePrev = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};
</script>

{#if totalPages > 1}
	<div class="mt-6 flex items-center justify-center gap-2">
		<button
			onclick={handlePrev}
			disabled={currentPage === 1}
			class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label="Halaman sebelumnya"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		{#each pageRange as pageNum (pageNum)}
			{#if typeof pageNum === 'string'}
				<span class="px-2 text-white/40">{pageNum}</span>
			{:else}
				<button
					onclick={() => onPageChange(pageNum)}
					class="rounded-xl border px-4 py-2 text-sm transition-all {pageNum === currentPage
						? 'border-violet-500 bg-violet-500/20 text-violet-400'
						: 'border-white/10 bg-white/5 hover:bg-white/10'}"
				>
					{pageNum}
				</button>
			{/if}
		{/each}

		<button
			onclick={handleNext}
			disabled={currentPage === totalPages}
			class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label="Halaman selanjutnya"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>
{/if}
