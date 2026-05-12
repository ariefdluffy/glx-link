const fs = require('fs');

// ==== 1. Fix +page.svelte (Dashboard Home) ====
let text = fs.readFileSync('src/routes/dashboard/+page.svelte', 'utf8');
const startContentIndex = text.indexOf('<div class="grid gap-4 md:grid-cols-3">');
const endContentIndex = text.lastIndexOf('</section>');

if (startContentIndex > -1 && endContentIndex > -1) {
    const rawContent = text.substring(startContentIndex, endContentIndex);
    // rawContent contains the grids and latest links.
    // It ends at `</div>` matching `<div class="space-y-6">`
    let body = rawContent.replace(/<\/div>\s*<\/div>\s*$/g, '</div>\n');
    const newPage = `<svelte:head>\n\t<title>Dashboard GLX</title>\n</svelte:head>\n\n<div class="space-y-6">\n\t${body}\n</div>`;
    fs.writeFileSync('src/routes/dashboard/+page.svelte', newPage);
    console.log('Fixed +page.svelte');
}

// ==== 2. Fix links/+page.svelte ====
let linksText = fs.readFileSync('src/routes/dashboard/links/+page.svelte', 'utf8');
// remove `<div class="mx-auto w-full max-w-6xl px-6 pb-16">` and matching `</div>` at the end
linksText = linksText.replace('<div class="mx-auto w-full max-w-6xl px-6 pb-16">\n', '<div class="space-y-6">\n');
fs.writeFileSync('src/routes/dashboard/links/+page.svelte', linksText);
console.log('Fixed links/+page.svelte');

// ==== 3. Fix microsites/+page.svelte ====
let micrositesText = fs.readFileSync('src/routes/dashboard/microsites/+page.svelte', 'utf8');
micrositesText = micrositesText.replace('<div class="mx-auto w-full max-w-6xl px-6 pb-16">\n', '<div class="space-y-6">\n');
fs.writeFileSync('src/routes/dashboard/microsites/+page.svelte', micrositesText);
console.log('Fixed microsites/+page.svelte');
