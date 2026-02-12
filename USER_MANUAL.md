# 📘 Panduan Pengguna Sistem Pengecekan Perangkat
## Device Checking System User Manual

---

**Versi:** 1.0  
**Tanggal:** 13 Februari 2026  
**Bahasa:** Indonesia  
**Platform:** Web-based Application

---

## 📑 Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Memulai Sistem](#2-memulai-sistem)
3. [Panduan Dashboard](#3-panduan-dashboard)
4. [Manajemen Karyawan](#4-manajemen-karyawan)
5. [Formulir Pengecekan Perangkat](#5-formulir-pengecekan-perangkat)
6. [Melihat Data Pengecekan](#6-melihat-data-pengecekan)
7. [Pintasan Keyboard](#7-pintasan-keyboard)
8. [Pemecahan Masalah](#8-pemecahan-masalah)
9. [FAQ](#9-faq)

---

## 1. Pendahuluan

### 1.1 Tentang Sistem Ini

Sistem Pengecekan Perangkat adalah aplikasi berbasis web yang dirancang untuk membantu organisasi mengelola dan melacak pengecekan perangkat karyawan secara efisien. Sistem ini menyediakan antarmuka yang intuitif untuk mencatat detail lengkap tentang perangkat PC dan Laptop, termasuk spesifikasi, kondisi, aplikasi yang terinstal, dan status keamanan.

### 1.2 Siapa yang Harus Menggunakannya?

Sistem ini dirancang untuk:

- **Tim IT Support** - Melakukan dan mencatat pengecekan perangkat
- **Manajer Perangkat** - Mengawasi status perangkat dan kebutuhan perbaikan
- **Staff HR** - Mengelola data karyawan dan memantau aset
- **PIC Pengecekan Perangkat** - Melaksanakan pengecekan rutin

### 1.3 Fitur Utama

- ✅ **Dashboard Komprehensif** - Statistik real-time, grafik analitik, dan alert
- ✅ **Manajemen Karyawan** - Tambah, edit, dan import data karyawan dari Excel
- ✅ **Formulir Pengecekan Terstruktur** - 8 bagian lengkap dengan validasi
- ✅ **Pencarian Canggih** - Cari dan filter data dengan mudah
- ✅ **Ekspor PDF** - Generate laporan profesional otomatis
- ✅ **Dukungan Bilingual** - Beralih antara Bahasa Indonesia dan English
- ✅ **Pintasan Keyboard** - Bekerja lebih cepat dengan keyboard shortcuts
- ✅ **Tampilan Terkelompok** - Lihat riwayat lengkap per karyawan

### 1.4 Persyaratan Sistem

**Untuk Menggunakan Sistem:**
- Browser web modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet aktif
- Akun user dengan akses sistem

**Untuk Import Excel:**
- File format .xlsx atau .xls
- Kolom "Nama Lengkap" dan "Bagian" wajib

---

## 2. Memulai Sistem

### 2.1 Mengakses Sistem

1. Buka browser web
2. Masukkan URL sistem (contoh: `http://localhost:3000`)
3. Halaman Dashboard akan terbuka secara otomatis

### 2.2 Mengubah Bahasa

Sistem mendukung dua bahasa:

1. Lihat menu navigasi di bagian atas
2. Klik tombol bahasa (🌐 icon atau label "ID/EN")
3. Sistem akan beralih bahasa secara instan
4. Preferensi bahasa akan tersimpan

### 2.3 Menu Navigasi

Menu utama tersedia di header:

- **Dashboard** - Halaman utama dengan statistik dan grafik
- **Formulir** - Form pengecekan perangkat
- **Data Pengecekan** - Daftar semua pengecekan perangkat
- **Data Karyawan** - Daftar semua karyawan

---

**📸 [TEMPAT SCREENSHOT A1]**
**Instruksi Screenshot:**
- Ambil screenshot header dengan menu navigasi
- Tampilkan semua 4 menu utama
- Tampilkan tombol toggle bahasa
- Rekomendasi: Crop area header dan navigasi
- Ukuran yang disarankan: 1600x200

---

## 3. Panduan Dashboard

### 3.1 Gambaran Dashboard

Dashboard adalah halaman utama yang menampilkan ringkasan statistik dan analitik tentang semua pengecekan perangkat yang telah dilakukan.

### 3.2 Kartu Statistik

Dashboard menampilkan 4 kartu statistik utama:

#### 3.2.1 Total Pengecekan
- Menampilkan jumlah total semua pengecekan perangkat
- Angka akan beranimasi saat halaman dimuat
- Dapat difilter berdasarkan rentang waktu

#### 3.2.2 Total Karyawan
- Menampilkan jumlah total karyawan terdaftar
- Menunjukkan jangkauan manajemen perangkat

#### 3.2.3 Total Perangkat
- Menampilkan breakdown PC dan Laptop
- Format: "X PCs • Y Laptops"
- Membantu memahami distribusi tipe perangkat

#### 3.2.4 Perangkat Urgent
- Menampilkan jumlah perangkat yang membutuhkan perhatian segera
- Warna merah untuk penekanan visual
- Klik untuk melihat detail di bagian "Perangkat Urgent"

---

**📸 [TEMPAT SCREENSHOT B1]**
**Instruksi Screenshot:**
- Ambil screenshot 4 kartu statistik di dashboard
- Pastikan angka terbaca jelas
- Tampilkan ikon yang terkait dengan setiap kartu
- Rekomendasi: Crop area 4 kartu statistik
- Ukuran yang disarankan: 1400x400

---

### 3.3 Filter Rentang Waktu

Dropdown filter waktu tersedia di pojok kanan atas dashboard:

**Opsi Filter:**
- **Semua Waktu (All Time)** - Menampilkan semua data
- **30 Hari Terakhir (Last 30 Days)** - Pengecekan dalam 30 hari
- **6 Bulan Terakhir (Last 6 Months)** - Pengecekan dalam 6 bulan
- **1 Tahun Terakhir (Last 1 Year)** - Pengecekan dalam 1 tahun

**Cara Menggunakan:**
1. Klik dropdown waktu
2. Pilih rentang waktu yang diinginkan
3. Semua statistik dan grafik akan diperbarui secara otomatis

---

### 3.4 Grafik dan Analitik

Dashboard menampilkan berbagai grafik untuk analisis data:

#### 3.4.1 Distribusi Tipe Perangkat (Pie Chart)
- Membandingkan jumlah PC vs Laptop
- Warna: Biru untuk PC, Ungu untuk Laptop
- Klik slice untuk melihat detail

#### 3.4.2 Kepemilikan Perangkat (Pie Chart)
- Membandingkan perangkat milik perusahaan vs pribadi
- Warna: Hijau untuk Company, Oranye untuk Personal

#### 3.4.3 Kesesuaian Perangkat (Bar Chart)
- Menunjukkan status kesesuaian perangkat
- Kategori: Sesuai, Terbatas, Perlu Perbaikan, Tidak Sesuai
- Warna berbeda untuk setiap kategori

#### 3.4.4 Distribusi Sistem Operasi (Pie Chart)
- Menunjukkan distribusi OS yang digunakan
- Kategori: Windows, Linux, Mac

#### 3.4.5 Status Lisensi OS (Bar Chart)
- Memantau status legalitas lisensi OS
- Kategori: Original, Bajakan, Open Source, Unknown

#### 3.4.6 Status Keamanan (Pie Chart)
- Menampilkan status antivirus dan VPN
- Antivirus: Aktif/Tidak Aktif
- VPN: Tersedia/Tidak Tersedia

#### 3.4.7 Tren Pengecekan (Line Chart)
- Menunjukkan tren pengecekan sepanjang waktu
- Data per bulan
- Garis biru dengan titik untuk setiap bulan

#### 3.4.8 Breakdown Departemen (Bar Chart)
- Menampilkan top 5 departemen dengan pengecekan terbanyak
- Bar horizontal untuk perbandingan mudah

---

**📸 [TEMPAT SCREENSHOT B2]**
**Instruksi Screenshot:**
- Ambil screenshot grid grafik di dashboard
- Tampilkan beberapa grafik yang berbeda
- Pastikan label dan legend terbaca
- Rekomendasi: Panoramic capture atau 3-4 grafik terpisah
- Ukuran yang disarankan: 1600x800

---

### 3.5 Bagian Perangkat Urgent

Bagian ini menampilkan perangkat yang membutuhkan perhatian segera:

**Kriteria Perangkat Urgent:**
- Status "Needs Repair" - Membutuhkan perbaikan
- Status "Unsuitable" - Tidak layak untuk digunakan

**Informasi yang Ditampilkan:**
- Nama dan posisi karyawan
- Tipe perangkat (PC/Laptop)
- Merk dan model perangkat
- Nomor seri
- Status kesesuaian dengan badge warna
- Tanggal pengecekan
- Versi pengecekan

**Indikator Visual:**
- 🔴 Border merah untuk "Needs Repair"
- 🟣 Border ungu untuk "Unsuitable"

**Tindakan yang Disarankan:**
1. Review detail perangkat
2. Jadwalkan perbaikan atau penggantian
3. Hubungi karyawan terkait
4. Update status setelah tindakan diambil

---

**📸 [TEMPAT SCREENSHOT B3]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Perangkat Urgent" di dashboard
- Pastikan kartu dengan border berwarna terlihat
- Tampilkan contoh perangkat urgent
- Rekomendasi: Crop area urgent devices section
- Ukuran yang disarankan: 1400x600

---

## 4. Manajemen Karyawan

### 4.1 Mengakses Halaman Karyawan

1. Klik menu "Data Karyawan" di header
2. Halaman daftar karyawan akan terbuka
3. Grid kartu karyawan akan ditampilkan

---

**📸 [TEMPAT SCREENSHOT C1]**
**Instruksi Screenshot:**
- Ambil screenshot halaman "Data Karyawan"
- Tampilkan grid kartu karyawan
- Pastikan tombol dan filter terlihat
- Rekomendasi: Full page dengan beberapa kartu
- Ukuran yang disarankan: 1600x800

---

### 4.2 Menambah Karyawan Baru

#### 4.2.1 Menambah Manual

1. Klik tombol "Tambah Karyawan" (ikon User Plus)
2. Halaman tambah karyawan akan terbuka
3. Isi formulir dengan informasi karyawan:

**Bidang Wajib (ditandai dengan *):**
- **Nama Depan** - Nama depan karyawan
- **Nama Belakang** - Nama belakang karyawan
- **Posisi** - Posisi/jabatan karyawan (contoh: Software Engineer)

**Bidang Opsional:**
- **ID Karyawan** - Biarkan kosong untuk auto-generate
- **Departemen** - Departemen karyawan (contoh: IT, HR)
- **Email** - Alamat email karyawan
- **Nomor Telepon** - Nomor telepon karyawan
- **Status** - Aktif, Tidak Aktif, atau Mengundurkan Diri

4. Klik tombol "Tambah Karyawan"
5. Karyawan akan ditambahkan ke sistem
6. Pesan sukses akan muncul

---

**📸 [TEMPAT SCREENSHOT C2]**
**Instruksi Screenshot:**
- Ambil screenshot form tambah karyawan
- Tampilkan semua field (wajib dan opsional)
- Isi dengan contoh data
- Pastikan tombol "Tambah Karyawan" terlihat
- Rekomendasi: Crop area form tambah karyawan
- Ukuran yang disarankan: 1400x700

---

#### 4.2.2 Mengimpor dari Excel

**Cara Import:**

1. Klik tombol "Import" (ikon File Spreadsheet)
2. Modal import akan terbuka

**Download Template:**
1. Klik tombol "Download" (ikon Download)
2. Template Excel akan diunduh secara otomatis
3. Buka template di Excel atau spreadsheet software

**Mengisi Template:**

**Kolom Wajib:**
- **Nama Lengkap** - Nama lengkap karyawan (otomatis dibagi nama depan/belakang)
- **Bagian** - Posisi/jabatan karyawan

**Kolom Opsional:**
- **Departemen/Divisi** - Departemen karyawan
- **Nomor Induk Karyawan** - ID karyawan (auto-generate jika kosong)

**Contoh Data:**
```
Nama Lengkap           | Bagian             | Departemen/Divisi
-----------------------|---------------------|------------------
Budi Santoso         | Software Engineer  | IT
Siti Rahayu          | HR Manager         | HR
Ahmad Wijaya          | Marketing Lead    | Marketing
```

**Upload File:**
1. Isi template dengan data karyawan
2. Simpan file Excel
3. Kembali ke modal import di sistem
4. Klik "Choose File" atau tombol upload
5. Pilih file Excel yang telah diisi
6. Nama file akan ditampilkan

**Proses Import:**
1. Klik tombol "Import"
2. Sistem akan memvalidasi data
3. Hasil import akan ditampilkan:
   - **Berhasil** - Jumlah karyawan yang berhasil diimport
   - **Gagal** - Jumlah baris yang gagal
   - **Total** - Total baris yang diproses

**Menangani Error:**
- Jika ada baris gagal, detail error akan ditampilkan
- Lihat pesan error untuk setiap baris yang gagal
- Perbaiki data di file Excel
- Import ulang file

---

**📸 [TEMPAT SCREENSHOT C3]**
**Instruksi Screenshot:**
- Ambil screenshot modal import karyawan
- Tampilkan tombol download template
- Tampilkan tombol upload file
- Tampilkan hasil import (berhasil/gagal)
- Rekomendasi: Crop area modal import
- Ukuran yang disarankan: 1200x700

---

### 4.3 Mencari dan Filter Karyawan

**Pencarian:**
1. Gunakan kotak pencarian di bagian atas
2. Ketik salah satu berikut:
   - Nama karyawan
   - Posisi/jabatan
   - ID Karyawan
3. Hasil akan filter secara real-time saat mengetik

**Filter Departemen:**
1. Klik dropdown departemen
2. Pilih departemen dari daftar
3. Hanya karyawan dari departemen tersebut yang akan ditampilkan

**Filter Status:**
1. Klik dropdown status
2. Pilih status dari opsi:
   - Semua Status (All Statuses)
   - Aktif (Active)
   - Tidak Aktif (Inactive)
   - Mengundurkan Diri (Resigned)
3. Daftar akan diperbarui

**Hapus Filter:**
1. Klik tombol "Hapus" (Clear)
2. Semua filter akan direset
3. Semua karyawan akan ditampilkan

---

**📸 [TEMPAT SCREENSHOT C4]**
**Instruksi Screenshot:**
- Ambil screenshot kotak pencarian dan filter
- Tampilkan dropdown departemen dan status
- Tampilkan tombol hapus filter
- Isi dengan contoh pencarian
- Rekomendasi: Crop area filter section
- Ukuran yang disarankan: 1400x300

---

### 4.4 Melihat Detail Karyawan

Setiap kartu karyawan menampilkan:

**Informasi Dasar:**
- Nama lengkap karyawan
- Posisi/jabatan
- ID Karyawan
- Departemen (jika ada)
- Status dengan badge warna

**Statistik Pengecekan:**
- Total Pengecekan - Jumlah pengecekan perangkat untuk karyawan ini
- Pengecekan Terakhir - Tanggal pengecekan terakhir

**Tombol Aksi:**
1. **Riwayat (History)** - Lihat semua pengecekan untuk karyawan
2. **Edit** - Edit informasi karyawan
3. **Hapus** - Hapus karyawan (dengan konfirmasi)

---

**📸 [TEMPAT SCREENSHOT C5]**
**Instruksi Screenshot:**
- Ambil screenshot satu kartu karyawan
- Tampilkan semua informasi di kartu
- Tampilkan semua tombol aksi
- Pastikan badge status terlihat
- Rekomendasi: Zoom in pada satu kartu (150%)
- Ukuran yang disarankan: 800x600

---

### 4.5 Mengedit Karyawan

1. Klik tombol "Edit" pada kartu karyawan
2. Halaman edit karyawan akan terbuka
3. Form akan terisi dengan data karyawan saat ini
4. Edit field yang diperlukan
5. Klik tombol "Simpan" (Save)
6. Data karyawan akan diperbarui
7. Pesan sukses akan muncul

### 4.6 Menghapus Karyawan

⚠️ **Peringatan:** Menghapus karyawan akan menghapus semua pengecekan perangkat terkait.

1. Klik tombol "Hapus" pada kartu karyawan
2. Modal konfirmasi akan muncul
3. Jika karyawan memiliki pengecekan:
   - Jumlah pengecekan akan ditampilkan
   - Pesan peringatan akan muncul
4. Baca pesan konfirmasi dengan cermat
5. Klik tombol "Hapus" (Delete) untuk konfirmasi
6. Atau klik "Batal" (Cancel) untuk membatalkan
7. Karyawan dan semua pengecekan terkait akan dihapus

---

## 5. Formulir Pengecekan Perangkat

### 5.1 Mengakses Formulir

1. Klik menu "Formulir" di header
2. Halaman formulir pengecekan akan terbuka
3. Formulir terdiri dari 8 bagian terstruktur

---

**📸 [TEMPAT SCREENSHOT D1]**
**Instruksi Screenshot:**
- Ambil screenshot halaman formulir lengkap
- Tampilkan sidebar navigasi di kiri (jika layar besar)
- Tampilkan semua 8 bagian form
- Rekomendasi: Full page capture
- Ukuran yang disarankan: 1920x1080

---

### 5.2 Navigasi Formulir

**Sidebar Navigasi (Layar Besar):**
- Sidebar terlihat di layar desktop
- Menampilkan 8 bagian formulir
- Klik nama bagian untuk lompat ke bagian tersebut
- Bagian aktif akan disorot dengan warna

**Navigasi Keyboard:**
- Gunakan `Alt + 1-8` untuk lompat ke bagian:
  - `Alt + 1` - Informasi Karyawan
  - `Alt + 2` - Detail Perangkat
  - `Alt + 3` - Sistem Operasi
  - `Alt + 4` - Spesifikasi
  - `Alt + 5` - Kondisi Perangkat
  - `Alt + 6` - Aplikasi
  - `Alt + 7` - Keamanan
  - `Alt + 8` - Informasi Tambahan

---

**📸 [TEMPAT SCREENSHOT D2]**
**Instruksi Screenshot:**
- Ambil screenshot sidebar navigasi
- Tampilkan semua 8 item menu
- Sorot item yang aktif
- Rekomendasi: Crop area sidebar
- Ukuran yang disarankan: 300x600

---

### 5.3 Bagian 1: Informasi Karyawan

#### 5.3.1 Memilih Karyawan

1. Klik dropdown "Pilih Karyawan"
2. Ketik nama karyawan untuk mencari
3. Pilih karyawan dari daftar autocomplete
4. Informasi karyawan akan tampil otomatis:
   - Nama Lengkap
   - Posisi
   - Departemen (jika ada)
   - Total Pengecekan

**Tips:**
- Dropdown autocomplete akan mencari saat mengetik
- Cari dengan nama lengkap, ID, atau posisi
- Informasi akan tampil instan setelah pemilihan

#### 5.3.2 Memilih Tanggal

1. Klik field tanggal
2. Calendar picker akan terbuka
3. Pilih tanggal pengecekan
4. Default: Tanggal hari ini

#### 5.3.3 Fitur "Gunakan Versi Terakhir"

⭐ **Fitur Unggulan**

**Kapan Menggunakan:**
- Untuk pengecekan rutin karyawan yang sama
- Saat perangkat tidak banyak berubah antar pengecekan
- Untuk menghemat waktu pengisian formulir

**Cara Menggunakan:**
1. Pilih karyawan terlebih dahulu
2. Centang kotak "Gunakan Versi Terakhir"
3. Tunggu beberapa detik saat data dimuat
4. Formulir akan terisi otomatis dengan data dari pengecekan terakhir karyawan

**Data yang Diisi:**
- Detail perangkat (tipe, kepemilikan, merk, model, serial)
- Sistem operasi dan spesifikasi
- Kondisi perangkat
- Daftar aplikasi
- Status keamanan
- Nama PIC pemeriksa

**Setelah Auto-Fill:**
- Review semua field yang terisi
- Update bagian yang berubah sejak pengecekan terakhir
- Perbarui tanggal ke tanggal hari ini
- Submit formulir

---

**📸 [TEMPAT SCREENSHOT D3]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Informasi Karyawan"
- Tampilkan dropdown pencarian karyawan
- Tampilkan info karyawan yang dipilih
- Tampilkan checkbox "Gunakan Versi Terakhir"
- Rekomendasi: Crop area employee section
- Ukuran yang disarankan: 1400x500

---

### 5.4 Bagian 2: Detail Perangkat

Semua field di bagian ini **WAJIB** ditandai dengan *

#### 5.4.1 Tipe Perangkat

**Opsi:**
- **PC** - Komputer desktop/tower
- **Laptop** - Laptop/notebook

**Cara Mengisi:**
1. Klik dropdown "Tipe Perangkat"
2. Pilih "PC" atau "Laptop"

#### 5.4.2 Kepemilikan

**Opsi:**
- **Perusahaan (Company)** - Perangkat milik perusahaan
- **Pribadi (Personal)** - Perangkat milik pribadi karyawan

**Cara Mengisi:**
1. Klik dropdown "Kepemilikan"
2. Pilih "Perusahaan" atau "Pribadi"

#### 5.4.3 Merk Perangkat

**Fitur Creatable Dropdown:**
- Pilih dari opsi yang tersedia
- ATAU ketik untuk membuat opsi baru
- Opsi baru akan tersimpan untuk penggunaan berikutnya

**Cara Mengisi:**
1. Klik dropdown "Merk Perangkat"
2. Ketik untuk mencari atau buat baru
3. Pilih atau tekan Enter untuk membuat
4. Merk akan ditambahkan ke daftar

**Tips:**
- Gunakan nama merk lengkap (contoh: "Dell" bukan "D")
- Konsisten dengan penulisan merk
- Huruf akan diubah ke otomatis ke UPPERCASE

#### 5.4.4 Model Perangkat

**Cara Mengisi:**
1. Ketik model perangkat di field input
2. Contoh: "Latitude 7490", "OptiPlex 7090"

**Tips:**
- Sertakan seri dan generasi jika relevan
- Konsisten dengan format penulisan

#### 5.4.5 Nomor Seri (Serial Number)

**Penting:** Nomor seri harus unik per perangkat dan akurat untuk pelacakan.

**Cara Mengisi:**
1. Ketik nomor seri perangkat
2. Contoh: "5CD2193XYZ", "ServiceTag 12345"

**Tips:**
- Periksa label di perangkat untuk serial number
- Copy-paste untuk menghindari kesalahan ketik
- Serial number sering terletak di:
  - Bawah laptop
  - Belakang PC tower
  - BIOS/Settings

---

**📸 [TEMPAT SCREENSHOT D4]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Detail Perangkat"
- Tampilkan semua 5 field
- Tampilkan dropdown merk dengan opsi
- Isi dengan contoh data lengkap
- Rekomendasi: Crop area device detail section
- Ukuran yang disarankan: 1400x400

---

### 5.5 Bagian 3: Sistem Operasi

Semua field di bagian ini **WAJIB** ditandai dengan *

#### 5.5.1 Tipe OS

**Opsi:**
- **Windows** - Microsoft Windows
- **Linux** - Distribusi Linux
- **Mac** - macOS

**Cara Mengisi:**
1. Klik dropdown "Tipe OS"
2. Pilih tipe OS yang sesuai

#### 5.5.2 Versi OS

**Cara Mengisi:**
1. Ketik versi OS di field input
2. Contoh:
   - Windows: "Windows 11", "Windows 10 Pro"
   - Linux: "Ubuntu 22.04 LTS", "Fedora 38"
   - Mac: "macOS Sonoma", "macOS Ventura"

**Tips:**
- Sertakan detail versi penting
- Konsisten dengan format penulisan

#### 5.5.3 Lisensi OS

**Opsi:**
- **Original** - Lisensi resmi/legal
- **Bajakan (Pirated)** - Lisensi bajakan/ilegal
- **Open Source** - Sistem operasi open source (gratis)
- **Unknown** - Status lisensi tidak diketahui

**Cara Mengisi:**
1. Klik dropdown "Lisensi OS"
2. Pilih status lisensi yang sesuai

**Catatan Penting:**
- Perusahaan biasanya mengharuskan lisensi original
- Catat detail jika status tidak jelas

#### 5.5.4 Update Berkala

**Cara Mengisi:**
1. Centang kotak jika update diaktifkan
2. Biarkan kosong jika update dinonaktifkan

**Pertimbangan:**
- Update berkala penting untuk keamanan
- Update otomatis disarankan untuk kebanyakan sistem

---

**📸 [TEMPAT SCREENSHOT D5]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Sistem Operasi"
- Tampilkan semua 4 field
- Isi dengan contoh data lengkap
- Rekomendasi: Crop area OS section
- Ukuran yang disarankan: 1400x350

---

### 5.6 Bagian 4: Spesifikasi

Semua field di bagian ini **OPSIONAL**

#### 5.6.1 Kapasitas RAM

**Fitur Creatable Dropdown:**
- Pilih dari opsi yang tersedia
- ATAU ketik untuk membuat opsi baru

**Cara Mengisi:**
1. Klik dropdown "Kapasitas RAM"
2. Ketik kapasitas (contoh: 8, 16, 32)
3. Pilih atau tekan Enter
4. Satuan: GB (Gigabyte)

**Tips:**
- Biasanya: 4GB, 8GB, 16GB, 32GB
- Cek di System Settings atau Task Manager

#### 5.6.2 Prosesor

**Fitur Creatable Dropdown:**
- Pilih dari opsi yang tersedia
- ATAU ketik untuk membuat opsi baru

**Cara Mengisi:**
1. Klik dropdown "Prosesor"
2. Ketik nama prosesor
3. Pilih atau tekan Enter

**Contoh:**
- Intel: "Intel Core i5-12400F", "Intel Core i7-12700K"
- AMD: "AMD Ryzen 5 5600X", "AMD Ryzen 7 5800X"
- Apple: "M1 Pro", "M2 Max"

#### 5.6.3 Penyimpanan (Storage)

**Menambah Storage:**
1. Klik tombol "Tambah" (ikon Plus)
2. Baris storage baru akan muncul

**Field untuk Setiap Storage:**

**Tipe Storage:**
- Opsi: **HDD** (Hard Disk Drive) atau **SSD** (Solid State Drive)

**Kapasitas:**
- Creatable dropdown
- Ketik kapasitas dan pilih
- Contoh: 256, 512, 1000
- Satuan: GB

**Menghapus Storage:**
1. Klik tombol "Hapus" (ikon Trash)
2. Baris storage akan dihapus

**Contoh Konfigurasi:**
```
Storage 1: SSD - 256 GB (Sistem Operasi)
Storage 2: HDD - 1000 GB (Data)
```

**Tips:**
- Tambahkan semua storage yang terinstall
- Tentukan tipe storage untuk setiap entry
- Periksa di Disk Management atau Settings

---

**📸 [TEMPAT SCREENSHOT D6]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Spesifikasi"
- Tampilkan RAM dan prosesor terisi
- Tampilkan beberapa storage (HDD dan SSD)
- Tampilkan tombol tambah dan hapus
- Rekomendasi: Crop area spec section
- Ukuran yang disarankan: 1400x450

---

### 5.7 Bagian 5: Kondisi Perangkat

#### 5.7.1 Kesesuaian Perangkat (WAJIB)

**Opsi:**
- **Sesuai (Suitable)** - Perangkat berfungsi baik untuk pekerjaan
- **Sesuai Terbatas (Limited Suitability)** - Perangkat berfungsi dengan beberapa keterbatasan
- **Perlu Perbaikan (Needs Repair)** - Perangkat membutuhkan perbaikan segera
- **Tidak Sesuai (Unsuitable)** - Perangkat tidak layak untuk digunakan

**Cara Mengisi:**
1. Klik dropdown "Kesesuaian Perangkat"
2. Pilih status yang sesuai

**Panduan Penilaian:**
- **Sesuai:** Semua fungsi kerja berjalan normal, performa memadai
- **Terbatas:** Beberapa fungsi terbatas, performa tidak optimal, tapi masih bisa digunakan
- **Perlu Perbaikan:** Ada masalah serius, perangkat tidak berfungsi dengan baik, membutuhkan perbaikan
- **Tidak Sesuai:** Perangkat sudah tua, rusak parah, atau tidak memenuhi kebutuhan kerja

#### 5.7.2 Kondisi Komponen (Opsional)

Setiap komponen dapat dinilai secara terpisah:

**Deskriptor yang Disarankan:**

**Baterai:**
- Baik - Tahan 4+ jam, tidak ada masalah
- Cukup - Tahan 2-4 jam, ada degradasi
- Buruk - Tahan <2 jam, perlu penggantian
- Perlu Penggantian - Tidak dapat menahan charge atau tidak berfungsi

**Keyboard:**
- Baik - Semua tombol berfungsi, responsif
- Cukup - Beberapa tombol macet tapi masih bisa digunakan
- Buruk - Banyak tombol tidak berfungsi
- Ada tombol yang tidak berfungsi - Spesifik mana tombol

**Touchpad:**
- Baik - Responsif, semua gesture bekerja
- Cukup - Responsif tapi ada delay atau jitter
- Buruk - Tidak responsif atau scroll tidak bekerja
- Tidak responsif - Perlu eksternal mouse

**Monitor:**
- Baik - Tampilan jelas, tidak ada dead pixel
- Cukup - Ada dead pixel minor atau color shift
- Buruk - Ada banyak dead pixel atau flickering
- Ada dead pixel - Catat lokasi dan jumlah

**WiFi:**
- Baik - Sinyal kuat, koneksi stabil
- Cukup - Sinyal sedang, kadang putus
- Buruk - Sinyal lemah, sering putus
- Sinyal lemah - Perlu WiFi eksternal

**Cara Mengisi:**
1. Ketik deskripsi yang sesuai di field input
2. Gunakan bahasa yang jelas dan spesifik
3. Catat detail tambahan jika perlu

---

**📸 [TEMPAT SCREENSHOT D7]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Kondisi Perangkat"
- Tampilkan dropdown kesesuaian
- Tampilkan 5 field kondisi komponen
- Isi dengan contoh deskriptor
- Rekomendasi: Crop area condition section
- Ukuran yang disarankan: 1400x500

---

### 5.8 Bagian 6: Aplikasi

Semua field di bagian ini **OPSIONAL**

#### 5.8.1 Aplikasi Kerja

**Menambah Aplikasi Kerja:**
1. Klik tombol "Tambah" (ikon Plus)
2. Baris aplikasi baru akan muncul

**Field untuk Setiap Aplikasi:**

**Nama Aplikasi:**
- Ketik nama aplikasi
- Contoh: "Microsoft Office 365", "Adobe Acrobat Reader", "Visual Studio Code"

**Lisensi:**
- Opsi: Original, Bajakan, Open Source, Unknown
- Pilih status lisensi aplikasi

**Catatan:**
- Opsional
- Ketik catatan tambahan
- Contoh: Versi, tanggal lisensi, keterbatasan

**Menghapus Aplikasi:**
1. Klik tombol "Hapus" (ikon Trash)
2. Baris aplikasi akan dihapus

#### 5.8.2 Aplikasi Non-Kerja

Proses sama seperti aplikasi kerja, digunakan untuk aplikasi pribadi karyawan.

**Contoh Aplikasi Non-Kerja:**
- "Steam", "Spotify", "WhatsApp", "Discord"

**Tips:**
- List hanya aplikasi utama dan penting
- Jangan list terlalu banyak aplikasi minor
- Pastikan lisensi legal untuk software kerja

---

**📸 [TEMPAT SCREENSHOT D8]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Aplikasi"
- Tampilkan beberapa aplikasi kerja
- Tampilkan beberapa aplikasi non-kerja
- Tampilkan field lisensi untuk setiap aplikasi
- Rekomendasi: Crop area apps section
- Ukuran yang disarankan: 1400x600

---

### 5.9 Bagian 7: Keamanan

Semua field di bagian ini **OPSIONAL**

#### 5.9.1 Antivirus

**Status Antivirus:**
1. Klik dropdown status
2. Pilih "Aktif" atau "Tidak Aktif"

**Menambah Software Antivirus:**
1. Klik tombol "Tambah" (ikon Plus)
2. Baris antivirus baru akan muncul

**Field untuk Setiap Antivirus:**

**Nama Software:**
- Ketik nama antivirus
- Contoh: "Windows Defender", "Kaspersky", "McAfee"

**Lisensi:**
- Opsi: Original, Bajakan, Open Source, Unknown
- Pilih status lisensi

**Catatan:**
- Opsional
- Contoh: Versi, tanggal expire, konfigurasi

#### 5.9.2 VPN

**Status VPN:**
1. Klik dropdown status
2. Pilih "Tersedia" atau "Tidak Tersedia"

**Menambah Koneksi VPN:**
1. Klik tombol "Tambah" (ikon Plus)
2. Baris VPN baru akan muncul

**Field untuk Setiap VPN:**

**Nama VPN:**
- Ketik nama/koneksi VPN
- Contoh: "Company VPN", "NordVPN", "ExpressVPN"

**Lisensi:**
- Opsi: Original, Bajakan, Open Source, Unknown
- Pilih status lisensi

**Catatan:**
- Opsional
- Contoh: Server, protokol, keterbatasan

---

**📸 [TEMPAT SCREENSHOT D9]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Keamanan"
- Tampilkan status antivirus dan VPN
- Tampilkan beberapa software antivirus
- Tampilkan beberapa koneksi VPN
- Rekomendasi: Crop area security section
- Ukuran yang disarankan: 1400x600

---

### 5.10 Bagian 8: Informasi Tambahan

#### 5.10.1 Penggunaan Password (WAJIB)

**Opsi:**
- **Tersedia** - Password perangkat tersedia
- **Tidak Tersedia** - Password perangkat tidak tersedia

**Cara Mengisi:**
1. Klik dropdown "Penggunaan Password"
2. Pilih status yang sesuai

#### 5.10.2 Nama PIC Pemeriksa

**Fitur Creatable Dropdown:**
- Pilih dari daftar pemeriksa yang tersimpan
- ATAU ketik untuk membuat nama baru

**Cara Mengisi:**
1. Klik dropdown "Nama PIC Pemeriksa"
2. Ketik nama atau pilih dari daftar
3. Pilih atau tekan Enter

**Tips:**
- PIC = Person In Charge (Orang yang Bertanggung Jawab)
- Gunakan nama lengkap pemeriksa

#### 5.10.3 Catatan Lainnya

**Cara Mengisi:**
1. Ketik catatan tambahan di text area
2. Gunakan untuk informasi penting yang belum tercakup

**Pintasan di Field Catatan:**
- `Enter` - Submit formulir secara instan
- `Shift + Enter` - Buat baris baru

**Contoh Catatan:**
```
Perangkat perlu dibersihkan debu di cooler.
Keyboard ada 2 tombol yang macet (W dan E).
Laptop sering overheat saat digunakan >2 jam.
```

---

**📸 [TEMPAT SCREENSHOT D10]**
**Instruksi Screenshot:**
- Ambil screenshot bagian "Informasi Tambahan"
- Tampilkan semua 3 field
- Tampilkan tombol "Simpan"
- Tampilkan catatan dengan contoh
- Rekomendasi: Crop area additional info dan tombol submit
- Ukuran yang disarankan: 1400x500

---

### 5.11 Validasi dan Submit

#### 5.11.1 Validasi Wajib

Sistem akan memvalidasi semua field wajib sebelum submit:

**Field Wajib:**
- ✅ Karyawan (dipilih dari dropdown)
- ✅ Tanggal Pengecekan
- ✅ Tipe Perangkat
- ✅ Kepemilikan
- ✅ Merk Perangkat
- ✅ Model Perangkat
- ✅ Nomor Seri
- ✅ Tipe OS
- ✅ Versi OS
- ✅ Lisensi OS
- ✅ Kesesuaian Perangkat
- ✅ Penggunaan Password

**Jika Ada Field Kosong:**
- Pesan error akan muncul di bawah field
- Submit akan diblok
- Field kosong akan disorot dengan warna merah

#### 5.11.2 Submit Formulir

**Cara Submit:**
1. Klik tombol "Simpan" di bagian bawah formulir
2. ATAU gunakan pintasan `Ctrl/Cmd + S`
3. ATAU tekan `Enter` di field catatan

**Setelah Submit Sukses:**
- Pesan sukses "Pengecekan perangkat berhasil dibuat"
- Otomatis redirect ke halaman "Data Pengecekan"
- Data baru akan tersimpan di database

---

**📸 [TEMPAT SCREENSHOT D11]**
**Instruksi Screenshot:**
- Ambil screenshot formulir lengkap terisi
- Tampilkan tombol "Simpan" di bagian bawah
- Tampilkan pesan validasi jika ada
- Rekomendasi: Full page capture
- Ukuran yang disarankan: 1920x1080

---

## 6. Melihat Data Pengecekan

### 6.1 Mengakses Halaman Data Pengecekan

1. Klik menu "Data Pengecekan" di header
2. Halaman daftar pengecekan akan terbuka

---

**📸 [TEMPAT SCREENSHOT E1]**
**Instruksi Screenshot:**
- Ambil screenshot halaman "Data Pengecekan"
- Tampilkan grid kartu pengecekan
- Pastikan semua bagian terlihat
- Rekomendasi: Full page capture
- Ukuran yang disarankan: 1600x900

---

### 6.2 Pencarian

**Cara Mencari:**
1. Ketik di kotak pencarian di bagian atas
2. Sistem akan mencari secara real-time

**Field yang Dapat Dicari:**
- Nama karyawan
- ID Karyawan
- Merk perangkat
- Model perangkat

**Tips:**
- Ketik partial name untuk pencarian lebih luas
- Hasil akan filter instan saat mengetik
- Case-insensitive (huruf besar/kecil tidak pengaruh)

---

### 6.3 Filter

#### 6.3.1 Filter Kondisi

1. Klik dropdown "Semua Kondisi"
2. Pilih salah satu:
   - Semua Kondisi - Tampilkan semua
   - Sesuai - Hanya yang sesuai
   - Terbatas - Hanya yang terbatas
   - Perlu Perbaikan - Hanya yang perlu perbaikan
   - Tidak Sesuai - Hanya yang tidak sesuai

#### 6.3.2 Filter Kepemilikan

1. Klik dropdown "Semua Kepemilikan"
2. Pilih salah satu:
   - Semua Kepemilikan - Tampilkan semua
   - Perusahaan - Hanya milik perusahaan
   - Pribadi - Hanya milik pribadi

#### 6.3.3 Hapus Filter

1. Klik tombol "Hapus Filter"
2. Semua filter akan direset
3. Pencarian juga akan direset
4. Semua data akan ditampilkan

---

**📸 [TEMPAT SCREENSHOT E2]**
**Instruksi Screenshot:**
- Ambil screenshot kotak pencarian dan filter
- Tampilkan dropdown kondisi dan kepemilikan
- Tampilkan tombol hapus filter
- Isi dengan contoh filter aktif
- Rekomendasi: Crop area filter section
- Ukuran yang disarankan: 1400x300

---

### 6.4 Tampilan Terkelompok

**Fitur Group By Employee:**

1. Centang kotak "Kelompokkan Berdasarkan Karyawan"
2. Tampilan akan berubah dari grid kartu ke kartu per karyawan

**Tampilan Terkelompok:**
- Setiap kartu mewakili satu karyawan
- Menampilkan informasi karyawan
- Menampilkan total jumlah pengecekan untuk karyawan tersebut
- Menampilkan 3 pengecekan terbaru
- Link "Lihat Semua Riwayat" untuk detail lengkap

**Manfaat:**
- Lihat riwayat lengkap per karyawan
- Identifikasi tren per karyawan
- Membandingkan pengecekan berbeda untuk karyawan yang sama

---

**📸 [TEMPAT SCREENSHOT E3]**
**Instruksi Screenshot:**
- Ambil screenshot tampilan terkelompok
- Tampilkan kartu karyawan dengan riwayat
- Tampilkan link "Lihat Semua Riwayat"
- Pastikan checkbox "Kelompokkan" tercentang
- Rekomendasi: Full page capture
- Ukuran yang disarankan: 1600x800

---

### 6.5 Tampilan Kartu

Setiap kartu pengecekan menampilkan:

**Informasi Header:**
- Nama lengkap karyawan
- Posisi karyawan
- ID Karyawan (jika ada)
- Badge versi pengecekan (contoh: v1, v2, v3)

**Detail Perangkat:**
- Tipe perangkat dengan ikon
- Kepemilikan perangkat
- Merk dan model perangkat

**Tanggal:**
- Tanggal pengecekan dalam format yang mudah dibaca

**Status Kesesuaian:**
- Badge dengan warna:
  - 🟢 Hijau - Sesuai
  - 🟡 Kuning - Terbatas
  - 🔴 Merah - Perlu Perbaikan
  - 🟣 Ungu - Tidak Sesuai

**Tombol Aksi:**
1. 👁️ Lihat (View) - Lihat detail lengkap pengecekan
2. 📥 Download - Unduh PDF pengecekan
3. ✏️ Edit - Edit pengecekan
4. 🗑️ Hapus - Hapus pengecekan (dengan konfirmasi)

---

**📸 [TEMPAT SCREENSHOT E4]**
**Instruksi Screenshot:**
- Ambil screenshot satu kartu pengecekan
- Tampilkan semua informasi di kartu
- Tampilkan badge status dengan warna
- Tampilkan semua tombol aksi
- Rekomendasi: Zoom in pada satu kartu (150%)
- Ukuran yang disarankan: 800x600

---

### 6.6 Mengedit Pengecekan

1. Klik tombol "Edit" pada kartu pengecekan
2. Halaman edit formulir akan terbuka
3. Form akan terisi dengan data pengecekan saat ini
4. Edit field yang diperlukan
5. Klik tombol "Simpan"
6. Data pengecekan akan diperbarui
7. Pesan sukses akan muncul

**Catatan:**
- Versi pengecekan akan otomatis increment
- Riwayat versi tersimpan di database

### 6.7 Menghapus Pengecekan

1. Klik tombol "Hapus" pada kartu pengecekan
2. Modal konfirmasi akan muncul
3. Baca pesan konfirmasi dengan cermat
4. Klik tombol "Hapus" (Delete) untuk konfirmasi
5. Atau klik "Batal" (Cancel) untuk membatalkan
6. Pengecekan akan dihapus dari database

⚠️ **Peringatan:** Penghapusan tidak dapat di-undo.

### 6.8 Ekspor PDF

**Cara Download PDF:**
1. Klik tombol "Download" pada kartu pengecekan
2. Sistem akan generate PDF secara otomatis
3. File PDF akan diunduh ke komputer

**Isi PDF:**
- Header dengan informasi karyawan
- Detail lengkap perangkat
- Sistem operasi dan spesifikasi
- Kondisi perangkat
- Semua aplikasi (kerja dan non-kerja)
- Status keamanan
- Informasi tambahan
- Footer dengan tanggal dan pemeriksa

**Penggunaan PDF:**
- Simpan untuk dokumentasi
- Kirim ke departemen terkait
- Arsip untuk referensi
- Lampiran untuk permintaan perbaikan
- Share dengan karyawan terkait

---

**📸 [TEMPAT SCREENSHOT E5]**
**Instruksi Screenshot:**
- Ambil screenshot kartu dengan tombol download
- Zoom in pada tombol download
- Rekomendasi: Zoom 200% pada tombol action
- Ukuran yang disarankan: 600x400

---

## 7. Pintasan Keyboard

### 7.1 Mengakses Bantuan

**Cara Membuka Modal Bantuan:**
1. Klik ikon bantuan (❓) di pojok kanan atas formulir
2. ATAU gunakan pintasan `Ctrl/Cmd + /`
3. Modal bantuan akan terbuka

---

**📸 [TEMPAT SCREENSHOT F1]**
**Instruksi Screenshot:**
- Ambil screenshot modal bantuan/help
- Tampilkan semua pintasan keyboard
- Tampilkan panduan langkah demi langkah
- Rekomendasi: Crop area help modal
- Ukuran yang disarankan: 1200x800

---

### 7.2 Daftar Pintasan Lengkap

| Pintasan | Fungsi | Kapan Digunakan |
|-----------|----------|----------------|
| `Ctrl/Cmd + S` | Simpan formulir | Kapan saja, untuk submit cepat |
| `Ctrl/Cmd + /` | Toggle bantuan/help | Saat butuh panduan |
| `Alt + 1` | Lompat ke bagian Karyawan | Navigasi cepat |
| `Alt + 2` | Lompat ke bagian Detail Perangkat | Navigasi cepat |
| `Alt + 3` | Lompat ke bagian Sistem Operasi | Navigasi cepat |
| `Alt + 4` | Lompat ke bagian Spesifikasi | Navigasi cepat |
| `Alt + 5` | Lompat ke bagian Kondisi Perangkat | Navigasi cepat |
| `Alt + 6` | Lompat ke bagian Aplikasi | Navigasi cepat |
| `Alt + 7` | Lompat ke bagian Keamanan | Navigasi cepat |
| `Alt + 8` | Lompat ke bagian Informasi Tambahan | Navigasi cepat |
| `Tab` | Pindah ke field berikutnya | Navigasi standar |
| `Shift + Tab` | Pindah ke field sebelumnya | Navigasi mundur |
| `Enter` | Submit formulir (di field catatan) | Submit cepat dari catatan |
| `Shift + Enter` | Baris baru (di field catatan) | Multi-line di catatan |
| `Esc` | Tutup modal | Menutup dialog/popup |

### 7.3 Panel Pintasan Melayang

**Lokasi:**
- Muncul di pojok kanan bawah layar
- Hanya pada halaman formulir
- Dapat ditutup/dibuka kembali

**Isi Panel:**
- Pintasan yang sering digunakan
- Link ke modal bantuan lengkap

**Menutup Panel:**
1. Klik tombol "X" kecil di panel
2. Panel akan hilang

**Membuka Kembali Panel:**
1. Klik ikon keyboard (⌨️) di pojok kanan bawah
2. Panel akan muncul kembali

---

**📸 [TEMPAT SCREENSHOT F2]**
**Instruksi Screenshot:**
- Ambil screenshot panel pintasan melayang
- Tampilkan ikon keyboard dan pintasan
- Tampilkan tombol tutup
- Rekomendasi: Zoom in pada panel (150%)
- Ukuran yang disarankan: 600x400

---

### 7.4 Tips Menggunakan Pintasan

**Pintasan Paling Berguna:**
1. **`Ctrl/Cmd + S`** - Submit formulir kapan saja
2. **`Alt + 1-8`** - Lompat antar bagian formulir
3. **`Tab`** - Navigasi cepat antar field
4. **`Ctrl/Cmd + /`** - Buka bantuan saat butuh

**Praktik Terbaik:**
- Gunakan `Tab` untuk navigasi cepat (lebih cepat dari mouse)
- Gunakan `Alt + 1-8` untuk lompat ke bagian tertentu
- Gunakan `Shift + Tab` untuk koreksi field sebelumnya
- Gunakan `Ctrl/Cmd + S` untuk submit tanpa scroll ke bawah

## 8. Pemecahan Masalah

### 8.1 Masalah Umum & Solusi

#### Masalah 1: Tidak Dapat Menemukan Karyawan di Dropdown

**Kemungkinan Penyebab:**
- Karyawan belum ditambahkan ke sistem
- Typo dalam nama pencarian
- Karyawan ditambahkan dengan nama berbeda

**Solusi:**
1. Buka halaman "Data Karyawan"
2. Cari karyawan dengan nama berbeda
3. Jika belum ada, tambahkan karyawan baru
4. Kembali ke formulir dan cari lagi

#### Masalah 2: Formulir Tidak Bisa Disubmit

**Kemungkinan Penyebab:**
- Ada field wajib yang kosong
- Validasi gagal
- Karyawan belum dipilih

**Solusi:**
1. Scroll ke atas formulir
2. Cari pesan error merah di bawah field
3. Isi field kosong yang ditandai
4. Perbaiki data yang salah
5. Coba submit lagi

#### Masalah 3: PDF Tidak Ter-Download

**Kemungkinan Penyebab:**
- Browser memblokir download
- Koneksi internet terputus
- Server sedang sibuk

**Solusi:**
1. Cek jika ada pesan error di browser
2. Perbolehkan download dari situs ini di pengaturan browser
3. Tunggu beberapa detik dan coba lagi
4. Refresh halaman dan coba download lagi

#### Masalah 4: Data Tidak Muncul di Dashboard

**Kemungkinan Penyebab:**
- Data baru belum disubmit
- Filter waktu aktif
- Cache browser

**Solusi:**
1. Pastikan formulir berhasil disubmit
2. Cek filter waktu di dashboard
3. Ubah filter ke "Semua Waktu"
4. Refresh halaman (F5 atau Ctrl+R)

#### Masalah 5: Import Excel Gagal

**Kemungkinan Penyebab:**
- Format file salah (bukan .xlsx)
- Kolom wajib kosong atau tidak ada
- Data tidak valid

**Solusi:**
1. Download template baru dari sistem
2. Isi template dengan format yang benar
3. Pastikan kolom "Nama Lengkap" dan "Bagian" terisi
4. Simpan sebagai .xlsx (bukan .xls)
5. Upload dan coba lagi

### 8.2 Mendapatkan Bantuan

**Jika Masalah Berlanjut:**

1. **Lihat Modal Bantuan** - Klik ikon ❓ di formulir
2. **Cek FAQ** - Lihat bagian FAQ di dokumen ini
3. **Hubungi Tim IT** - Mintakan bantuan dari tim teknis
4. **Tinggalkan Feedback** - Beri tahu tim tentang bug atau masalah

## 9. FAQ

### Q1: Bagaimana cara mengubah bahasa sistem?

**A:** Klik tombol bahasa (🌐 atau label "ID/EN") di menu navigasi bagian atas. Sistem akan beralih antara Bahasa Indonesia dan English secara instan.

### Q2: Apakah data tersimpan secara otomatis?

**A:** Tidak, data tidak disimpan secara otomatis. Anda harus mengklik tombol "Simpan" atau menggunakan pintasan `Ctrl/Cmd + S` untuk menyimpan data ke database.

### Q3: Bisakah saya mengedit pengecekan setelah disubmit?

**A:** Ya, Anda dapat mengedit pengecekan dengan mengklik tombol "Edit" pada kartu pengecekan di halaman "Data Pengecekan". Versi baru akan dibuat dan riwayat disimpan.

### Q4: Apa yang terjadi jika saya menghapus karyawan?

**A:** Menghapus karyawan akan menghapus semua pengecekan perangkat yang terkait dengan karyawan tersebut. Akan ada konfirmasi peringatan yang menunjukkan jumlah pengecekan yang akan dihapus.

### Q5: Bagaimana cara menggunakan fitur "Gunakan Versi Terakhir"?

**A:** 
1. Pilih karyawan dari dropdown
2. Centang kotak "Gunakan Versi Terakhir"
3. Tunggu beberapa detik saat data dimuat
4. Formulir akan terisi otomatis dengan data dari pengecekan terakhir karyawan tersebut
5. Review dan update bagian yang berubah sebelum submit

### Q6: Apakah field spesifikasi wajib diisi?

**A:** Tidak, semua field di bagian "Spesifikasi" (RAM, Prosesor, Storage) adalah opsional. Hanya field yang ditandai dengan * yang wajib diisi.

### Q7: Bisakah saya menambahkan merk/prosesor/RAM baru?

**A:** Ya, semua dropdown dengan fitur "creatable" memungkinkan Anda mengetik untuk membuat opsi baru. Opsi baru akan tersimpan dan tersedia untuk penggunaan berikutnya.

### Q8: Bagaimana cara menghapus opsi dari dropdown?

**A:** 
1. Klik dropdown yang ingin diedit
2. Klik tombol hapus (🗑️) di sebelah kanan opsi
3. Konfirmasi hapus
4. Opsi akan dihapus dari daftar

### Q9: Apa perbedaan antara status kesesuaian perangkat?

**A:**
- **Sesuai** - Perangkat berfungsi baik untuk pekerjaan
- **Terbatas** - Ada beberapa keterbatasan tapi masih bisa digunakan
- **Perlu Perbaikan** - Membutuhkan perbaikan segera
- **Tidak Sesuai** - Tidak layak untuk digunakan

### Q10: Bisakah saya mengecek perangkat yang sama dua kali?

**A:** Ya, Anda dapat melakukan pengecekan berkala untuk perangkat yang sama. Setiap pengecekan akan menjadi versi baru dan tersimpan sebagai riwayat terpisah.

### Q11: Bagaimana cara melihat riwayat lengkap karyawan?

**A:** 
1. Buka halaman "Data Pengecekan"
2. Centang "Kelompokkan Berdasarkan Karyawan"
3. Klik link "Lihat Semua Riwayat" pada kartu karyawan
4. Atau, dari halaman karyawan, klik tombol "Riwayat"

### Q12: Apakah ada batasan jumlah karyawan yang bisa diimport?

**A:** Tidak ada batasan hard-coded, tapi disarankan untuk import dalam batch kecil (50-100 karyawan) untuk menghindari timeout. Import besar bisa dilakukan dalam beberapa batch.

### Q13: Bagaimana cara melaporkan bug atau memberi saran?

**A:** Hubungi tim IT atau administrator sistem untuk melaporkan bug atau memberikan saran fitur. Sertakan detail seperti:
- Browser yang digunakan
- Screenshot error (jika ada)
- Langkah-langkah untuk mereplikasi masalah
- Deskripsi detail masalah/saran

### Q14: Apakah data aman?

**A:** Data tersimpan di database dengan standar keamanan. Pastikan untuk:
- Logout setelah selesai menggunakan sistem
- Jangan berbagi kredensial login
- Gunakan koneksi yang aman (HTTPS)
- Ikuti kebijakan keamanan perusahaan

### Q15: Bisakah saya mengecek perangkat tanpa karyawan?

**A:** Tidak, sistem memerlukan karyawan untuk setiap pengecekan perangkat. Karyawan harus ditambahkan terlebih dahulu di halaman "Data Karyawan".

---

## 📚 Sumber Tambahan

### Dokumen Terkait:
- [Presentation Outline](./PRESENTATION_OUTLINE.md) - Outline presentasi PowerPoint
- [API Documentation](./api/) - Dokumentasi API (untuk developer)

### Kontak & Support:
- Tim IT Support
- Administrator Sistem
- Helpdesk Perusahaan

---

**Dokumen ini adalah Panduan Pengguna resmi untuk Sistem Pengecekan Perangkat**
**Versi:** 1.0  
**Tanggal:** 13 Februari 2026  
**Dokumentasi dibuat oleh:** Cline AI Assistant  
**Hak Cipta:** © 2026 Teknologi Kartu Indonesia

---

*Terima kasih telah menggunakan Sistem Pengecekan Perangkat!*