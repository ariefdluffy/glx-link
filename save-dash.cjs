const fs = require('fs');

const text = `
<script lang="ts">
        let { data } = $props();
</script>

<svelte:head>
        <title>Dashboard GLX</title>
</svelte:head>

<div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-3">
                <div class="glass-panel rounded-3xl p-5">
                        <div class="text-xs text-white/50">Total Link</div>
                        <div class="font-display mt-2 text-2xl">{data.stats.totalLinks}</div>
                        <div class="mt-3 text-xs text-white/45">Dari akun Anda</div>
                </div>
                <div class="glass-panel rounded-3xl p-5">
                        <div class="text-xs text-white/50">Total Klik</div>
                        <div class="font-display mt-2 text-2xl">{data.stats.totalClicks}</div>
                        <div class="mt-3 text-xs text-white/45">Semua shortlink</div>
                </div>
                <div class="glass-panel rounded-3xl p-5">
                        <div class="text-xs text-white/50">Microsite Aktif</div>
                        <div class="font-display mt-2 text-2xl">
                                {data.stats.totalMicrosites}{data.stats.plan === 'pro' ? \` / \${data.stats.micrositeLimit}\` : ''}
                        </div>
                        <div class="mt-3 text-xs text-white/45">
                                {data.stats.plan === 'pro' ? 'Slot digunakan' : 'Fitur Pro'}
                        </div>
                </div>
        </div>

        <div class="glass-panel rounded-3xl p-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                                <div class="font-display text-lg font-semibold">Link Terbaru</div>
                                <div class="text-xs text-white/50">Pantau link yang paling sering dipakai.</div>
                        </div>
                        <a class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-white/40" href="/dashboard/links">
                                Lihat Semua
                        </a>
                </div>
                <div class="mt-6 space-y-3 text-sm">
                        {#if data.latestLinks.length === 0}
                                <div class="text-xs text-white/50">Belum ada link yang dibuat.</div>
                        {:else}
                                {#each data.latestLinks as link}
                                        <div class="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                                                <div class="min-w-0 pr-4">
                                                        <div class="font-mono text-xs text-white/70">glx.my.id/{link.slug}</div>
                                                        <div class="truncate text-xs text-white/40">{link.destination}</div>
                                                </div>
                                                <div class="whitespace-nowrap text-xs text-white/50">{link.clicks ?? 0} klik</div>
                                        </div>
                                {/each}
                        {/if}
                </div>
        </div>

        <div class="glass-panel rounded-3xl p-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                                <div class="font-display text-lg font-semibold">Quick Actions</div>
                                <div class="text-xs text-white/50">Buat link baru atau microsite dalam satu klik.</div>
                        </div>
                </div>
                <div class="mt-6 grid gap-4 md:grid-cols-2">
                        <a class="block rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left text-sm text-white/70 hover:border-white/40" href="/dashboard/links/new">
                                <div class="font-display text-base text-white">+ Buat Shortlink</div>
                                <div class="mt-2 text-xs text-white/50">Slug acak gratis, custom untuk Pro.</div>
                        </a>
                        <a class="block rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left text-sm text-white/70 hover:border-white/40" href="/dashboard/microsites/new">
                                <div class="font-display text-base text-white">+ Buat Microsite</div>
                                <div class="mt-2 text-xs text-white/50">Tampilkan semua channel dalam satu halaman.</div>
                        </a>
                </div>
        </div>
</div>
`.trim();

fs.writeFileSync('src/routes/dashboard/+page.svelte', text);
console.log('Saved');
