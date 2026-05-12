<script lang="ts">
	import StatsCard from '$lib/components/common/StatsCard.svelte';
	import type { MicrositeStats } from '$lib/types/microsite.types';

	type Props = {
		stats: MicrositeStats;
	};

	let { stats }: Props = $props();
</script>

<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
	<StatsCard label="Total Microsite" value={stats.total} />
	<StatsCard label="Aktif" value={stats.active} variant="success" />
	<StatsCard label="Nonaktif" value={stats.inactive} variant="muted" />
	<StatsCard label="Total Klik" value={stats.totalClicks} />
</div>
