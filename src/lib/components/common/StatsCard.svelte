<script lang="ts">
	type Props = {
		label: string;
		value: number | string;
		variant?: 'default' | 'success' | 'muted';
	};

	let { label, value, variant = 'default' }: Props = $props();

	const variantClasses = {
		default: 'text-white',
		success: 'text-emerald-400',
		muted: 'text-white/40'
	};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
	<div class="text-xs text-white/50">{label}</div>
	<div class="font-display mt-1 text-2xl font-semibold {variantClasses[variant]}">{value}</div>
</div>
