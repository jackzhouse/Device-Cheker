# DESIGN GENERAL
> Version 1.0 | Reusable UI/UX Baseline for Web Applications  
> Derived from `DESIGN.md`, generalized for cross-project use

---

## 1. PURPOSE

Dokumen ini adalah acuan design system + UI/UX spec umum untuk project web berbasis dashboard, admin panel, internal tools, portal operasional, atau SaaS product.

Tujuan:
- Menjadi baseline reusable lintas project
- Menjaga konsistensi layout, spacing, typography, table, filter, drawer, modal, navigation
- Mempercepat kickoff project baru tanpa harus menulis design spec dari nol
- Menyediakan pola generik yang bisa diisi ulang sesuai domain masing-masing project

Dokumen ini sengaja **tidak** mengikat ke:
- nama produk tertentu
- role bisnis tertentu
- route tertentu
- workflow domain tertentu
- backend/vendor auth tertentu

---

## 2. HOW TO ADAPT

Saat memakai dokumen ini di project baru, tentukan dulu:

| Area | Ganti Menjadi |
|------|---------------|
| Product Name | nama app / platform |
| Workspace Terms | item utama domain: order, ticket, form, invoice, request, case, task |
| User Roles | viewer, editor, operator, approver, manager, admin, owner |
| Status Model | draft, active, pending, approved, rejected, archived, atau status domain lain |
| Navigation | route, grouping menu, permission matrix |
| Auth Flow | email/password, SSO, OAuth, vendor auth, magic link |
| Primary Metrics | KPI paling penting untuk dashboard |
| Record Detail | field apa yang muncul di drawer / modal / detail page |

Aturan adaptasi:
- Pertahankan token visual bila masih cocok
- Ganti copy dan contoh route ke konteks project
- Hapus section yang tidak relevan
- Tambah section baru bila project punya pattern khusus

---

## 3. PHILOSOPHY & TONE

**Style**: modern, clean, functional, trustworthy  
**Mood**: professional, readable, dense but not crowded

Prinsip utama:
- Scannability first
- Progressive disclosure
- Consistent affordances
- Accessible by default
- Responsive by default
- Permission-aware UI
- Reusable component primitives before page-specific exceptions

Design behavior:
- Informasi penting harus terbaca cepat
- User tidak dipaksa pindah halaman untuk detail kecil
- List-heavy interface harus tetap ringan dipindai
- State berbeda wajib terlihat jelas tanpa membaca paragraph panjang

---

## 4. COLOR PALETTE

### Base

```css
--color-bg-base:        #F8F9FB;
--color-bg-surface:     #FFFFFF;
--color-bg-subtle:      #F1F3F7;
--color-bg-hover:       #E8EBF0;
--color-border:         #E2E6ED;
--color-border-strong:  #C8CDD8;
```

### Text

```css
--color-text-primary:   #111827;
--color-text-secondary: #4B5563;
--color-text-muted:     #9CA3AF;
--color-text-disabled:  #D1D5DB;
```

### Primary Accent

```css
--color-blue-50:  #EFF6FF;
--color-blue-100: #DBEAFE;
--color-blue-500: #3B82F6;
--color-blue-600: #2563EB;
--color-blue-700: #1D4ED8;
```

### Status Colors

```css
--color-green-50:  #F0FDF4;
--color-green-500: #22C55E;
--color-green-600: #16A34A;

--color-orange-50:  #FFF7ED;
--color-orange-500: #F97316;
--color-orange-600: #EA580C;

--color-red-50:  #FEF2F2;
--color-red-500: #EF4444;
--color-red-600: #DC2626;

--color-cyan-50:  #ECFEFF;
--color-cyan-500: #06B6D4;
--color-cyan-600: #0891B2;

--color-purple-50:  #FAF5FF;
--color-purple-500: #A855F7;
--color-purple-600: #9333EA;

--color-rose-50:  #FFF1F2;
--color-rose-500: #F43F5E;
--color-rose-600: #E11D48;

--color-gray-100: #F3F4F6;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
```

---

## 5. STATUS SYSTEM

