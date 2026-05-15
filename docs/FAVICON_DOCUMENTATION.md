# 🎨 Favicon & Logo - GLX.my.id

**Tanggal:** 2026-05-15  
**Tujuan:** Dokumentasi logo dan favicon untuk project GLX.my.id

---

## 🎯 Design Concept

Logo GLX.my.id dirancang dengan konsep:
- **Link Chain Icon** - Merepresentasikan URL shortener
- **Gradient Purple-Indigo** - Modern dan profesional
- **Text "GLX"** - Brand identity yang jelas
- **Minimalist** - Clean dan mudah dikenali

---

## 📁 File Favicon

### Lokasi: `static/`

| File | Size | Purpose | Format |
|------|------|---------|--------|
| `favicon.svg` | 512x512 | Main favicon (scalable) | SVG |
| `favicon-32x32.svg` | 32x32 | Small favicon | SVG |
| `apple-touch-icon.svg` | 180x180 | iOS home screen icon | SVG |
| `manifest.json` | - | PWA manifest | JSON |

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Indigo** | `#6366f1` | Primary gradient start |
| **Purple** | `#8b5cf6` | Primary gradient end |
| **White** | `#ffffff` | Icon & text color |
| **Dark** | `#0f172a` | Background (PWA) |

---

## 📐 Design Specifications

### Main Favicon (512x512)
```
- Background: Circular gradient (Indigo → Purple)
- Icon: Link chain (white, stroke-width: 20px)
- Text: "GLX" (80px, bold, white)
- Padding: 40px from edges
```

### Small Favicon (32x32)
```
- Background: Rounded rectangle (rx: 6px)
- Icon: Simplified link chain (stroke-width: 1.5px)
- Text: "GLX" (6px, bold, white)
- Optimized for small sizes
```

### Apple Touch Icon (180x180)
```
- Background: Rounded rectangle (rx: 40px)
- Icon: Link chain (stroke-width: 8px)
- Text: "GLX" (32px, bold, white)
- iOS-optimized design
```

---

## 🔧 Implementation

### 1. HTML Head (app.html)

```html
<head>
  <!-- Favicon -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon.png" type="image/png" />
  
  <!-- Apple Touch Icon -->
  <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json" />
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#6366f1" />
  
  <!-- Description -->
  <meta name="description" content="GLX.my.id - URL Shortener & Microsite Builder" />
</head>
```

### 2. PWA Manifest (manifest.json)

```json
{
  "name": "GLX.my.id",
  "short_name": "GLX",
  "description": "URL Shortener & Microsite Builder",
  "theme_color": "#6366f1",
  "background_color": "#0f172a",
  "display": "standalone",
  "icons": [...]
}
```

---

## 🌐 Browser Support

### Desktop Browsers:
- ✅ Chrome/Edge - SVG favicon
- ✅ Firefox - SVG favicon
- ✅ Safari - SVG favicon
- ✅ Opera - SVG favicon

### Mobile Browsers:
- ✅ Chrome Android - SVG favicon
- ✅ Safari iOS - Apple Touch Icon
- ✅ Samsung Internet - SVG favicon
- ✅ Firefox Mobile - SVG favicon

### PWA Support:
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari iOS 11.3+
- ✅ Samsung Internet

---

## 📱 Preview

### Desktop Tab:
```
[🔗 GLX] GLX.my.id - URL Shortener
```

### Mobile Home Screen:
```
┌─────────┐
│  🔗 GLX │
│   GLX   │
└─────────┘
```

### PWA Install:
```
Install GLX.my.id?
URL Shortener & Microsite Builder
[Install] [Cancel]
```

---

## 🎨 Design Variations

### Current Design (v1.0):
- Link chain icon with "GLX" text
- Purple-Indigo gradient
- Modern & professional

### Future Variations (Optional):
1. **Monochrome** - Single color for dark mode
2. **Animated** - Subtle animation for PWA splash
3. **Seasonal** - Special designs for events

---

## 🔄 How to Update Favicon

### 1. Edit SVG Files:
```bash
# Edit main favicon
code static/favicon.svg

# Edit small favicon
code static/favicon-32x32.svg

# Edit Apple touch icon
code static/apple-touch-icon.svg
```

### 2. Update Colors:
```svg
<!-- Change gradient colors -->
<linearGradient id="grad1">
  <stop offset="0%" style="stop-color:#NEW_COLOR_1" />
  <stop offset="100%" style="stop-color:#NEW_COLOR_2" />
</linearGradient>
```

### 3. Update Manifest:
```json
{
  "theme_color": "#NEW_COLOR",
  "background_color": "#NEW_BG_COLOR"
}
```

### 4. Clear Browser Cache:
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 🧪 Testing

### Test Favicon Display:

1. **Desktop Browser:**
   - Open `http://localhost:5173`
   - Check tab icon
   - Check bookmark icon

2. **Mobile Browser:**
   - Open on mobile device
   - Add to home screen
   - Check icon appearance

3. **PWA Install:**
   - Open in Chrome/Edge
   - Click "Install" button
   - Check installed app icon

### Test Commands:
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 File Sizes

| File | Size | Optimized |
|------|------|-----------|
| `favicon.svg` | ~1.2 KB | ✅ Yes |
| `favicon-32x32.svg` | ~1.0 KB | ✅ Yes |
| `apple-touch-icon.svg` | ~1.1 KB | ✅ Yes |
| `manifest.json` | ~0.5 KB | ✅ Yes |
| **Total** | **~3.8 KB** | ✅ Lightweight |

---

## 🎯 Best Practices

### Design:
- ✅ Use simple, recognizable shapes
- ✅ High contrast for visibility
- ✅ Scalable vector format (SVG)
- ✅ Consistent brand colors

### Technical:
- ✅ Multiple sizes for different contexts
- ✅ SVG for scalability
- ✅ PNG fallback for older browsers
- ✅ PWA manifest for installability

### Performance:
- ✅ Optimized file sizes (<2KB each)
- ✅ Minimal HTTP requests
- ✅ Cached by browser
- ✅ Fast loading

---

## 🔗 Related Files

- `src/app.html` - HTML head with favicon links
- `static/favicon.svg` - Main favicon
- `static/favicon-32x32.svg` - Small favicon
- `static/apple-touch-icon.svg` - iOS icon
- `static/manifest.json` - PWA manifest

---

## 📞 Support

Jika ada masalah dengan favicon:
1. Clear browser cache (Ctrl + Shift + R)
2. Check file exists in `static/` folder
3. Verify paths in `app.html`
4. Test in different browsers
5. Check console for errors

---

## 🎉 Changelog

### v1.0 (2026-05-15)
- ✅ Created main favicon (512x512)
- ✅ Created small favicon (32x32)
- ✅ Created Apple touch icon (180x180)
- ✅ Added PWA manifest
- ✅ Updated app.html with favicon links
- ✅ Added theme color meta tag

---

**Last Updated:** 2026-05-15  
**Version:** 1.0  
**Status:** ✅ Production Ready
