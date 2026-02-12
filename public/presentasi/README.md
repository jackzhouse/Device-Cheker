# 📁 Folder Presentasi Screenshots

Folder ini digunakan untuk menyimpan screenshot-screenshot untuk halaman presentasi `/presentasi`.

## 📝 Cara Menggunakan

### 1. Ambil Screenshot
- Ambil screenshot sesuai instruksi di setiap slide presentasi
- Ikuti ukuran yang disarankan di placeholder
- Pastikan screenshot jelas dan mudah dibaca

### 2. Simpan Screenshot
- Simpan screenshot di folder ini (`public/presentasi/`)
- Gunakan nama file yang deskriptif
- Format yang disarankan: PNG atau JPG

### 3. Daftar Screenshot yang Dibutuhkan

#### Slide 1: Dashboard Utama
- Nama file: `dashboard-utama.png`
- Instruksi: Ambil screenshot dari halaman Dashboard utama dengan grafik dan statistik
- Ukuran: 1920x1080 atau 16:9

#### Slide 2: Header dan Branding
- Nama file: `header-branding.png`
- Instruksi: Ambil screenshot logo TKI atau header sistem dengan toggle bahasa
- Ukuran: 1200x300

#### Slide 3: 4 Kartu Statistik
- Nama file: `kartu-statistik.png`
- Instruksi: Ambil screenshot 4 kartu statistik dengan ikon dan angka
- Ukuran: 1400x400

#### Slide 4: Grid Grafik Dashboard
- Nama file: `grafik-dashboard.png`
- Instruksi: Ambil screenshot grid grafik di dashboard dengan beberapa chart berbeda
- Ukuran: 1600x600 atau 3-4 grafik terpisah 800x400

#### Slide 5: Bagian Urgent Devices
- Nama file: `urgent-devices.png`
- Instruksi: Ambil screenshot bagian Perangkat Urgent dengan kartu border berwarna
- Ukuran: 1400x600

#### Slide 6: Halaman Data Karyawan
- Nama file: `halaman-karyawan.png`
- Instruksi: Ambil screenshot halaman Data Karyawan dengan grid kartu dan tombol
- Ukuran: 1600x800

#### Slide 7: Bagian Informasi Karyawan
- Nama file: `info-karyawan.png`
- Instruksi: Ambil screenshot bagian Informasi Karyawan dengan dropdown dan checkbox
- Ukuran: 1400x500

#### Slide 8: Bagian Detail Perangkat
- Nama file: `detail-perangkat.png`
- Instruksi: Ambil screenshot bagian Detail Perangkat dengan 5 field terisi
- Ukuran: 1400x400

#### Slide 9: Bagian OS dan Spesifikasi
- Nama file: `os-spesifikasi.png`
- Instruksi: Ambil screenshot bagian Sistem Operasi dan Spesifikasi dengan storage HDD/SSD
- Ukuran: 1400x600 atau 2 gambar 1400x300

#### Slide 10: Bagian Kondisi Perangkat
- Nama file: `kondisi-perangkat.png`
- Instruksi: Ambil screenshot bagian Kondisi Perangkat dengan dropdown dan 5 field kondisi
- Ukuran: 1400x500

#### Slide 11: Bagian Aplikasi dan Keamanan
- Nama file: `aplikasi-keamanan.png`
- Instruksi: Ambil screenshot bagian Aplikasi dan Keamanan dengan beberapa aplikasi
- Ukuran: 1400x700 atau 2 gambar 1400x350

#### Slide 12: Bagian Informasi Tambahan
- Nama file: `info-tambahan.png`
- Instruksi: Ambil screenshot bagian Informasi Tambahan dengan tombol Simpan
- Ukuran: 1400x500

#### Slide 13: Halaman Data Pengecekan
- Nama file: `halaman-pengecekan.png`
- Instruksi: Ambil screenshot halaman Data Pengecekan dengan filter dan kartu
- Ukuran: 1600x800 atau 2 gambar 1400x400

#### Slide 14: Tombol Download
- Nama file: `tombol-download.png`
- Instruksi: Ambil screenshot kartu pengecekan dengan tombol download dan action buttons
- Ukuran: 800x600 (zoom 200% pada tombol action)

#### Slide 15: Modal Bantuan & Panel Pintasan
- Nama file: `modal-bantuan.png`
- Nama file 2: `panel-pintasan.png`
- Instruksi: Ambil screenshot modal bantuan dengan tabel pintasan dan panel melayang
- Ukuran: 1200x700 dan 600x400 (2 screenshot)

### 4. Update Placeholder di Kode
Setelah menyimpan screenshot, update placeholder di `src/app/presentasi/page.tsx`:

```typescript
// Contoh: Ganti placeholder dengan gambar
{currentSlideData.screenshot && (
  <div className="mt-8">
    <img 
      src="/presentasi/dashboard-utama.png" 
      alt="Dashboard Utama"
      className="w-full rounded-lg border border-border"
    />
  </div>
)}
```

## 💡 Tips

1. **Kualitas Screenshot**: Gunakan screenshot dengan resolusi tinggi
2. **Konsistensi**: Pastikan semua screenshot menggunakan gaya yang konsisten
3. **Dark Mode**: Pertimbangkan untuk mengambil screenshot di light mode dan dark mode
4. **Data Dummy**: Gunakan data dummy yang realistis untuk screenshot
5. **Kompresi**: Kompresi gambar untuk ukuran file yang lebih kecil

## 🔗 Link Terkait

- Halaman Presentasi: `http://localhost:3000/presentasi`
- Dokumentasi Lengkap: `/PRESENTATION_OUTLINE.md`
- Panduan Pengguna: `/USER_MANUAL.md`

---

**Catatan**: Placeholder di halaman presentasi akan tetap ditampilkan sampai screenshot di-upload dan kode di-update.