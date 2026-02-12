"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Keyboard } from "lucide-react";

// Type definitions
interface Screenshot {
  label: string;
  instruction: string;
  recommendedSize: string;
}

interface Point {
  text: string;
  type?: string;
}

interface Subsection {
  title: string;
  items: string[];
}

interface Statistic {
  label: string;
  desc: string;
}

interface WarningCard {
  status: string;
  color: string;
  desc: string;
}

interface Feature {
  title: string;
  desc?: string;
  items?: string[];
  fields?: string[];
}

interface FieldOption {
  label: string;
  desc?: string;
  options?: string[] | { label: string; desc: string }[];
  required?: boolean;
}

interface Section {
  title: string;
  fields?: FieldOption[];
  subsections?: {
    title: string;
    desc: string;
    fields?: string[];
  }[];
  components?: {
    name: string;
    examples: string[];
  }[];
  tips?: string[];
}

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content?: string | null;
  points?: Point[];
  subsections?: Subsection[];
  statistics?: Statistic[];
  charts?: string[];
  warningCards?: WarningCard[];
  actions?: string[];
  features?: Feature[];
  steps?: string[];
  highlight?: string;
  fields?: FieldOption[];
  sections?: Section[];
  validation?: string;
  shortcuts?: string[];
  panelInfo?: string;
  benefits?: string[];
  nextSteps?: string[];
  contact?: string;
  screenshot?: Screenshot;
}

