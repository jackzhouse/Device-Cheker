# Device Check Report - Design Prompt

## Design Philosophy
Buat laporan pemeriksaan perangkat yang profesional, mudah dibaca, dan informatif dengan visual hierarchy yang jelas.

## Color Palette

### Primary Colors
- **Primary Dark**: `#2C3E50` - Untuk header utama dan elemen penting
- **Secondary Blue**: `#3498DB` - Untuk section headers dan aksen
- **Accent Green**: `#27AE60` - Untuk status positif dan badges

### Supporting Colors
- **Light Gray**: `#ECF0F1` - Background footer
- **Dark Gray**: `#7F8C8D` - Teks sekunder
- **White**: `#FFFFFF` - Teks di atas background gelap

## Layout Structure

### 1. Header Section (80mm height)
```
┌────────────────────────────────────────────────┐
│                                                │
│  DEVICE CHECK REPORT           [Version: v1]  │
│  IT Department                  [Date Badge]  │
│                                                │
└────────────────────────────────────────────────┘
```
- Background: Primary Dark (#2C3E50)
- Title: Helvetica-Bold 28pt, White
- Badges: Rounded rectangles dengan warna kontras

### 2. Content Sections
Setiap section menggunakan struktur:
```
┌────────────────────────────────────────────────┐
│ [SECTION TITLE - Blue Background]             │
├────────────────────────────────────────────────┤
│ Label:        Value                            │
│ Label:        Value                            │
└────────────────────────────────────────────────┘
```

#### Section Order:
1. **Employee Information**
   - Name, Position, Department
   - Layout: 2 kolom (Label | Value)

2. **Device Information**
   - Type, Brand, Model, Serial Number, Ownership
   - Ownership ditampilkan sebagai badge

3. **Operating System**
   - OS Type, Version, License, Updates
   - Updates status sebagai badge hijau

4. **Specifications & Device Condition** (Side by side)
   - Left: RAM, Memory Type, Storage, Processor
   - Right: Overall Status (large badge) + Component conditions

### 3. Footer Section (20mm height)
```
┌────────────────────────────────────────────────┐
│ Generated: Date/Time    Page #    System Name │
└────────────────────────────────────────────────┘
```
- Background: Light Gray
- Typography: Helvetica 8pt

## Typography Guidelines

### Hierarchy
1. **Main Title**: Helvetica-Bold 28pt
2. **Section Headers**: Helvetica-Bold 14pt (white on blue)
3. **Labels**: Helvetica-Bold 10pt (black)
4. **Values**: Helvetica 10pt (dark gray)
5. **Footer**: Helvetica 8pt

### Spacing
- Section spacing: 10-15mm
- Line spacing: 7mm
- Margins: 20mm (left/right), 15mm (top/bottom content area)

## Visual Elements

### Badges
Gunakan rounded rectangles untuk highlight informasi penting:
- **Version Badge**: Blue background, 45mm × 15mm, radius 5
- **Date Badge**: Green background, 45mm × 15mm, radius 5
- **Status Badges**: Green untuk "Good", Red untuk "Bad"
- **Overall Status**: Large badge 60mm × 10mm dengan checkmark

### Status Indicators
Gunakan colored circles (4mm diameter) untuk component conditions:
- Green circle (●) = Good
- Red circle (●) = Bad/Need Attention

### Section Headers
- Full width bar dengan background secondary blue
- Height: 8mm
- White text, left aligned
- 5mm padding dari kiri

## Information Display Principles

### Data Organization
1. **Grouping**: Kelompokkan informasi terkait dalam section yang sama
2. **Visual Separation**: Gunakan color blocks dan spacing untuk memisahkan sections
3. **Emphasis**: Gunakan badges untuk informasi penting (status, ownership, updates)

### Readability
1. **Contrast**: Pastikan text memiliki contrast ratio minimal 4.5:1
2. **Alignment**: Konsisten gunakan left-aligned untuk labels dan values
3. **White Space**: Berikan breathing room antara elemen (minimum 5mm)

## Key Features

### ✓ Visual Hierarchy
- Header yang prominent dengan dark background
- Section headers berwarna untuk easy scanning
- Badges untuk quick status recognition

### ✓ Information Density
- Balanced: tidak terlalu padat, tidak terlalu kosong
- Side-by-side layout untuk specs dan condition (optimasi space)

### ✓ Professional Look
- Corporate color scheme (blue, green, dark gray)
- Consistent spacing dan alignment
- Clean, modern design tanpa clutter

### ✓ Quick Scanning
- Color-coded sections
- Visual status indicators (badges, circles)
- Clear labels dengan bold font

## Implementation Notes

### ReportLab Specific
```python
# Rounded rectangles untuk badges
c.roundRect(x, y, width, height, radius, fill=True, stroke=False)

# Color fills
c.setFillColor(colors.HexColor('#2C3E50'))

# Text alignment
c.drawString(x, y, text)  # Left-aligned
c.drawCentredString(x, y, text)  # Centered
c.drawRightString(x, y, text)  # Right-aligned
```

### Best Practices
1. Define semua colors di awal sebagai variables
2. Calculate positions relative ke page size (gunakan mm units)
3. Test dengan data yang berbeda untuk ensure scalability
4. Maintain consistent spacing dengan variables

## Customization Options

### Easy to Modify
- Colors: Ganti hex values di awal script
- Spacing: Adjust mm values
- Badges: Modify roundRect parameters
- Typography: Change font family dan sizes

### Scalable Design
- Layout responsif terhadap page size (A4)
- Section dapat ditambah/dikurangi tanpa break layout
- Component conditions bisa di-loop (easy to add more items)

## Output Specifications
- **Page Size**: A4 (210mm × 297mm)
- **File Format**: PDF
- **Quality**: Vector graphics (scalable)
- **File Name**: `device_check_report_redesigned.pdf`

---

**Design Goal**: Membuat device check report yang tidak hanya functional, tapi juga visually appealing dan easy to understand dalam satu pandangan cepat.
