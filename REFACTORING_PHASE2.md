# 🔥 REFACTORING PHASE 2 - Microsite Edit Page

**File:** `src/routes/dashboard/microsites/[id]/edit/+page.svelte`  
**Current Size:** 1,055 baris  
**Status:** ⚠️ **PERLU REFACTORING URGENT**

---

## 📊 ANALISIS FILE

### **Kompleksitas:**
- ✅ 1,055 baris kode (SANGAT BESAR!)
- ✅ 30+ state variables
- ✅ 20+ functions
- ✅ Form dengan drag & drop
- ✅ Image upload (3 jenis)
- ✅ QR code generation
- ✅ Social media integration
- ✅ Link management (add, remove, reorder)
- ✅ Preview component

### **Masalah:**
1. ❌ **Terlalu banyak tanggung jawab** dalam satu file
2. ❌ **Sulit di-maintain** - butuh waktu lama untuk memahami
3. ❌ **Sulit di-test** - terlalu banyak logic tercampur
4. ❌ **Code duplication** - upload logic mirip 3x
5. ❌ **Poor separation of concerns** - UI, logic, API tercampur

---

## 🎯 REKOMENDASI REFACTORING

### **Target:**
- Pecah menjadi **10-15 komponen kecil**
- Setiap komponen **100-200 baris**
- **Separation of concerns** yang jelas
- **Reusable components**

### **Estimasi Hasil:**
- Main page: **~250 baris** (dari 1,055 baris)
- Pengurangan: **~76%** 🎉

---

## 📦 KOMPONEN YANG PERLU DIBUAT

### **1. Form Components** (6 komponen)
```
✅ MicrositeBasicInfo.svelte        - Title, slug, bio (100 baris)
✅ MicrositeAppearance.svelte       - Avatar, header, colors (150 baris)
✅ MicrositeThemeSelector.svelte    - Theme & animation picker (80 baris)
✅ MicrositeLinkManager.svelte      - Link list dengan drag & drop (200 baris)
✅ MicrositeLinkItem.svelte         - Single link item (150 baris)
✅ MicrositeSocialLinks.svelte      - Social media links (100 baris)
```

### **2. Upload Components** (2 komponen)
```
✅ ImageUploader.svelte             - Generic image upload (80 baris)
✅ ImagePreview.svelte              - Image preview dengan delete (50 baris)
```

### **3. Link Type Components** (4 komponen)
```
✅ LinkTypeLink.svelte              - Link type form (80 baris)
✅ LinkTypeText.svelte              - Text label form (100 baris)
✅ LinkTypeImage.svelte             - Image link form (80 baris)
✅ LinkTypeDivider.svelte           - Divider (20 baris)
```

### **4. Utility Components** (2 komponen)
```
✅ LinkAnimationSelector.svelte     - Animation picker (60 baris)
✅ LinkTypeSelector.svelte          - Type selector buttons (50 baris)
```

### **5. Services & Utils** (3 files)
```
✅ microsite-edit.service.ts        - API calls untuk edit
✅ image-upload.util.ts             - Image upload logic
✅ drag-drop.util.ts                - Drag & drop helpers
```

---

## 🗂️ STRUKTUR FOLDER BARU

```
src/lib/
├── components/
│   ├── microsites/
│   │   ├── edit/                           # NEW!
│   │   │   ├── MicrositeBasicInfo.svelte
│   │   │   ├── MicrositeAppearance.svelte
│   │   │   ├── MicrositeThemeSelector.svelte
│   │   │   ├── MicrositeLinkManager.svelte
│   │   │   ├── MicrositeLinkItem.svelte
│   │   │   ├── MicrositeSocialLinks.svelte
│   │   │   ├── LinkTypeLink.svelte
│   │   │   ├── LinkTypeText.svelte
│   │   │   ├── LinkTypeImage.svelte
│   │   │   ├── LinkTypeDivider.svelte
│   │   │   ├── LinkAnimationSelector.svelte
│   │   │   └── LinkTypeSelector.svelte
│   │   ├── MicrositeCard.svelte           # Already exists
│   │   └── MicrositeStats.svelte          # Already exists
│   └── common/
│       ├── ImageUploader.svelte            # NEW!
│       └── ImagePreview.svelte             # NEW!
├── services/
│   └── microsite-edit.service.ts           # NEW!
└── utils/
    ├── image-upload.util.ts                # NEW!
    └── drag-drop.util.ts                   # NEW!
```

---

## 📋 BREAKDOWN TANGGUNG JAWAB

### **Main Page** (~250 baris)
- Load data dari API
- Coordinate komponen-komponen
- Handle submit form
- Error handling
- Layout & structure

### **MicrositeBasicInfo** (~100 baris)
- Input: title, slug, bio
- Validation
- Change handlers

### **MicrositeAppearance** (~150 baris)
- Avatar upload
- Header background upload
- Link text color picker
- Preview images

### **MicrositeThemeSelector** (~80 baris)
- Theme selection (4 themes)
- Animation selection (7 animations)
- Visual preview

### **MicrositeLinkManager** (~200 baris)
- List of links
- Add link button
- Add text label button
- Drag & drop container
- Social links integration