Gunakan dua level status:
- entity status
- process status

Contoh entity status:
- `draft`
- `active`
- `inactive`
- `archived`

Contoh process status:
- `pending`
- `in_progress`
- `approved`
- `rejected`
- `needs_revision`
- `completed`
- `failed`

Badge rules:
- pakai pill kecil, inline-flex
- dot optional
- warna status harus konsisten di semua surface
- jangan buat dua warna untuk satu arti yang sama

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  flex-shrink: 0;
}
```

---

## 6. TYPOGRAPHY

### Font Stack

```css
--font-sans: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Scale

```css
--text-xs:   11px / 1.4;
--text-sm:   13px / 1.5;
--text-base: 14px / 1.6;
--text-md:   15px / 1.6;
--text-lg:   18px / 1.4;
--text-xl:   22px / 1.3;
--text-2xl:  28px / 1.25;
```

Typography usage:
- `text-xs`: badge, helper, timestamp, meta
- `text-sm`: table cell, filter, input, nav item
- `text-base`: body, modal body, description
- `text-lg`: section heading, drawer title
- `text-xl`: page title
- `text-2xl`: metric value

Mono usage:
- id unik
- nomor dokumen
- kode versi
- short hashes

---

## 7. SPACING, RADIUS, SHADOW

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.12);
```

---

## 8. APP LAYOUT

Pilih satu pattern utama. Jangan campur dua shell besar tanpa alasan kuat.

### Option A: Sidebar Shell

```text
[Topbar sticky]
[Sidebar] [Main Content]
```

Cocok untuk:
- admin panel
- internal dashboard
- tools dengan menu banyak

### Option B: Top Navigation Shell

```text
[Topbar sticky]
[Tab bar optional]
[Main Content]
```

Cocok untuk:
- app modern dengan menu utama sedikit
- app yang butuh visited tabs
- workspace dengan route switching cepat

Main content rules:
- max-width optional 1280px
- horizontal padding 24px sampai 32px desktop
- vertical section spacing konsisten

---

## 9. NAVIGATION

Navigation harus dikelompokkan:
- Main
- Manage
- System

Aturan:
- item aktif wajib jelas
- item hover tidak boleh ambigu
- badge count hanya untuk hal yang butuh tindakan
- menu dengan permission khusus harus hilang, bukan disabled, kecuali ada alasan edukasi akses

Active item style:
- background subtle accent
- text primary/accent
- medium weight

---

## 10. PAGE HEADER

Anatomi:

```text
[Title + Subtitle]                     [Primary Action] [Secondary Action]
```

Rules:
- title satu baris bila memungkinkan
- subtitle optional
- actions di kanan, wrap bila sempit
- margin-bottom konsisten sebelum tabs/filter/content

Gunakan Page Header untuk:
- list page
- dashboard
- settings
- detail shell

Jangan pakai Page Header penuh untuk:
- login page
- public landing page
- wizard fullscreen

---

## 11. FILTER BAR

Anatomi:

```text
[Search] [Select/Filter] [Select/Filter] [Reset/Clear]
```

Rules:
- search flex-1, min-width 200px
- filter controls tinggi konsisten
- reset disabled saat state default
- filter bar default tidak sticky

Shared implementation notes:
- leading icon search input lebih aman pakai class shared khusus
- select native sebaiknya `appearance: none`
- chevron select dikontrol sendiri agar padding kanan konsisten

```css
.filter-bar__search {
  height: 36px;
  padding: 0 12px 0 36px;
}

