<script lang="ts">
	type Props = {
		value: string;
		placeholder?: string;
		onSearch: (query: string) => void;
		onReset?: () => void;
		showReset?: boolean;
	};

	let {
		value = $bindable(),
		placeholder = 'Cari...',
		onSearch,
		onReset,
		showReset = false
	}: Props = $props();

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		onSearch(value);
	};

	const handleReset = () => {
		value = '';
		if (onReset) {
			onReset();
		} else {
			onSearch('');
		}
	};
</script>

<div class="glass-panel mb-6 rounded-3xl p-4">
	<form onsubmit={handleSubmit} class="flex gap-3">
		<div class="flex-1">
			<input
				type="text"
				bind:value
				{placeholder}
				class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-violet-500/50 focus:bg-white/10 focus:outline-none"
			/>
		</div>
		<button
			type="submit"
			class="rounded-xl border border-violet-500/50 bg-violet-500/20 px-6 py-2.5 text-sm font-medium transition-all hover:bg-violet-500/30"
		>
			Cari
		</button>
		{#if showReset}
			<button
				type="button"
				onclick={handleReset}
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
			>
				Reset
			</button>
		{/if}
	</form>
</div>