### **MicrositeLinkItem** (~150 baris)
- Single link display
- Drag handle
- Move up/down buttons
- Delete button
- Type selector
- Conditional rendering based on type

### **LinkTypeLink** (~80 baris)
- Label & URL inputs
- Caption input
- Font size control
- Icon picker (future)

### **LinkTypeText** (~100 baris)
- Text input
- Alignment buttons (left, center, right)
- Font size control
- Preview

### **LinkTypeImage** (~80 baris)
- Image upload
- Caption input
- Preview

### **ImageUploader** (~80 baris)
- Generic image upload component
- File input
- Upload to server
- Progress indicator
- Error handling

---

## 🔄 MIGRATION PLAN

### **Phase 1: Create Utils & Services** (30 min)
1. Create `image-upload.util.ts`
2. Create `drag-drop.util.ts`
3. Create `microsite-edit.service.ts`

### **Phase 2: Create Common Components** (1 hour)
1. Create `ImageUploader.svelte`
2. Create `ImagePreview.svelte`

### **Phase 3: Create Link Type Components** (2 hours)
1. Create `LinkTypeLink.svelte`
2. Create `LinkTypeText.svelte`
3. Create `LinkTypeImage.svelte`
4. Create `LinkTypeDivider.svelte`
5. Create `LinkAnimationSelector.svelte`
6. Create `LinkTypeSelector.svelte`

### **Phase 4: Create Form Components** (3 hours)
1. Create `MicrositeBasicInfo.svelte`
2. Create `MicrositeAppearance.svelte`
3. Create `MicrositeThemeSelector.svelte`
4. Create `MicrositeSocialLinks.svelte`
5. Create `MicrositeLinkItem.svelte`
6. Create `MicrositeLinkManager.svelte`

### **Phase 5: Refactor Main Page** (2 hours)
1. Import all components
2. Replace inline code with components
3. Simplify state management
4. Test functionality

### **Phase 6: Testing** (1 hour)
1. Test all form inputs
2. Test drag & drop
3. Test image uploads
4. Test save functionality

**Total Estimated Time:** ~9-10 hours

---

## ⚠️ RISIKO

### **High Complexity:**
- Drag & drop functionality
- Multiple image uploads
- Complex form state
- Social media integration

### **Mitigasi:**
- Test setiap komponen secara terpisah
- Keep drag & drop logic in one place
- Use services untuk API calls
- Incremental refactoring (bisa dilakukan bertahap)

---

## 💡 REKOMENDASI

### **Option 1: Full Refactoring** (Recommended)
- Refactor semua sekaligus
- Estimasi: 9-10 jam
- Hasil: File 250 baris, 15 komponen baru

### **Option 2: Incremental Refactoring**
- Refactor bertahap (1-2 komponen per hari)
- Estimasi: 2-3 minggu
- Lebih aman tapi lebih lama

### **Option 3: Leave As Is** (Not Recommended)
- Biarkan seperti sekarang
- Risiko: Sulit maintain, sulit test, sulit scale

---

## 🎯 PRIORITAS

### **High Priority** (Harus di-refactor)
1. ✅ Image upload logic (duplicated 3x)
2. ✅ Link type components (complex conditional rendering)
3. ✅ Drag & drop logic (complex state management)

### **Medium Priority** (Sebaiknya di-refactor)
4. ✅ Theme & animation selector
5. ✅ Social links integration
6. ✅ Basic info form

### **Low Priority** (Bisa nanti)
7. ✅ QR modal (sudah ada QRModal.svelte, tinggal pakai)

---

## 📝 KESIMPULAN

**File ini PERLU DI-REFACTOR karena:**

1. ❌ **1,055 baris** - Terlalu besar (ideal: 200-300 baris)
2. ❌ **30+ state variables** - Terlalu kompleks
3. ❌ **20+ functions** - Sulit di-maintain
4. ❌ **Code duplication** - Upload logic 3x
5. ❌ **Poor testability** - Sulit di-test

**Setelah refactoring:**

1. ✅ **~250 baris** main page (76% reduction)
2. ✅ **15 komponen baru** yang reusable
3. ✅ **Separation of concerns** yang jelas
4. ✅ **Easy to test** - setiap komponen terpisah
5. ✅ **Easy to maintain** - kode lebih modular

---

## 🚀 NEXT STEPS

### **Apakah Anda ingin saya lanjutkan refactoring file ini?**

**Pilihan:**
1. ✅ **Ya, refactor sekarang** - Saya akan mulai membuat komponen-komponen
2. ⏸️ **Nanti saja** - Fokus test dulu yang sudah di-refactor
3. 📋 **Buat plan detail dulu** - Saya buat breakdown lebih detail

**Rekomendasi saya:** Fokus test dulu yang sudah di-refactor (Links & Microsites list page), baru kemudian refactor edit page ini. Tapi file ini **DEFINITELY** perlu di-refactor! 🎯

---

**Status:** ⚠️ **IDENTIFIED - PENDING REFACTORING**  
**Priority:** 🔴 **HIGH**  
**Estimated Effort:** 9-10 hours  
**Expected Result:** 76% code reduction