.filter-bar__select {
  height: 36px;
  padding: 0 36px 0 12px;
  appearance: none;
}
```

---

## 12. TABLE SYSTEM

Table dipakai untuk data dense. Jika data lebih sedikit dan visual lebih penting, pakai cards.

Table rules:
- row height desktop 48px sampai 52px
- th uppercase kecil atau semibold kecil
- hover row jelas
- action column tetap ringkas
- empty state ditaruh di dalam body table
- skeleton row saat loading

Optional features:
- sortable columns
- row selection
- sticky header
- sticky first column di mobile landscape
- pagination bar terpisah dari table body

Columns generik yang sering dipakai:
- identifier
- title/name
- owner/actor
- status
- updated_at
- actions

---

## 13. DRAWER & MODAL

### Drawer

Gunakan untuk:
- detail cepat
- edit ringan
- preview
- revision history

Rules:
- desktop dari kanan
- mobile dari bawah atau full screen
- width default 480px
- variant wide 640px

### Modal

Gunakan untuk:
- konfirmasi tindakan penting
- form pendek
- destructive action
- approval/confirmation flow

Rules:
- width 420px sampai 560px
- title jelas
- close via X, Escape, backdrop bila aman
- destructive action butuh visual emphasis

---

## 14. COMMON PAGE PATTERNS

### 14.1 Dashboard

Struktur:

```text
[Page Header]
[Workspace / Context Panel]
[Metric Cards]
[Charts / Trend]
[Recent Activity] [Bottleneck / Alerts]
```

Rules:
- dashboard adalah orientasi kerja, bukan hanya angka
- tampilkan KPI utama, recent activity, dan next action
- error state pakai inline retry block, bukan blank page

### 14.2 List Management Page

Struktur:

```text
[Page Header]
[Filter Bar]
[Table or Card Grid]
[Pagination]
```

Contoh domain:
- orders
- tickets
- users
- documents
- requests

### 14.3 Builder / Editor Page

Struktur:

```text
[Context Header]
[Left Palette/Sections] [Main Canvas] [Right Properties]
```

Rules:
- autosave indicator jelas
- destructive action tidak dekat primary save
- small-screen fallback wajib jelas jika editor berat

### 14.4 Settings Page

Struktur:

```text
[Page Header]
[Tabs optional]
[Section Cards / Forms]
```

Rules:
- kelompokkan per topik
- setiap section punya heading kecil dan helper text
- gunakan save per section atau save global, jangan campur tanpa alasan

### 14.5 Public / External Flow

Struktur:

```text
[Brand Header]
[Main Form/Card]
[Footer Actions]
```

Rules:
- shell terpisah dari dashboard internal
- brand surface sederhana
- progress step optional
- autosave note optional
- form width max 680px sampai 760px

### 14.6 Catalog / Library Page

Struktur:

```text
[Page Header]
[Filter Bar]
[Card Grid]
```

Card anatomy:
- category/tag
- title
- description
- small metadata
- CTA

### 14.7 Directory / Admin Page

Struktur:

```text
[Page Header]
[Summary Cards]
[Filter Bar]
[Directory Table]
[Pagination]
```

Rules:
- cocok untuk users, teams, organizations, roles, clients
- jangan tampilkan editor bila user tidak punya akses

### 14.8 Notifications Center

Struktur:

```text
[Page Header]
[Tabs: all / unread / read]
[List Surface]
```

Notification row:
- unread dot
- title
- short message
- timestamp
- full-row click target

---

## 15. ROLE / PERMISSION AWARE UI

Pattern generik:
- `viewer`
- `editor`
- `operator`
- `reviewer`
- `manager`
- `admin`
- `owner`

Rules:
- hide actions yang benar-benar tidak boleh dipakai
- show empty/access state bila perlu edukasi
- privilege tinggi wajib terasa beda di navigation dan actions
- jangan overload semua role dengan semua action

---

## 16. LOADING, EMPTY, ERROR, SUCCESS STATES

### Loading
- skeleton lebih baik dari spinner penuh untuk list-heavy screens
- shimmer halus
- ukuran skeleton harus mendekati konten asli

### Empty
- icon optional
- title pendek
- deskripsi 1 sampai 2 kalimat
- satu CTA utama bila ada next action jelas

### Error
- tampilkan inline block dekat konteks gagal
- sediakan retry bila aman
- hindari pesan generik tanpa next step

### Success
- toast untuk aksi ringan
- inline success block untuk aksi besar atau save multi-step

---

## 17. RESPONSIVE RULES

Default breakpoint:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Responsive principles:
- mobile-first
- list bisa berubah jadi cards bila perlu
- drawer desktop bisa jadi bottom sheet di mobile
- action groups harus wrap
- editor kompleks boleh memberi notice minimum width

---

## 18. DARK MODE

Dark mode optional. Jika dipakai:
- ubah via token, bukan override komponen satu-satu dulu
- pertahankan hierarchy contrast
- overlay, border, hover, dan muted text harus diuji khusus

Rule praktis:
- light mode tetap baseline utama bila product dipakai banyak user internal siang hari
- dark mode jangan jadi alasan menurunkan keterbacaan

---

## 19. ACCESSIBILITY

Checklist minimum:
- contrast ratio aman
- focus ring jelas
- keyboard navigation jalan
- modal/drawer trap focus
- Escape menutup overlay bila aman
- label form eksplisit
- icon-only button punya `aria-label`
- table bisa dibaca screen reader

---

## 20. CSS VARIABLE TEMPLATE

```css
:root {
  --color-bg-base: #F8F9FB;
  --color-bg-surface: #FFFFFF;
  --color-bg-subtle: #F1F3F7;
  --color-bg-hover: #E8EBF0;
  --color-border: #E2E6ED;
  --color-border-strong: #C8CDD8;

  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-muted: #9CA3AF;
  --color-text-disabled: #D1D5DB;

  --color-blue-50: #EFF6FF;
  --color-blue-500: #3B82F6;
  --color-blue-600: #2563EB;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06);

  --font-sans: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 21. IMPLEMENTATION NOTES

Disarankan project baru punya:
- `PageHeader`
- `FilterBar`
- `StatusBadge`
- `SummaryCard`
- `EmptyState`
- `Drawer`
- `Modal`
- `Toast`
- `TableContainer`
- `PermissionGate` atau guard setara

Jika pakai utility CSS framework:
- simpan token di CSS variables
- utility class boleh dipakai untuk assembly cepat
- pattern berulang tetap dibungkus komponen

---

## 22. WHAT TO REMOVE OR REWRITE PER PROJECT

Pasti review ulang bagian ini saat adaptasi:
- role names
- route examples
- dashboard KPI
- status labels
- page names
- auth language
- detail drawer fields
- table columns
- notification types

Jika project bukan dashboard app:
- hapus section navigation shell berat
- sederhanakan dashboard/list/admin patterns
- fokus ke public flow, marketing, checkout, atau editor pattern yang relevan

---

## 23. RECOMMENDED FILE SPLIT

Jika doc makin besar, pecah jadi:
- `DESIGN-GENERAL.md`
- `DESIGN-TOKENS.md`
- `DESIGN-PATTERNS.md`
- `DESIGN-PROJECT.md`

Struktur ideal:
- general = baseline lintas project
- project = override khusus domain

---

## 24. SUMMARY

Dokumen ini dipakai sebagai baseline universal.

Project baru cukup:
1. copy file ini
2. ganti product terms
3. sesuaikan role/status/route
4. buang pattern yang tidak dipakai
5. tambah spec domain-specific di file turunan

---

*DESIGN-GENERAL.md v1.1 — Reusable Web App Design Baseline*

---

## 25. IMPLEMENTED PATTERN UPDATES

Section ini menampung pattern reusable yang sudah muncul di implementasi terbaru dan layak masuk baseline general.

### 25.1 Topbar with Global Search

Struktur:

```text
[Logo] [Nav Items] [Overflow Menu] [Global Search] [Theme Toggle] [Notifications] [User Menu]
```

Rules:
- search trigger minimal 2 karakter
- debounce sekitar 200–250ms
- hasil dikelompokkan per module
- keyboard nav support: ArrowUp/Down, Home, End, Enter, Escape
- status badge boleh tampil di item hasil
- nav item yang tidak muat desktop dipindah ke menu `Lainnya`
- live badge cocok untuk approval pending dan notification unread

### 25.2 Visited Tabs Bar

Struktur:

```text
[Tab 1] [Tab 2] [Tab 3] ... [+]
```

Rules:
- sticky di bawah topbar
- tab truncate bila label panjang
- close action muncul saat hover atau focus
- persistence sebaiknya scoped per account, bukan global browser key
- tombol `+` boleh diarahkan ke workspace utama sesuai role

### 25.3 Submission Drawer Detail

Struktur:

```text
[Header]
[Tabs: Detail | Approval Timeline | Revision History | Log]
[Detail Content]
[Footer Actions]
```

Rules:
- drawer cocok untuk review cepat tanpa pindah halaman
- approval timeline tampil sebagai vertical step history
- revision history cocok pakai collapsible per revisi
- log cocok pakai activity feed singkat
- footer action harus permission-aware dan jelas disabled state-nya

### 25.4 Public/Respondent Form Renderer

Struktur:

```text
[Public Header]
[Progress]
[Draft State]
[Validation Summary]
[Responsive Field Grid]
[Respondent Sign-Off]
[Submit]
```

Rules:
- field grid desktop bisa 1–3 kolom, mobile tetap 1 kolom
- conditional logic wajib mempengaruhi visibility field di runtime
- autofill current user cocok untuk flow internal/respondent login
- expired atau unpublished form harus block submit dengan message jelas
- success state sebaiknya tampilkan submission/reference number + CTA next step

Field types umum tambahan:
- `datetime`
- `currency`
- `date_range`
- `file` metadata field
- `user_picker`
- `department_picker`
- `signature` sebagai sign-off marker global bila flow memakai approval proof

### 25.5 Approval Decision Modal

Struktur:

```text
[Action Title]
[Comment]
[Password Confirmation]
[Consent Checkbox]
[Optional Signature Draw]
[Confirm Actions]
```

Rules:
- cocok untuk approve, reject, request revision
- step-up password confirmation bisa dipakai untuk aksi sensitif
- consent checkbox cocok untuk proof-oriented approval flow
- draw signature optional, text seal fallback tetap valid
- proof payload sebaiknya simpan snapshot metadata dasar

### 25.6 Account-Scoped Browser Persistence

Gunakan pattern ini bila state browser harus bertahan untuk user yang sama tapi reset saat account berganti.

Examples:
- visited tabs
- filter state
- preferred list/card view
- draft ringan non-sensitive

Rules:
- key storage sertakan identity stabil user
- jangan pakai satu global key untuk semua account
- reset state saat login pertama account baru bila requirement minta fresh context

### 25.7 Theme Toggle and Dark Mode Runtime

Rules:
- toggle theme sebaiknya pakai class root seperti `html.dark`
- override lewat CSS variables, bukan patch komponen satu-satu sebagai baseline
- simpan preference di browser storage bila app memang mendukung dark mode
- cek khusus: border, hover, muted text, overlay, focus ring

### 25.8 Notification Surfaces

Patterns:
- topbar popover untuk preview singkat
- full notifications page untuk triage lengkap
- tab `all / unread / read`
- action `mark all as read`

Rules:
- unread state harus terlihat cepat
- list row idealnya full-row click target
- popover cukup tampilkan subset recent items + link `Lihat semua`

### 25.9 Mobile Behavior Addendum

Rules:
- topbar action penting tetap terlihat walau nav utama collapse
- tabbar horizontal scroll lebih aman daripada wrap dua baris
- drawer review berubah jadi bottom sheet/full-height mobile
- dense table tetap di container scroll horizontal
- editor berat boleh tampilkan minimum-width notice

### 25.10 Reusable Component Addendum

Komponen reusable yang sering layak jadi baseline:
- `Topbar`
- `TabBar`
- `ThemeToggle`
- `NotificationPopover`
- `PageHeader`
- `FilterBar`
- `StatusBadge`
- `FormRenderer`
- `SubmissionDrawer`
- `ApprovalDecisionModal`
- `SignatureCapture`
- `PermissionGate`

## 26. CHANGELOG

### v1.1 (2026-05-15)
- Added addendum for implemented reusable patterns from current frontend evolution
- Added topbar global search, visited tabs, submission drawer, form renderer, approval modal, account-scoped persistence, notification surfaces, and mobile behavior notes
- Kept original general baseline intact, new items appended as reusable extension
