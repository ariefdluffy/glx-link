<script>
  let { title, slug, bio, isActive } = $props();
</script>

<div class="glass-panel rounded-3xl p-4">
  <div class="mb-4 flex items-center justify-between">
    <span class="text-sm font-medium text-white">Informasi Dasar</span>
    <button
      type="button"
      class="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
      class:bg-green-500={isActive}
      class:bg-gray-500={!isActive}
      onclick={() => (isActive = !isActive)}
    >
      <span
        class="h-5 w-5 rounded-full bg-white shadow transition-transform"
        class:translate-x-[18px]={isActive}
        class:translate-x-0={!isActive}
      />
    </button>
  </div>

  <div class="space-y-4">
    <div>
      <label for="title" class="mb-1 block text-xs font-medium text-white/70">Judul</label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="e.g. My Links"
        class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
      />
    </div>

    <div>
      <label for="slug" class="mb-1 block text-xs font-medium text-white/70">Slug</label>
      <input
        id="slug"
        type="text"
        bind:value={slug}
        placeholder="e.g. mylinks"
        class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
      />
    </div>

    <div>
      <label for="bio" class="mb-1 block text-xs font-medium text-white/70">Bio</label>
      <textarea
        id="bio"
        bind:value={bio}
        rows={3}
        placeholder="Tulis bio singkat..."
        class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none resize-none"
      />
    </div>
  </div>
</div>