// Slide data dari PRESENTATION_OUTLINE.md
const slides: Slide[] = [
  {
    id: 1,
    title: "Sistem Pengecekan Perangkat",
    subtitle: "Platform Manajemen dan Pelacakan Perangkat Karyawan yang Efisien",
    content: null,
    screenshot: {
      label: "Dashboard Utama",
      instruction: "Ambil screenshot dari halaman Dashboard utama dengan grafik dan statistik",
      recommendedSize: "1920x1080 atau 16:9"
    }
  },
  {
    id: 2,
    title: "Apa itu Sistem Pengecekan Perangkat?",
    points: [
      { text: "Sistem berbasis web untuk manajemen pengecekan perangkat karyawan", type: "main" },
      { text: "Pelacakan komprehensif untuk PC dan Laptop", type: "main" },
      { text: "Analitik dan statistik real-time", type: "main" },
      { text: "Dukungan bilingual (Indonesia/Inggris)", type: "main" }
    ],
    subsections: [
      {
        title: "Pengguna Target",
        items: ["Tim IT Support", "Manajer Perangkat", "Staff HR", "PIC Pengecekan Perangkat"]
      },
      {
        title: "Manfaat Utama",
        items: ["Tersentralisasi data pengecekan", "Riwayat lengkap per karyawan", "Analisis kebutuhan perbaikan", "Laporan PDF otomatis", "Pintasan keyboard untuk efisiensi"]
      }
    ],
    screenshot: {
      label: "Header dan Branding",
      instruction: "Ambil screenshot logo TKI atau header sistem dengan toggle bahasa",
      recommendedSize: "1200x300"
    }
  },
  {
    id: 3,
    title: "Dashboard - Statistik Utama",
    content: "Dashboard menampilkan 4 kartu statistik utama dengan informasi ringkasan",
    statistics: [
      { label: "Total Pengecekan", desc: "Jumlah semua pengecekan perangkat" },
      { label: "Total Karyawan", desc: "Jumlah karyawan terdaftar" },
      { label: "Total Perangkat", desc: "Breakdown PC dan Laptop" },
      { label: "Perangkat Urgent", desc: "Perangkat yang perlu perbaikan segera" }
    ],
    screenshot: {
      label: "4 Kartu Statistik",
      instruction: "Ambil screenshot 4 kartu statistik dengan ikon dan angka",
      recommendedSize: "1400x400"
    }
  },
  {
    id: 4,
    title: "Dashboard - Analitik & Grafik",
    charts: [
      "Distribusi Tipe Perangkat (Pie Chart)",
      "Kepemilikan Perangkat (Pie Chart)",
      "Kesesuaian Perangkat (Bar Chart)",
      "Distribusi Sistem Operasi (Pie Chart)",
      "Status Lisensi OS (Bar Chart)",
      "Status Keamanan (Pie Chart)",
      "Tren Pengecekan (Line Chart)",
      "Breakdown Departemen (Bar Chart)"
    ],
    screenshot: {
      label: "Grid Grafik Dashboard",
      instruction: "Ambil screenshot grid grafik di dashboard dengan beberapa chart berbeda",
      recommendedSize: "1600x600 atau 3-4 grafik terpisah 800x400"
    }
  },
  {
    id: 5,
    title: "Dashboard - Perangkat Urgent",
    content: "Bagian ini menampilkan perangkat yang membutuhkan perhatian segera",
    warningCards: [
      { status: "Needs Repair", color: "red", desc: "Membutuhkan perbaikan" },
      { status: "Unsuitable", color: "purple", desc: "Tidak layak untuk digunakan" }
    ],
    actions: ["Jadwalkan perbaikan", "Ganti perangkat tidak layak", "Follow-up dengan karyawan"],
    screenshot: {
      label: "Bagian Urgent Devices",
      instruction: "Ambil screenshot bagian Perangkat Urgent dengan kartu border berwarna",
      recommendedSize: "1400x600"
    }
  },
  {
    id: 6,
    title: "Manajemen Karyawan",
    features: [
      { title: "1. Tambah Karyawan", desc: "Form manual untuk input karyawan" },
      { title: "2. Import dari Excel", desc: "Download template, upload file, validasi otomatis" },
      { title: "3. Cari & Filter", desc: "Pencarian oleh nama, posisi, ID. Filter oleh departemen, status" },
      { title: "4. Edit & Hapus", desc: "Edit informasi karyawan, hapus dengan konfirmasi" }
    ],
    screenshot: {
      label: "Halaman Data Karyawan",
      instruction: "Ambil screenshot halaman Data Karyawan dengan grid kartu dan tombol",
      recommendedSize: "1600x800"
    }
  },
  {
    id: 7,
    title: "Memulai Pengecekan Perangkat",
    steps: [
      "Langkah 1: Navigasi ke Formulir - Klik menu 'Formulir' di header",
      "Langkah 2: Informasi Karyawan - Pilih karyawan dari dropdown autocomplete",
      "Langkah 3: Pilih Tanggal - Pilih tanggal pengecekan dari date picker",
      "Langkah 4: Gunakan Versi Terakhir - Centang untuk auto-fill data terakhir"
    ],
    highlight: "⭐ Fitur Unggulan: Gunakan Versi Terakhir untuk auto-fill dan hemat waktu",
    screenshot: {
      label: "Bagian Informasi Karyawan",
      instruction: "Ambil screenshot bagian Informasi Karyawan dengan dropdown dan checkbox",
      recommendedSize: "1400x500"
    }
  },
  {
    id: 8,
    title: "Detail Perangkat",
    content: "Semua field di bagian ini WAJIB diisi",
    fields: [
      { label: "Tipe Perangkat", options: ["PC", "Laptop"] },
      { label: "Kepemilikan", options: ["Perusahaan", "Pribadi"] },
      { label: "Merk Perangkat", desc: "Dropdown creatable, bisa tambah merk baru" },
      { label: "Model Perangkat", desc: "Input text field" },
      { label: "Nomor Seri", desc: "Unik per perangkat, penting untuk pelacakan" }
    ],
    screenshot: {
      label: "Bagian Detail Perangkat",
      instruction: "Ambil screenshot bagian Detail Perangkat dengan 5 field terisi",
      recommendedSize: "1400x400"
    }
  },
  {
    id: 9,
    title: "Sistem Operasi & Spesifikasi",
    sections: [
      {
        title: "Sistem Operasi (Wajib)",
        fields: [
          { label: "Tipe OS", options: ["Windows", "Linux", "Mac"] },
          { label: "Versi OS", desc: "Contoh: Windows 11, Ubuntu 22.04, macOS Sonoma" },
          { label: "Lisensi OS", options: ["Original", "Bajakan", "Open Source", "Unknown"] },
          { label: "Update Berkala", desc: "Checkbox untuk memastikan update diaktifkan" }
        ]
      },
      {
        title: "Spesifikasi (Opsional)",
        fields: [
          { label: "Kapasitas RAM", desc: "4GB, 8GB, 16GB, 32GB" },
          { label: "Prosesor", desc: "Intel Core i5, AMD Ryzen5, M1 Pro" },
          { label: "Penyimpanan", desc: "Bisa multiple (HDD/SSD) dengan berbagai kapasitas" }
        ]
      }
    ],
    screenshot: {
      label: "Bagian OS dan Spesifikasi",
      instruction: "Ambil screenshot bagian Sistem Operasi dan Spesifikasi dengan storage HDD/SSD",
      recommendedSize: "1400x600 atau 2 gambar 1400x300"
    }
  },
  {
    id: 10,
    title: "Kondisi Perangkat",
    sections: [
      {
        title: "Kesesuaian Perangkat (Wajib)",
        fields: [
          { label: "Sesuai", desc: "Perangkat berfungsi baik untuk pekerjaan", options: ["Sesuai"] },
          { label: "Terbatas", desc: "Ada beberapa keterbatasan", options: ["Terbatas"] },
          { label: "Perlu Perbaikan", desc: "Membutuhkan perbaikan segera", options: ["Perlu Perbaikan"] },
          { label: "Tidak Sesuai", desc: "Tidak layak untuk digunakan", options: ["Tidak Sesuai"] }
        ]
      },
      {
        title: "Kondisi Komponen (Opsional)",
        components: [
          { name: "Baterai", examples: ["Baik", "Cukup", "Buruk", "Perlu Penggantian"] },
          { name: "Keyboard", examples: ["Baik", "Cukup", "Buruk", "Ada tombol macet"] },
          { name: "Touchpad", examples: ["Baik", "Cukup", "Buruk", "Tidak responsif"] },
          { name: "Monitor", examples: ["Baik", "Cukup", "Buruk", "Ada dead pixel"] },
          { name: "WiFi", examples: ["Baik", "Cukup", "Buruk", "Sinyal lemah"] }
        ]
      }
    ],
    screenshot: {
      label: "Bagian Kondisi Perangkat",
      instruction: "Ambil screenshot bagian Kondisi Perangkat dengan dropdown dan 5 field kondisi",
      recommendedSize: "1400x500"
    }
  },
  {
    id: 11,
    title: "Aplikasi & Keamanan",
    sections: [
      {
        title: "Aplikasi (Opsional)",
        subsections: [
          { title: "Aplikasi Kerja", desc: "List semua software kerja dengan lisensi", fields: ["Nama Aplikasi", "Lisensi", "Catatan"] },
          { title: "Aplikasi Non-Kerja", desc: "List software pribadi karyawan", fields: ["Nama Aplikasi", "Lisensi", "Catatan"] },
          { title: "Per Aplikasi", desc: "", fields: ["Nama Aplikasi", "Lisensi", "Catatan"] }
        ]
      },
      {
        title: "Keamanan (Opsional)",
        subsections: [
          { title: "Antivirus", desc: "Status (Aktif/Tidak Aktif), list software, lisensi", fields: [] },
          { title: "VPN", desc: "Status (Tersedia/Tidak Tersedia), list koneksi, lisensi", fields: [] }
        ]
      }
    ],
    screenshot: {
      label: "Bagian Aplikasi dan Keamanan",
      instruction: "Ambil screenshot bagian Aplikasi dan Keamanan dengan beberapa aplikasi",
      recommendedSize: "1400x700 atau 2 gambar 1400x350"
    }
  },
  {
    id: 12,
    title: "Informasi Tambahan & Submit",
    fields: [
      { label: "Penggunaan Password", required: true, options: ["Tersedia", "Tidak Tersedia"] },
      { label: "Nama PIC Pemeriksa", required: true, desc: "Dropdown creatable untuk nama pemeriksa" },
      { label: "Catatan Lainnya", desc: "Tekan Enter untuk submit cepat, Shift+Enter untuk baris baru" }
    ],
    validation: "Semua field wajib harus diisi. Pesan error akan muncul jika ada field kosong.",
    shortcuts: ["Ctrl/Cmd + S", "Ctrl/Cmd + /"],
    screenshot: {
      label: "Bagian Informasi Tambahan",
      instruction: "Ambil screenshot bagian Informasi Tambahan dengan tombol Simpan",
      recommendedSize: "1400x500"
    }
  },
  {
    id: 13,
    title: "Melihat Data Pengecekan",
    features: [
      { title: "Pencarian", desc: "Cari oleh nama, ID, merk, model" },
      { title: "Filter Kondisi", desc: "Semua, Sesuai, Terbatas, Perlu Perbaikan, Tidak Sesuai" },
      { title: "Filter Kepemilikan", desc: "Semua, Perusahaan, Pribadi" },
      { title: "Tampilan Terkelompok", desc: "Kelompokkan berdasarkan karyawan untuk riwayat lengkap" },
      { title: "Tampilan Kartu", desc: "Nama, posisi, detail perangkat, status, tanggal, versi" }
    ],
    actions: ["👁️ Lihat", "📥 Download", "✏️ Edit", "🗑️ Hapus"],
    screenshot: {
      label: "Halaman Data Pengecekan",
      instruction: "Ambil screenshot halaman Data Pengecekan dengan filter dan kartu",
      recommendedSize: "1600x800 atau 2 gambar 1400x400"
    }
  },
  {
    id: 14,
    title: "Ekspor & PDF Generation",
    features: [
      {
        title: "Download Individual PDF",
        desc: "Klik tombol Download di setiap kartu pengecekan. PDF akan di-generate otomatis dengan format profesional dan terstruktur."
      },
      {
        title: "Isi PDF",
        items: [
          "Informasi karyawan",
          "Detail lengkap perangkat",
          "Sistem operasi dan spesifikasi",
          "Kondisi perangkat",
          "Semua aplikasi",
          "Status keamanan",
          "Informasi tambahan",
          "Tanggal dan pemeriksa"
        ]
      },
      {
        title: "Penggunaan PDF",
        items: ["Simpan untuk dokumentasi", "Kirim ke departemen terkait", "Arsip untuk referensi", "Lampiran untuk permintaan perbaikan"]
      }
    ],
    screenshot: {
      label: "Tombol Download",
      instruction: "Ambil screenshot kartu pengecekan dengan tombol download dan action buttons",
      recommendedSize: "800x600 (zoom 200% pada tombol action)"
    }
  },
  {
    id: 15,
    title: "Pintasan Keyboard",
    shortcuts: [
      { key: "Ctrl/Cmd + S", action: "Simpan formulir" },
      { key: "Ctrl/Cmd + /", action: "Toggle bantuan/help" },
      { key: "Alt + 1", action: "Lompat ke bagian Karyawan" },
      { key: "Alt + 2", action: "Lompat ke bagian Detail Perangkat" },
      { key: "Alt + 3", action: "Lompat ke bagian Sistem Operasi" },
      { key: "Alt + 4", action: "Lompat ke bagian Spesifikasi" },
      { key: "Alt + 5", action: "Lompat ke bagian Kondisi Perangkat" },
      { key: "Alt + 6", action: "Lompat ke bagian Aplikasi" },
      { key: "Alt + 7", action: "Lompat ke bagian Keamanan" },
      { key: "Alt + 8", action: "Lompat ke bagian Informasi Tambahan" },
      { key: "Tab", action: "Pindah ke field berikutnya" },
      { key: "Shift + Tab", action: "Pindah ke field sebelumnya" },
      { key: "Enter", action: "Submit formulir (di field catatan)" },
      { key: "Shift + Enter", action: "Baris baru (di field catatan)" },
      { key: "Esc", action: "Tutup modal" }
    ] as any[],
    panelInfo: "Panel pintasan melayang muncul di pojok kanan bawah. Bisa ditutup/dibuka kembali.",
    screenshot: {
      label: "Modal Bantuan & Panel Pintasan",
      instruction: "Ambil screenshot modal bantuan dengan tabel pintasan dan panel melayang",
      recommendedSize: "1200x700 dan 600x400 (2 screenshot)"
    }
  },
  {
    id: 16,
    title: "Tips & Praktik Terbaik",
    sections: [
      {
        title: "Tips Efisiensi",
        tips: [
          "Gunakan navigasi sidebar pada layar besar untuk lompat antar bagian",
          "Dropdown yang bisa dibuat mengingat entri Anda untuk pengisian data yang lebih cepat lain kali",
          "Fitur 'Gunakan Versi Terakhir' menghemat waktu dengan mengisi otomatis dengan data pengecekan sebelumnya",
          "Validasi wajib: Field wajib ditandai dengan *, validasi otomatis sebelum submit",
          "Group data pengecekan: Kelompokkan berdasarkan karyawan untuk melihat riwayat lengkap dengan mudah"
        ]
      },
      {
        title: "Praktik Terbaik",
        tips: [
          "Isi data dengan akurat dan konsisten",
          "Gunakan deskriptor yang jelas untuk kondisi",
          "Catat detail penting di catatan",
          "Verifikasi lisensi software",
          "Simpan PDF untuk dokumentasi",
          "Review data urgent setiap hari"
        ]
      }
    ],
    screenshot: undefined
  },
  {
    id: 17,
    title: "Ringkasan & Langkah Selanjutnya",
    features: [
      { title: "Dashboard Komprehensif", desc: "Statistik, grafik, dan alert" },
      { title: "Manajemen Karyawan", desc: "Tambah, edit, import" },
      { title: "Formulir Pengecekan Lengkap", desc: "8 bagian terstruktur" },
      { title: "Pencarian & Filter Canggih", desc: "Temukan data dengan mudah" },
      { title: "Ekspor PDF", desc: "Laporan profesional otomatis" },
      { title: "Bilingual Support", desc: "Indonesia & English" },
      { title: "Pintasan Keyboard", desc: "Bekerja lebih cepat" },
      { title: "Tampilan Terkelompok", desc: "Riwayat per karyawan" }
    ],
    benefits: [
      "Data tersentralisasi dan terorganisir",
      "Alur kerja efisien dengan pintasan",
      "Analisis real-time dan tren",
      "Laporan otomatis dan profesional",
      "Pencarian cepat dan akurat",
      "Riwayat lengkap dan trackable",
      "Akses dari mana saja (web-based)"
    ],
    nextSteps: [
      "Mulai gunakan sistem untuk pengecekan rutin",
      "Import data karyawan jika belum ada",
      "Gunakan pintasan keyboard untuk efisiensi",
      "Review dashboard untuk insight",
      "Ekspor PDF untuk dokumentasi dan laporan"
    ],
    screenshot: undefined
  },
  {
    id: 18,
    title: "Terima Kasih!",
    subtitle: "Pertanyaan?",
    content: "Terima kasih telah mengikuti presentasi ini. Silakan bertanya jika ada pertanyaan.",
    contact: "Hubungi tim IT support untuk bantuan lebih lanjut.",
    screenshot: undefined
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPrev();
          break;
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          goToNext();
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isFullscreen]);

  const goToPrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="header-sticky px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">Presentasi Sistem Pengecekan Perangkat</h1>
          <span className="text-muted-foreground text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Keyboard size={14} />
            <span>← → Space F Esc</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl">
          {/* Slide Content */}
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-lg">
            {currentSlideData.id === 1 && (
              <div className="text-center space-y-8">
                <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
                  {currentSlideData.title}
                </h1>
                <p className="text-2xl md:text-3xl text-muted-foreground">
                  {currentSlideData.subtitle}
                </p>
                <div className="space-y-2 text-lg text-muted-foreground">
                  <p>Dukungan Bahasa: Indonesia & English</p>
                  <p>Platform: Web-based Application</p>
                </div>
                {currentSlideData.screenshot && <ScreenshotPlaceholder {...currentSlideData.screenshot} />}
              </div>
            )}

            {currentSlideData.id === 18 && (
              <div className="text-center space-y-8">
                <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8">
                  {currentSlideData.title}
                </h1>
                <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
                  {currentSlideData.subtitle}
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  {currentSlideData.content}
                </p>
                <p className="text-base text-muted-foreground">
                  {currentSlideData.contact}
                </p>
              </div>
            )}

            {currentSlideData.id >= 2 && currentSlideData.id <= 15 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  {currentSlideData.title}
                </h2>

                {currentSlideData.content && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {currentSlideData.content}
                  </p>
                )}

                {currentSlideData.points && (
                  <ul className="space-y-3 mb-6">
                    {currentSlideData.points.map((point, idx) => (
                      <li
                        key={idx}
                        className={`text-lg ${
                          point.type === "main" ? "font-semibold" : ""
                        }`}
                      >
                        {point.text}
                      </li>
                    ))}
                  </ul>
                )}

                {currentSlideData.subsections && (
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {currentSlideData.subsections.map((subsection, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-6 rounded-lg"
                      >
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {subsection.title}
                        </h3>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-base">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.statistics && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {currentSlideData.statistics.map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-primary/10 p-6 rounded-lg border-2 border-primary"
                      >
                        <h3 className="text-lg font-bold text-primary mb-2">
                          {stat.label}
                        </h3>
                        <p className="text-base text-muted-foreground">
                          {stat.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.charts && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      Grafik yang Tersedia:
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {currentSlideData.charts.map((chart, idx) => (
                        <li key={idx} className="text-base">
                          {chart}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentSlideData.warningCards && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {currentSlideData.warningCards.map((card, idx) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-lg border-2 ${
                          card.color === "red"
                            ? "bg-red-50 border-red-500 dark:bg-red-950"
                            : "bg-purple-50 border-purple-500 dark:bg-purple-950"
                        }`}
                      >
                        <h3 className="text-xl font-bold text-primary mb-2">
                          {card.status}
                        </h3>
                        <p className="text-base text-muted-foreground">
                          {card.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.actions && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      Tindakan yang Diperlukan:
                    </h3>
                    <ul className="space-y-2">
                      {currentSlideData.actions.map((action, idx) => (
                        <li key={idx} className="text-base">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentSlideData.features && (
                  <div className="space-y-4 mb-6">
                    {currentSlideData.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-4 rounded-lg"
                      >
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-base text-muted-foreground">
                          {feature.desc}
                        </p>
                        {feature.items && (
                          <ul className="mt-3 space-y-1">
                            {feature.items.map((item, itemIdx) => (
                              <li
                                key={itemIdx}
                                className="text-sm text-muted-foreground"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {feature.fields && (
                          <ul className="mt-3 space-y-1">
                            {feature.fields.map((field, fieldIdx) => (
                              <li
                                key={fieldIdx}
                                className="text-sm text-muted-foreground"
                              >
                                {field}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.steps && (
                  <div className="space-y-3 mb-6">
                    {currentSlideData.steps.map((step, idx) => (
                      <div key={idx} className="text-base">
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.highlight && (
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary mb-6">
                    <p className="text-lg font-semibold text-primary">
                      {currentSlideData.highlight}
                    </p>
                  </div>
                )}

                {currentSlideData.fields && (
                  <div className="space-y-4 mb-6">
                    {currentSlideData.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-4 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-primary">
                            {field.label}
                          </h3>
                          {field.required && (
                            <span className="text-red-500 font-bold">*</span>
                          )}
                        </div>
                        <p className="text-base text-muted-foreground mb-2">
                          {field.desc}
                        </p>
                        {field.options && (
                          <div className="flex flex-wrap gap-2">
                            {field.options.map((option, optIdx) => (
                              <span
                                key={optIdx}
                                className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                              >
                                {typeof option === 'string' ? option : `${option.label} - ${option.desc}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.sections && (
                  <div className="space-y-6 mb-6">
                    {currentSlideData.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {section.title}
                        </h3>
                        {section.fields && section.fields.length > 0 && (
                          <div className="space-y-4">
                            {section.fields.map((field, fieldIdx) => (
                              <div
                                key={fieldIdx}
                                className="bg-muted p-4 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-base font-semibold text-primary">
                                    {field.label}
                                  </h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {field.desc}
                                </p>
                                {field.options && Array.isArray(field.options) && field.options.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map((opt: any, optIdx) => (
                                      <span
                                        key={optIdx}
                                        className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                                      >
                                        {typeof opt === 'string' ? opt : `${opt.label} - ${opt.desc}`}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="space-y-4">
                            {section.subsections.map(
                              (subsection: any, subIdx) => (
                                <div
                                  key={subIdx}
                                  className="bg-muted p-4 rounded-lg"
                                >
                                  <h4 className="text-base font-semibold text-primary mb-2">
                                    {subsection.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {subsection.desc}
                                  </p>
                                  {subsection.fields && subsection.fields.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {subsection.fields.map(
                                        (field: any, fieldIdx) => (
                                          <li
                                            key={fieldIdx}
                                            className="text-sm text-muted-foreground"
                                          >
                                            {field}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {section.components && section.components.length > 0 && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {section.components.map(
                              (component: any, compIdx) => (
                                <div
                                  key={compIdx}
                                  className="bg-muted p-4 rounded-lg"
                                >
                                  <h4 className="text-base font-semibold text-primary mb-2">
                                    {component.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Contoh: {component.examples.join(", ")}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {section.tips && section.tips.length > 0 && (
                          <ul className="space-y-2">
                            {section.tips.map((tip: any, tipIdx) => (
                              <li key={tipIdx} className="text-base">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSlideData.validation && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-2 border-yellow-500 mb-6">
                    <p className="text-base text-muted-foreground">
                      {currentSlideData.validation}
                    </p>
                  </div>
                )}

                {currentSlideData.shortcuts && (
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary mb-6">
                    <p className="text-base">
                      <strong>Pintasan:</strong>{" "}
                      {Array.isArray(currentSlideData.shortcuts) ? currentSlideData.shortcuts.join(" / ") : ""}
                    </p>
                  </div>
                )}

                {currentSlideData.panelInfo && (
                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <p className="text-base text-muted-foreground">
                      {currentSlideData.panelInfo}
                    </p>
                  </div>
                )}

                {currentSlideData.benefits && currentSlideData.benefits.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      Manfaat Sistem:
                    </h3>
                    <ul className="space-y-2">
                      {currentSlideData.benefits.map((benefit: any, idx) => (
                        <li key={idx} className="text-base">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentSlideData.nextSteps && currentSlideData.nextSteps.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      Langkah Selanjutnya:
                    </h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {currentSlideData.nextSteps.map((step: any, idx) => (
                        <li key={idx} className="text-base">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {currentSlideData.screenshot && (
                  <ScreenshotPlaceholder {...currentSlideData.screenshot} />
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goToPrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={goToNext}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Slide Thumbnails */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => goSlide(idx)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentSlide === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ScreenshotPlaceholder({
  label,
  instruction,
  recommendedSize,
}: Screenshot) {
  return (
    <div className="mt-8">
      <div className="bg-muted/50 border-2 border-dashed border-primary rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📸</div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          [TEMPAT SCREENSHOT: {label}]
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          <strong>Instruksi:</strong> {instruction}
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>Ukuran yang disarankan:</strong> {recommendedSize}
        </p>
      </div>
    </div>
  );
}