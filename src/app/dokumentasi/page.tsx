'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function DokumentasiPage() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'pendahuluan', label: 'Pendahuluan', labelEn: 'Introduction' },
    { id: 'memulai-sistem', label: 'Memulai Sistem', labelEn: 'Getting Started' },
    { id: 'panduan-dashboard', label: 'Panduan Dashboard', labelEn: 'Dashboard Guide' },
    { id: 'manajemen-karyawan', label: 'Manajemen Karyawan', labelEn: 'Employee Management' },
    { id: 'formulir-pengecekan', label: 'Formulir Pengecekan', labelEn: 'Device Check Form' },
    { id: 'melihat-data', label: 'Melihat Data Pengecekan', labelEn: 'Viewing Check Data' },
    { id: 'pintasan-keyboard', label: 'Pintasan Keyboard', labelEn: 'Keyboard Shortcuts' },
    { id: 'pemecahan-masalah', label: 'Pemecahan Masalah', labelEn: 'Troubleshooting' },
    { id: 'faq', label: 'FAQ', labelEn: 'FAQ' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 200;
    const currentSection = sections.find((section) => {
      const element = document.getElementById(section.id);
      if (element !== null) {
        return element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition;
      }
      return false;
    });
    if (currentSection !== undefined) {
      setActiveSection(currentSection.id);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset to account for both sticky headers + extra padding
      // Main header: 64px, Doc header: ~80px, extra padding: 16px = 160px total
      const offset = 160;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isIndonesian = language === 'id';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {isIndonesian ? 'Panduan Pengguna' : 'User Manual'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isIndonesian ? 'Sistem Pengecekan Perangkat' : 'Device Checking System'}
              </p>
            </div>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              {isIndonesian ? 'Cetak' : 'Print'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Table of Contents - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-[160px]">
              <h2 className="font-semibold mb-4 text-sm">
                {isIndonesian ? 'Daftar Isi' : 'Table of Contents'}
              </h2>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {index + 1}. {isIndonesian ? section.label : section.labelEn}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-4xl">
            {/* Version Info */}
            <Card className="mb-8 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{isIndonesian ? 'Versi' : 'Version'}</p>
                  <p className="font-semibold">1.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isIndonesian ? 'Tanggal' : 'Date'}</p>
                  <p className="font-semibold">13 Februari 2026</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isIndonesian ? 'Bahasa' : 'Language'}</p>
                  <p className="font-semibold">{isIndonesian ? 'Indonesia' : 'English'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isIndonesian ? 'Platform' : 'Platform'}</p>
                  <p className="font-semibold">Web-based Application</p>
                </div>
              </div>
            </Card>

            {/* Section 1: Pendahuluan */}
            <section id="pendahuluan" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '1. Pendahuluan' : '1. Introduction'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Tentang Sistem Ini' : 'About This System'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {isIndonesian
                      ? 'Sistem Pengecekan Perangkat adalah aplikasi berbasis web yang dirancang untuk membantu organisasi mengelola dan melacak pengecekan perangkat karyawan secara efisien. Sistem ini menyediakan antarmuka yang intuitif untuk mencatat detail lengkap tentang perangkat PC dan Laptop, termasuk spesifikasi, kondisi, aplikasi yang terinstal, dan status keamanan.'
                      : 'The Device Checking System is a web-based application designed to help organizations manage and track employee device checks efficiently. This system provides an intuitive interface to record complete details about PC and Laptop devices, including specifications, condition, installed applications, and security status.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Siapa yang Harus Menggunakannya?' : 'Who Should Use It?'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <strong>{isIndonesian ? 'Tim IT Support' : 'IT Support Team'}</strong> - {isIndonesian ? 'Melakukan dan mencatat pengecekan perangkat' : 'Performing and recording device checks'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Manajer Perangkat' : 'Device Managers'}</strong> - {isIndonesian ? 'Mengawasi status perangkat dan kebutuhan perbaikan' : 'Supervising device status and repair needs'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Staff HR' : 'HR Staff'}</strong> - {isIndonesian ? 'Mengelola data karyawan dan memantau aset' : 'Managing employee data and monitoring assets'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'PIC Pengecekan Perangkat' : 'Device Check PIC'}</strong> - {isIndonesian ? 'Melaksanakan pengecekan rutin' : 'Performing routine checks'}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Fitur Utama' : 'Key Features'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>✅ <strong>{isIndonesian ? 'Dashboard Komprehensif' : 'Comprehensive Dashboard'}</strong> - {isIndonesian ? 'Statistik real-time, grafik analitik, dan alert' : 'Real-time statistics, analytics charts, and alerts'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Manajemen Karyawan' : 'Employee Management'}</strong> - {isIndonesian ? 'Tambah, edit, dan import data karyawan dari Excel' : 'Add, edit, and import employee data from Excel'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Formulir Pengecekan Terstruktur' : 'Structured Check Form'}</strong> - {isIndonesian ? '8 bagian lengkap dengan validasi' : '8 complete sections with validation'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Pencarian Canggih' : 'Advanced Search'}</strong> - {isIndonesian ? 'Cari dan filter data dengan mudah' : 'Search and filter data easily'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Ekspor PDF' : 'PDF Export'}</strong> - {isIndonesian ? 'Generate laporan profesional otomatis' : 'Generate professional reports automatically'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Dukungan Bilingual' : 'Bilingual Support'}</strong> - {isIndonesian ? 'Beralih antara Bahasa Indonesia dan English' : 'Switch between Indonesian and English'}</li>
                    <li>✅ <strong>{isIndonesian ? 'Pintasan Keyboard' : 'Keyboard Shortcuts'}</strong> - {isIndonesian ? 'Bekerja lebih cepat dengan keyboard shortcuts' : 'Work faster with keyboard shortcuts'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Persyaratan Sistem' : 'System Requirements'}
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <strong>{isIndonesian ? 'Untuk Menggunakan Sistem:' : 'To Use the System:'}</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      <li>{isIndonesian ? 'Browser web modern (Chrome, Firefox, Safari, Edge)' : 'Modern web browser (Chrome, Firefox, Safari, Edge)'}</li>
                      <li>{isIndonesian ? 'Koneksi internet aktif' : 'Active internet connection'}</li>
                      <li>{isIndonesian ? 'Akun user dengan akses sistem' : 'User account with system access'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Screenshot Placeholder A1 */}
              <ScreenshotPlaceholder
                id="A1"
                label={isIndonesian ? 'Screenshot Header dan Navigasi' : 'Header and Navigation Screenshot'}
                instructions={
                  isIndonesian
                    ? 'Ambil screenshot header dengan menu navigasi. Tampilkan semua 4 menu utama dan tombol toggle bahasa.'
                    : 'Take screenshot of header with navigation menu. Show all 4 main menus and language toggle button.'
                }
                dimensions="1600x200"
              />
            </section>

            {/* Section 2: Memulai Sistem */}
            <section id="memulai-sistem" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '2. Memulai Sistem' : '2. Getting Started'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mengakses Sistem' : 'Accessing the System'}
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Buka browser web' : 'Open web browser'}</li>
                    <li>{isIndonesian ? 'Masukkan URL sistem (contoh: http://localhost:3000)' : 'Enter system URL (e.g., http://localhost:3000)'}</li>
                    <li>{isIndonesian ? 'Halaman Dashboard akan terbuka secara otomatis' : 'Dashboard page will open automatically'}</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mengubah Bahasa' : 'Changing Language'}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {isIndonesian
                      ? 'Sistem mendukung dua bahasa:'
                      : 'The system supports two languages:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Lihat menu navigasi di bagian atas' : 'Look at the navigation menu at the top'}</li>
                    <li>{isIndonesian ? 'Klik tombol bahasa (🌐 icon atau label "ID/EN")' : 'Click the language button (🌐 icon or "ID/EN" label)'}</li>
                    <li>{isIndonesian ? 'Sistem akan beralih bahasa secara instan' : 'System will switch language instantly'}</li>
                    <li>{isIndonesian ? 'Preferensi bahasa akan tersimpan' : 'Language preference will be saved'}</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Menu Navigasi' : 'Navigation Menu'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <strong>{isIndonesian ? 'Dashboard' : 'Dashboard'}</strong> - {isIndonesian ? 'Halaman utama dengan statistik dan grafik' : 'Main page with statistics and charts'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Formulir' : 'Form'}</strong> - {isIndonesian ? 'Form pengecekan perangkat' : 'Device check form'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Data Pengecekan' : 'Check Data'}</strong> - {isIndonesian ? 'Daftar semua pengecekan perangkat' : 'List of all device checks'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Data Karyawan' : 'Employee Data'}</strong> - {isIndonesian ? 'Daftar semua karyawan' : 'List of all employees'}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Panduan Dashboard */}
            <section id="panduan-dashboard" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '3. Panduan Dashboard' : '3. Dashboard Guide'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Gambaran Dashboard' : 'Dashboard Overview'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {isIndonesian
                      ? 'Dashboard adalah halaman utama yang menampilkan ringkasan statistik dan analitik tentang semua pengecekan perangkat yang telah dilakukan.'
                      : 'Dashboard is the main page displaying summary statistics and analytics about all device checks that have been performed.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Kartu Statistik' : 'Statistics Cards'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <strong>{isIndonesian ? 'Total Pengecekan' : 'Total Checks'}</strong> - {isIndonesian ? 'Menampilkan jumlah total semua pengecekan perangkat' : 'Displays total number of all device checks'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Total Karyawan' : 'Total Employees'}</strong> - {isIndonesian ? 'Menampilkan jumlah total karyawan terdaftar' : 'Displays total number of registered employees'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Total Perangkat' : 'Total Devices'}</strong> - {isIndonesian ? 'Menampilkan breakdown PC dan Laptop' : 'Displays PC and Laptop breakdown'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Perangkat Urgent' : 'Urgent Devices'}</strong> - {isIndonesian ? 'Menampilkan jumlah perangkat yang membutuhkan perhatian segera' : 'Displays number of devices needing immediate attention'}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Grafik dan Analitik' : 'Charts and Analytics'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian
                      ? 'Dashboard menampilkan berbagai grafik untuk analisis data: Distribusi Tipe Perangkat, Kepemilikan Perangkat, Kesesuaian Perangkat, Distribusi Sistem Operasi, Status Lisensi OS, Status Keamanan, Tren Pengecekan, dan Breakdown Departemen.'
                      : 'Dashboard displays various charts for data analysis: Device Type Distribution, Device Ownership, Device Suitability, OS Distribution, License Status, Security Status, Check Trends, and Department Breakdown.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Perangkat Urgent' : 'Urgent Devices'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian
                      ? 'Bagian ini menampilkan perangkat dengan status "Needs Repair" atau "Unsuitable" yang membutuhkan perhatian segera.'
                      : 'This section displays devices with "Needs Repair" or "Unsuitable" status that need immediate attention.'}
                  </p>
                </div>
              </div>

              <ScreenshotPlaceholder
                id="B1"
                label={isIndonesian ? 'Screenshot Dashboard Statistik' : 'Dashboard Statistics Screenshot'}
                instructions={isIndonesian ? 'Ambil screenshot kartu statistik di dashboard.' : 'Take screenshot of statistics cards on dashboard.'}
                dimensions="1400x400"
              />
            </section>

            {/* Section 4: Manajemen Karyawan */}
            <section id="manajemen-karyawan" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '4. Manajemen Karyawan' : '4. Employee Management'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mengakses Halaman Karyawan' : 'Accessing Employee Page'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian ? 'Klik menu "Data Karyawan" di header untuk membuka halaman daftar karyawan.' : 'Click "Data Karyawan" menu in header to open employee list page.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Menambah Karyawan Baru' : 'Adding New Employee'}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>{isIndonesian ? 'Manual:' : 'Manual:'}</strong> {isIndonesian ? 'Klik tombol "Tambah Karyawan" dan isi formulir.' : 'Click "Tambah Karyawan" button and fill the form.'}</p>
                    <p><strong>{isIndonesian ? 'Import Excel:' : 'Excel Import:'}</strong> {isIndonesian ? 'Klik tombol "Import", download template, isi data, dan upload file.' : 'Click "Import" button, download template, fill data, and upload file.'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mencari dan Filter Karyawan' : 'Searching and Filtering Employees'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Gunakan kotak pencarian untuk mencari nama, posisi, atau ID karyawan' : 'Use search box to find name, position, or employee ID'}</li>
                    <li>{isIndonesian ? 'Filter berdasarkan departemen' : 'Filter by department'}</li>
                    <li>{isIndonesian ? 'Filter berdasarkan status (Aktif/Tidak Aktif/Mengundurkan Diri)' : 'Filter by status (Active/Inactive/Resigned)'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mengedit dan Menghapus Karyawan' : 'Editing and Deleting Employees'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian
                      ? 'Klik tombol "Edit" atau "Hapus" pada kartu karyawan untuk mengubah atau menghapus data. Peringatan akan muncul saat menghapus karyawan yang memiliki pengecekan.'
                      : 'Click "Edit" or "Hapus" buttons on employee card to change or delete data. Warning will appear when deleting employee with checks.'}
                  </p>
                </div>
              </div>

              <ScreenshotPlaceholder
                id="C1"
                label={isIndonesian ? 'Screenshot Halaman Karyawan' : 'Employee Page Screenshot'}
                instructions={isIndonesian ? 'Ambil screenshot halaman Data Karyawan dengan grid kartu.' : 'Take screenshot of Data Karyawan page with card grid.'}
                dimensions="1600x800"
              />
            </section>

            {/* Section 5: Formulir Pengecekan */}
            <section id="formulir-pengecekan" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '5. Formulir Pengecekan Perangkat' : '5. Device Check Form'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Navigasi Formulir' : 'Form Navigation'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Sidebar navigasi di layar besar (8 bagian formulir)' : 'Navigation sidebar on large screen (8 form sections)'}</li>
                    <li>{isIndonesian ? 'Gunakan Alt + 1-8 untuk lompat ke bagian tertentu' : 'Use Alt + 1-8 to jump to specific section'}</li>
                    <li>{isIndonesian ? 'Gunakan Tab untuk navigasi cepat antar field' : 'Use Tab for quick navigation between fields'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? '8 Bagian Formulir' : '8 Form Sections'}
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><strong>{isIndonesian ? 'Informasi Karyawan' : 'Employee Information'}</strong> - {isIndonesian ? 'Pilih karyawan dan tanggal pengecekan' : 'Select employee and check date'}</li>
                    <li><strong>{isIndonesian ? 'Detail Perangkat' : 'Device Details'}</strong> - {isIndonesian ? 'Tipe, kepemilikan, merk, model, nomor seri (wajib)' : 'Type, ownership, brand, model, serial number (required)'}</li>
                    <li><strong>{isIndonesian ? 'Sistem Operasi' : 'Operating System'}</strong> - {isIndonesian ? 'Tipe OS, versi, lisensi (wajib)' : 'OS type, version, license (required)'}</li>
                    <li><strong>{isIndonesian ? 'Spesifikasi' : 'Specifications'}</strong> - {isIndonesian ? 'RAM, prosesor, storage (opsional)' : 'RAM, processor, storage (optional)'}</li>
                    <li><strong>{isIndonesian ? 'Kondisi Perangkat' : 'Device Condition'}</strong> - {isIndonesian ? 'Status kesesuaian dan kondisi komponen' : 'Suitability status and component condition'}</li>
                    <li><strong>{isIndonesian ? 'Aplikasi' : 'Applications'}</strong> - {isIndonesian ? 'Aplikasi kerja dan non-kerja' : 'Work and non-work applications'}</li>
                    <li><strong>{isIndonesian ? 'Keamanan' : 'Security'}</strong> - {isIndonesian ? 'Antivirus dan VPN' : 'Antivirus and VPN'}</li>
                    <li><strong>{isIndonesian ? 'Informasi Tambahan' : 'Additional Information'}</strong> - {isIndonesian ? 'Password usage, PIC pemeriksa, catatan' : 'Password usage, PIC, notes'}</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Fitur Unggulan' : 'Key Features'}
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>{isIndonesian ? 'Gunakan Versi Terakhir' : 'Use Last Version'}</strong> - {isIndonesian ? 'Auto-fill formulir dengan data dari pengecekan terakhir karyawan' : 'Auto-fill form with data from employee\'s last check'}</p>
                    <p><strong>{isIndonesian ? 'Creatable Dropdown' : 'Creatable Dropdown'}</strong> - {isIndonesian ? 'Tambahkan opsi baru langsung dari dropdown' : 'Add new options directly from dropdown'}</p>
                    <p><strong>{isIndonesian ? 'Validasi Wajib' : 'Required Validation'}</strong> - {isIndonesian ? 'Semua field wajib divalidasi sebelum submit' : 'All required fields validated before submit'}</p>
                  </div>
                </div>
              </div>

              <ScreenshotPlaceholder
                id="D1"
                label={isIndonesian ? 'Screenshot Formulir Lengkap' : 'Complete Form Screenshot'}
                instructions={isIndonesian ? 'Ambil screenshot halaman formulir lengkap dengan sidebar navigasi.' : 'Take screenshot of complete form page with navigation sidebar.'}
                dimensions="1920x1080"
              />
            </section>

            {/* Section 6: Melihat Data Pengecekan */}
            <section id="melihat-data" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '6. Melihat Data Pengecekan' : '6. Viewing Check Data'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mengakses Halaman Data' : 'Accessing Data Page'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian ? 'Klik menu "Data Pengecekan" di header untuk melihat semua pengecekan perangkat.' : 'Click "Data Pengecekan" menu in header to view all device checks.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Pencarian dan Filter' : 'Search and Filter'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Pencarian real-time: nama karyawan, ID, merk, model' : 'Real-time search: employee name, ID, brand, model'}</li>
                    <li>{isIndonesian ? 'Filter kondisi: Sesuai, Terbatas, Perlu Perbaikan, Tidak Sesuai' : 'Filter condition: Suitable, Limited, Needs Repair, Unsuitable'}</li>
                    <li>{isIndonesian ? 'Filter kepemilikan: Perusahaan atau Pribadi' : 'Filter ownership: Company or Personal'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Tampilan Terkelompok' : 'Grouped View'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian
                      ? 'Centang "Kelompokkan Berdasarkan Karyawan" untuk melihat riwayat lengkap per karyawan dalam satu kartu.'
                      : 'Check "Kelompokkan Berdasarkan Karyawan" to view complete history per employee in one card.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Tombol Aksi' : 'Action Buttons'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <strong>{isIndonesian ? 'Lihat (View)' : 'View (Lihat)'}</strong> - {isIndonesian ? 'Lihat detail lengkap pengecekan' : 'View complete check details'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Download' : 'Download'}</strong> - {isIndonesian ? 'Unduh PDF laporan pengecekan' : 'Download check report PDF'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Edit' : 'Edit'}</strong> - {isIndonesian ? 'Edit data pengecekan' : 'Edit check data'}
                    </li>
                    <li>
                      <strong>{isIndonesian ? 'Hapus' : 'Delete'}</strong> - {isIndonesian ? 'Hapus pengecekan dengan konfirmasi' : 'Delete check with confirmation'}
                    </li>
                  </ul>
                </div>
              </div>

              <ScreenshotPlaceholder
                id="E1"
                label={isIndonesian ? 'Screenshot Data Pengecekan' : 'Check Data Screenshot'}
                instructions={isIndonesian ? 'Ambil screenshot halaman Data Pengecekan dengan grid kartu.' : 'Take screenshot of Data Pengecekan page with card grid.'}
                dimensions="1600x900"
              />
            </section>

            {/* Section 7: Pintasan Keyboard */}
            <section id="pintasan-keyboard" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '7. Pintasan Keyboard' : '7. Keyboard Shortcuts'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Daftar Pintasan Lengkap' : 'Complete Shortcut List'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'Ctrl/Cmd + S', desc: isIndonesian ? 'Simpan formulir' : 'Save form' },
                      { key: 'Ctrl/Cmd + /', desc: isIndonesian ? 'Toggle bantuan/help' : 'Toggle help' },
                      { key: 'Alt + 1-8', desc: isIndonesian ? 'Lompat ke bagian formulir' : 'Jump to form section' },
                      { key: 'Tab', desc: isIndonesian ? 'Pindah ke field berikutnya' : 'Move to next field' },
                      { key: 'Shift + Tab', desc: isIndonesian ? 'Pindah ke field sebelumnya' : 'Move to previous field' },
                      { key: 'Enter', desc: isIndonesian ? 'Submit formulir (di catatan)' : 'Submit form (in notes)' },
                      { key: 'Shift + Enter', desc: isIndonesian ? 'Baris baru (di catatan)' : 'New line (in notes)' },
                      { key: 'Esc', desc: isIndonesian ? 'Tutup modal' : 'Close modal' },
                    ].map((item, index) => (
                      <Card key={index} className="p-3">
                        <p className="font-mono text-sm font-semibold mb-1">{item.key}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Panel Pintasan Melayang' : 'Floating Shortcut Panel'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isIndonesian
                      ? 'Panel pintasan muncul di pojok kanan bawah layar formulir. Bisa ditutup/dibuka kembali dengan ikon keyboard (⌨️).'
                      : 'Shortcut panel appears at bottom-right corner of form screen. Can be closed/opened with keyboard icon (⌨️).'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Tips Penggunaan' : 'Usage Tips'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Gunakan Tab untuk navigasi cepat (lebih cepat dari mouse)' : 'Use Tab for quick navigation (faster than mouse)'}</li>
                    <li>{isIndonesian ? 'Gunakan Alt + 1-8 untuk lompat ke bagian tertentu' : 'Use Alt + 1-8 to jump to specific section'}</li>
                    <li>{isIndonesian ? 'Gunakan Ctrl/Cmd + S untuk submit tanpa scroll' : 'Use Ctrl/Cmd + S to submit without scrolling'}</li>
                  </ul>
                </div>
              </div>

              <ScreenshotPlaceholder
                id="F1"
                label={isIndonesian ? 'Screenshot Modal Bantuan' : 'Help Modal Screenshot'}
                instructions={isIndonesian ? 'Ambil screenshot modal bantuan/help dengan daftar pintasan keyboard.' : 'Take screenshot of help modal with keyboard shortcut list.'}
                dimensions="1200x800"
              />
            </section>

            {/* Section 8: Pemecahan Masalah */}
            <section id="pemecahan-masalah" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '8. Pemecahan Masalah' : '8. Troubleshooting'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Masalah Umum & Solusi' : 'Common Issues & Solutions'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: isIndonesian ? 'Tidak Dapat Menemukan Karyawan' : 'Cannot Find Employee',
                        solution: isIndonesian
                          ? 'Cek halaman Data Karyawan dengan nama berbeda. Jika belum ada, tambahkan karyawan baru.'
                          : 'Check Data Karyawan page with different name. If not found, add new employee.'
                      },
                      {
                        title: isIndonesian ? 'Formulir Tidak Bisa Disubmit' : 'Form Cannot Be Submitted',
                        solution: isIndonesian
                          ? 'Cari pesan error merah di bawah field. Isi field wajib yang kosong.'
                          : 'Look for red error messages under fields. Fill empty required fields.'
                      },
                      {
                        title: isIndonesian ? 'PDF Tidak Ter-Download' : 'PDF Not Downloading',
                        solution: isIndonesian
                          ? 'Cek jika browser memblokir download. Tunggu beberapa detik dan coba lagi.'
                          : 'Check if browser is blocking download. Wait a few seconds and try again.'
                      },
                      {
                        title: isIndonesian ? 'Data Tidak Muncul di Dashboard' : 'Data Not Appearing in Dashboard',
                        solution: isIndonesian
                          ? 'Pastikan formulir berhasil disubmit. Cek filter waktu (ubah ke "Semua Waktu"). Refresh halaman.'
                          : 'Ensure form was submitted successfully. Check time filter (change to "All Time"). Refresh page.'
                      },
                      {
                        title: isIndonesian ? 'Import Excel Gagal' : 'Excel Import Failed',
                        solution: isIndonesian
                          ? 'Download template baru. Pastikan kolom "Nama Lengkap" dan "Bagian" terisi. Simpan sebagai .xlsx.'
                          : 'Download new template. Ensure "Nama Lengkap" and "Bagian" columns are filled. Save as .xlsx.'
                      },
                    ].map((item, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold mb-2 text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.solution}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {isIndonesian ? 'Mendapatkan Bantuan' : 'Getting Help'}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{isIndonesian ? 'Lihat Modal Bantuan - Klik ikon ❓ di formulir' : 'View Help Modal - Click ❓ icon on form'}</li>
                    <li>{isIndonesian ? 'Cek FAQ di dokumen ini' : 'Check FAQ in this document'}</li>
                    <li>{isIndonesian ? 'Hubungi Tim IT untuk bantuan teknis' : 'Contact IT Team for technical assistance'}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9: FAQ */}
            <section id="faq" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {isIndonesian ? '9. FAQ' : '9. FAQ'}
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: isIndonesian ? 'Q1: Bagaimana cara mengubah bahasa sistem?' : 'Q1: How do I change the system language?',
                    a: isIndonesian ? 'Klik tombol bahasa (🌐 atau label "ID/EN") di menu navigasi bagian atas. Sistem akan beralih antara Bahasa Indonesia dan English secara instan.' : 'Click the language button (🌐 or "ID/EN" label) in the top navigation menu. The system will switch between Indonesian and English instantly.'
                  },
                  {
                    q: isIndonesian ? 'Q2: Apakah data tersimpan secara otomatis?' : 'Q2: Is data saved automatically?',
                    a: isIndonesian ? 'Tidak, data tidak disimpan secara otomatis. Anda harus mengklik tombol "Simpan" atau menggunakan pintasan Ctrl/Cmd + S untuk menyimpan data ke database.' : 'No, data is not saved automatically. You must click the "Simpan" button or use the Ctrl/Cmd + S shortcut to save data to the database.'
                  },
                  {
                    q: isIndonesian ? 'Q3: Bisakah saya mengedit pengecekan setelah disubmit?' : 'Q3: Can I edit a check after submitting?',
                    a: isIndonesian ? 'Ya, Anda dapat mengedit pengecekan dengan mengklik tombol "Edit" pada kartu pengecekan di halaman "Data Pengecekan". Versi baru akan dibuat dan riwayat disimpan.' : 'Yes, you can edit a check by clicking the "Edit" button on the check card in "Data Pengecekan" page. A new version will be created and history saved.'
                  },
                  {
                    q: isIndonesian ? 'Q4: Apa yang terjadi jika saya menghapus karyawan?' : 'Q4: What happens if I delete an employee?',
                    a: isIndonesian ? 'Menghapus karyawan akan menghapus semua pengecekan perangkat yang terkait dengan karyawan tersebut. Akan ada konfirmasi peringatan yang menunjukkan jumlah pengecekan yang akan dihapus.' : 'Deleting an employee will delete all device checks associated with that employee. There will be a warning confirmation showing the number of checks to be deleted.'
                  },
                  {
                    q: isIndonesian ? 'Q5: Bagaimana cara menggunakan fitur "Gunakan Versi Terakhir"?' : 'Q5: How do I use the "Use Last Version" feature?',
                    a: isIndonesian ? '1. Pilih karyawan dari dropdown. 2. Centang kotak "Gunakan Versi Terakhir". 3. Tunggu beberapa detik saat data dimuat. 4. Formulir akan terisi otomatis. 5. Review dan update bagian yang berubah.' : '1. Select employee from dropdown. 2. Check the "Gunakan Versi Terakhir" box. 3. Wait a few seconds while data loads. 4. Form will auto-fill. 5. Review and update changed sections.'
                  },
                  {
                    q: isIndonesian ? 'Q6: Apakah field spesifikasi wajib diisi?' : 'Q6: Are specification fields required?',
                    a: isIndonesian ? 'Tidak, semua field di bagian "Spesifikasi" (RAM, Prosesor, Storage) adalah opsional. Hanya field yang ditandai dengan * yang wajib diisi.' : 'No, all fields in the "Spesifikasi" section (RAM, Processor, Storage) are optional. Only fields marked with * are required.'
                  },
                  {
                    q: isIndonesian ? 'Q7: Bisakah saya menambahkan merk/prosesor/RAM baru?' : 'Q7: Can I add new brand/processor/RAM?',
                    a: isIndonesian ? 'Ya, semua dropdown dengan fitur "creatable" memungkinkan Anda mengetik untuk membuat opsi baru. Opsi baru akan tersimpan dan tersedia untuk penggunaan berikutnya.' : 'Yes, all dropdowns with "creatable" feature allow you to type to create new options. New options will be saved and available for future use.'
                  },
                  {
                    q: isIndonesian ? 'Q8: Apa perbedaan antara status kesesuaian perangkat?' : 'Q8: What is the difference between device suitability statuses?',
                    a: isIndonesian ? 'Sesuai - Perangkat berfungsi baik. Terbatas - Ada keterbatasan tapi masih bisa digunakan. Perlu Perbaikan - Membutuhkan perbaikan segera. Tidak Sesuai - Tidak layak untuk digunakan.' : 'Suitable - Device works well. Limited - Some limitations but still usable. Needs Repair - Needs immediate repair. Unsuitable - Not suitable for use.'
                  },
                  {
                    q: isIndonesian ? 'Q9: Bagaimana cara melihat riwayat lengkap karyawan?' : 'Q9: How do I view complete employee history?',
                    a: isIndonesian ? '1. Buka halaman "Data Pengecekan". 2. Centang "Kelompokkan Berdasarkan Karyawan". 3. Klik link "Lihat Semua Riwayat" pada kartu karyawan. 4. Atau, dari halaman karyawan, klik tombol "Riwayat".' : '1. Open "Data Pengecekan" page. 2. Check "Kelompokkan Berdasarkan Karyawan". 3. Click "Lihat Semua Riwayat" link on the employee card. 4. Or, from the employee page, click the "Riwayat" button.'
                  },
                  {
                    q: isIndonesian ? 'Q10: Apakah data aman?' : 'Q10: Is data secure?',
                    a: isIndonesian ? 'Data tersimpan di database dengan standar keamanan. Pastikan untuk: Logout setelah selesai, Jangan berbagi kredensial, Gunakan koneksi aman, Ikuti kebijakan keamanan perusahaan.' : 'Data is stored in database with security standards. Ensure to: Logout after use, Don\'t share credentials, Use secure connection, Follow company security policy.'
                  },
                ].map((faq, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
              <p className="mb-2">
                {isIndonesian ? 'Dokumen ini adalah Panduan Pengguna resmi untuk Sistem Pengecekan Perangkat' : 'This document is the official User Manual for the Device Checking System'}
              </p>
              <p className="mb-2">
                <strong>{isIndonesian ? 'Versi:' : 'Version:'}</strong> 1.0 | <strong>{isIndonesian ? 'Tanggal:' : 'Date:'}</strong> 13 Februari 2026
              </p>
              <p>
                {isIndonesian ? 'Dokumentasi dibuat oleh: Cline AI Assistant' : 'Documentation created by: Cline AI Assistant'}
              </p>
              <p className="mt-4">
                {isIndonesian ? '© 2026 Teknologi Kartu Indonesia' : '© 2026 Teknologi Kartu Indonesia'}
              </p>
              <p className="mt-2 italic">
                {isIndonesian ? '*Terima kasih telah menggunakan Sistem Pengecekan Perangkat!*' : '*Thank you for using the Device Checking System!*'}
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Table of Contents - Bottom Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => document.getElementById('mobile-toc')?.classList.toggle('hidden')}
          size="icon"
          className="rounded-full shadow-lg"
        >
          📋
        </Button>
      </div>
      <div id="mobile-toc" className="hidden fixed bottom-16 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-sm">
          {isIndonesian ? 'Daftar Isi' : 'Table of Contents'}
        </h3>
        <nav className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                scrollToSection(section.id);
                document.getElementById('mobile-toc')?.classList.add('hidden');
              }}
              className="block w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-accent"
            >
              {index + 1}. {isIndonesian ? section.label : section.labelEn}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function ScreenshotPlaceholder({ id, label, instructions, dimensions }: { id: string; label: string; instructions: string; dimensions: string }) {
  return (
    <Card className="p-6 border-2 border-dashed border-muted-foreground/30 bg-muted/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">📸</div>
        <div>
          <p className="font-semibold text-lg">{label}</p>
          <p className="text-sm text-muted-foreground">
            <strong>TEMPAT SCREENSHOT {id}</strong>
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong>{label.includes('Screenshot') ? 'Instruksi Screenshot:' : 'Screenshot Instructions:'}</strong>
        </p>
        <p>{instructions}</p>
        <p>
          <strong>Rekomendasi:</strong> Crop area sesuai
        </p>
        <p>
          <strong>Ukuran yang disarankan:</strong> {dimensions}
        </p>
      </div>
    </Card>
  );
}