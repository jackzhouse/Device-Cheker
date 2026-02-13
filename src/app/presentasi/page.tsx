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
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Fullscreen Button - Top Right */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-background/80 backdrop-blur border hover:bg-accent transition-colors"
        title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8 md:p-12">
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
                {currentSlideData.screenshot && getUIMockup(currentSlideData.id)}
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
                                        (field: any, fieldIdx: number) => (
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
                    <p className="text-base text-gray-800 dark:text-gray-200">
                      {currentSlideData.validation}
                    </p>
                  </div>
                )}

                {currentSlideData.shortcuts && Array.isArray(currentSlideData.shortcuts) && currentSlideData.shortcuts.length > 0 && (
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary mb-6">
                    {typeof currentSlideData.shortcuts[0] === 'string' ? (
                      <p className="text-base">
                        <strong>Pintasan:</strong>{" "}
                        {currentSlideData.shortcuts.join(" / ")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-base font-semibold">Pintasan:</p>
                        <ul className="space-y-1">
                          {currentSlideData.shortcuts.map((s: any, idx: number) => (
                            <li key={idx} className="text-sm">
                              <span className="font-mono bg-background/50 px-2 py-1 rounded">{s.key}</span>: {s.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

                {currentSlideData.screenshot && getUIMockup(currentSlideData.id)}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Left Navigation Arrow - Floating */}
      <button
        onClick={goToPrev}
        disabled={currentSlide === 0}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-110"
        title="Previous"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Right Navigation Arrow - Floating */}
      <button
        onClick={goToNext}
        disabled={currentSlide === slides.length - 1}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-110"
        title="Next"
      >
        <ChevronRight size={32} />
      </button>

      {/* Slide Number - Floating in Bottom Right */}
      <div className="fixed bottom-8 right-8 z-40 bg-background/95 backdrop-blur border border-border px-6 py-3 rounded-full shadow-lg">
        <p className="text-sm font-semibold">
          {currentSlide + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
}

// UI Mockup Components

// Dashboard Mockup (Slide 1)
function DashboardMockup() {
  return (
    <div className="mt-6 space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
          <p className="text-sm text-muted-foreground">Total Pengecekan</p>
          <p className="text-2xl font-bold text-primary mt-1">156</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
          <p className="text-sm text-muted-foreground">Total Karyawan</p>
          <p className="text-2xl font-bold text-primary mt-1">42</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
          <p className="text-sm text-muted-foreground">Total Perangkat</p>
          <p className="text-2xl font-bold text-primary mt-1">38</p>
        </div>
        <div className="bg-red-500/10 p-4 rounded-lg border-2 border-red-500">
          <p className="text-sm text-muted-foreground">Perangkat Urgent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">5</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Distribusi Tipe Perangkat</h4>
          <div className="h-32 flex items-center justify-center gap-6">
            {/* Pie Chart */}
            <div className="relative">
              <svg width="100" height="100" viewBox="0 0 100 100">
                {/* PC - 66% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="166.4 251.2" transform="rotate(-90 50 50)" />
                {/* Laptop - 34% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="83.6 251.2" strokeDashoffset="-166.4" transform="rotate(-90 50 50)" />
              </svg>
              {/* Legend */}
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">PC</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Laptop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Tren Pengecekan</h4>
          <div className="h-32 flex items-end justify-between px-2">
            {/* Line Chart */}
            <svg width="100%" height="100%" viewBox="0 0 200 100" className="preserve-all">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="200" y2="25" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50" x2="200" y2="50" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="75" x2="200" y2="75" stroke="#e5e7eb" strokeWidth="1" />
              {/* Line path */}
              <path
                d="M 0 80 L 30 60 L 60 70 L 90 40 L 120 50 L 150 30 L 180 20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              <circle cx="0" cy="80" r="3" fill="#3b82f6" />
              <circle cx="30" cy="60" r="3" fill="#3b82f6" />
              <circle cx="60" cy="70" r="3" fill="#3b82f6" />
              <circle cx="90" cy="40" r="3" fill="#3b82f6" />
              <circle cx="120" cy="50" r="3" fill="#3b82f6" />
              <circle cx="150" cy="30" r="3" fill="#3b82f6" />
              <circle cx="180" cy="20" r="3" fill="#3b82f6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header Mockup (Slide 2)
function HeaderMockup() {
  return (
    <div className="mt-6">
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">TKI</span>
            </div>
            <span className="font-semibold text-lg">Sistem Pengecekan Perangkat</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <span className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">Dashboard</span>
            <span className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">Formulir</span>
            <span className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">Data Pengecekan</span>
            <span className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">Data Karyawan</span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span>🌐</span>
            <span className="text-sm font-semibold text-primary">ID</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">EN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Statistics Cards Mockup (Slide 3)
function StatisticsCardsMockup() {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📊</div>
          <div>
            <p className="text-sm text-muted-foreground">Total Pengecekan</p>
            <p className="text-2xl font-bold text-primary">156</p>
            <p className="text-xs text-muted-foreground mt-1">Semua pengecekan perangkat</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
        <div className="flex items-start gap-3">
          <div className="text-3xl">👥</div>
          <div>
            <p className="text-sm text-muted-foreground">Total Karyawan</p>
            <p className="text-2xl font-bold text-primary">42</p>
            <p className="text-xs text-muted-foreground mt-1">Karyawan terdaftar</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💻</div>
          <div>
            <p className="text-sm text-muted-foreground">Total Perangkat</p>
            <p className="text-2xl font-bold text-primary">38</p>
            <p className="text-xs text-muted-foreground mt-1">25 PC, 13 Laptop</p>
          </div>
        </div>
      </div>

      <div className="bg-red-500/10 p-6 rounded-lg border-2 border-red-500">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <p className="text-sm text-muted-foreground">Perangkat Urgent</p>
            <p className="text-2xl font-bold text-red-600">5</p>
            <p className="text-xs text-muted-foreground mt-1">Perlu perbaikan segera</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Charts Grid Mockup (Slide 4)
function ChartsGridMockup() {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-4">Dashboard menampilkan 8 grafik analitik:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pie Charts */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Distribusi Tipe</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="15" strokeDasharray="125.6 188.4" transform="rotate(-90 40 40)" />
            <circle cx="40" cy="40" r="30" fill="none" stroke="#8b5cf6" strokeWidth="15" strokeDasharray="62.8 188.4" strokeDashoffset="-125.6" transform="rotate(-90 40 40)" />
          </svg>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Kepemilikan</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="15" strokeDasharray="157 188.4" transform="rotate(-90 40 40)" />
            <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="15" strokeDasharray="31.4 188.4" strokeDashoffset="-157" transform="rotate(-90 40 40)" />
          </svg>
        </div>

        {/* Bar Charts */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Kesesuaian</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <rect x="10" y="20" width="15" height="50" fill="#3b82f6" rx="2" />
            <rect x="30" y="35" width="15" height="35" fill="#10b981" rx="2" />
            <rect x="50" y="25" width="15" height="45" fill="#f59e0b" rx="2" />
          </svg>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Distribusi OS</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="15" strokeDasharray="94.2 188.4" transform="rotate(-90 40 40)" />
            <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="15" strokeDasharray="62.8 188.4" strokeDashoffset="-94.2" transform="rotate(-90 40 40)" />
            <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="15" strokeDasharray="31.4 188.4" strokeDashoffset="-157" transform="rotate(-90 40 40)" />
          </svg>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Status Lisensi</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <rect x="10" y="15" width="15" height="55" fill="#10b981" rx="2" />
            <rect x="30" y="25" width="15" height="45" fill="#f59e0b" rx="2" />
            <rect x="50" y="30" width="15" height="40" fill="#ef4444" rx="2" />
          </svg>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Status Keamanan</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="15" strokeDasharray="150.7 188.4" transform="rotate(-90 40 40)" />
            <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="15" strokeDasharray="37.7 188.4" strokeDashoffset="-150.7" transform="rotate(-90 40 40)" />
          </svg>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Tren Pengecekan</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <path d="M 10 65 L 22 50 L 35 55 L 48 35 L 60 40 L 72 20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="65" r="2" fill="#3b82f6" />
            <circle cx="22" cy="50" r="2" fill="#3b82f6" />
            <circle cx="35" cy="55" r="2" fill="#3b82f6" />
            <circle cx="48" cy="35" r="2" fill="#3b82f6" />
            <circle cx="60" cy="40" r="2" fill="#3b82f6" />
            <circle cx="72" cy="20" r="2" fill="#3b82f6" />
          </svg>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md">
          <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Breakdown Dept</h4>
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <rect x="10" y="20" width="15" height="50" fill="#3b82f6" rx="2" />
            <rect x="30" y="30" width="15" height="40" fill="#10b981" rx="2" />
            <rect x="50" y="40" width="15" height="30" fill="#f59e0b" rx="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Urgent Devices Mockup (Slide 5)
function UrgentDevicesMockup() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground">Perangkat yang membutuhkan perhatian segera:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Needs Repair */}
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-2 border-red-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔧</span>
            <span className="font-bold text-red-700 dark:text-red-400">Needs Repair</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">👤</span>
              <span className="text-gray-900 dark:text-white">Budi Santoso</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">💻</span>
              <span className="text-gray-900 dark:text-white">MacBook Pro 2019</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">⚡</span>
              <span className="text-gray-900 dark:text-white">Baterai tidak tahan</span>
            </div>
          </div>
        </div>

        {/* Unsuitable */}
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-2 border-purple-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚫</span>
            <span className="font-bold text-purple-700 dark:text-purple-400">Unsuitable</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">👤</span>
              <span className="text-gray-900 dark:text-white">Siti Aminah</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">💻</span>
              <span className="text-gray-900 dark:text-white">Dell Latitude 5420</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">⚠️</span>
              <span className="text-gray-900 dark:text-white">Spec terlalu rendah</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Employee Cards Mockup (Slide 6)
function EmployeeCardsMockup() {
  const employees = [
    { name: "Ahmad Wijaya", pos: "IT Support", dept: "IT", status: "Aktif" },
    { name: "Dewi Lestari", pos: "HR Manager", dept: "HR", status: "Aktif" },
    { name: "Eko Prasetyo", pos: "Accountant", dept: "Finance", status: "Aktif" },
    { name: "Fani Rahmawati", pos: "Marketing", dept: "Marketing", status: "Cuti" },
  ];

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-4">Daftar karyawan di sistem:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((emp, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{emp.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{emp.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{emp.pos}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">{emp.dept}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${emp.status === 'Aktif' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>{emp.status}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">👁️</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">📥</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">✏️</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Employee Info Section Mockup (Slide 7)
function EmployeeInfoSectionMockup() {
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <label className="text-sm font-semibold text-primary mb-2 block">Pilih Karyawan</label>
        <div className="bg-background border border-border rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Budi Santoso - IT Support</span>
          <span className="text-muted-foreground">▼</span>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <label className="text-sm font-semibold text-primary mb-2 block">Tanggal Pengecekan</label>
        <div className="bg-background border border-border rounded-lg p-3">
          <span className="text-sm text-muted-foreground">13 Februari 2026</span>
        </div>
      </div>

      <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
          <span className="text-primary text-sm">✓</span>
        </div>
        <div>
          <label className="text-sm font-semibold text-primary">Gunakan Versi Terakhir</label>
          <p className="text-xs text-muted-foreground">Auto-fill data pengecekan sebelumnya</p>
        </div>
      </div>
    </div>
  );
}

// Device Details Form Mockup (Slide 8)
function DeviceDetailsFormMockup() {
  return (
    <div className="mt-6 space-y-3">
      {[
        { label: "Tipe Perangkat", required: true, options: ["PC", "Laptop"], selected: "PC" },
        { label: "Kepemilikan", required: true, options: ["Perusahaan", "Pribadi"], selected: "Perusahaan" },
        { label: "Merk Perangkat", required: true, value: "Dell" },
        { label: "Model Perangkat", required: true, value: "Latitude 5420" },
        { label: "Nomor Seri", required: true, value: "DELL-ABCD-1234" },
      ].map((field, idx) => (
        <div key={idx} className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-semibold text-primary">{field.label}</label>
            {field.required && <span className="text-red-500 font-bold">*</span>}
          </div>
          {field.options ? (
            <div className="flex gap-2">
              {field.options.map((opt, i) => (
                <span key={i} className={`px-3 py-1 text-sm rounded-full ${opt === field.selected ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground'}`}>{opt}</span>
              ))}
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">{field.value || "Pilih opsi..."}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Check Data Page Mockup (Slide 13)
function CheckDataPageMockup() {
  return (
    <div className="mt-6 space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2 border border-gray-300 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">🔍</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Cari nama, ID, merk...</span>
        </div>
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Filter Kondisi ▼</span>
        </div>
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Filter Kepemilikan ▼</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Ahmad Wijaya", device: "Dell Latitude", status: "Sesuai", color: "green" },
          { name: "Siti Aminah", device: "MacBook Pro", status: "Perlu Perbaikan", color: "red" },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white dark:bg-gray-900 border-2 ${item.color === 'red' ? 'border-red-500' : 'border-green-500'} rounded-lg p-4 shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.device}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${item.color === 'red' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>{item.status}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-500">👁️</span>
              <span className="text-gray-500 dark:text-gray-500">📥</span>
              <span className="text-gray-500 dark:text-gray-500">✏️</span>
              <span className="text-gray-500 dark:text-gray-500">🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Help Modal Mockup (Slide 15)
function HelpModalMockup() {
  const shortcuts = [
    { key: "Ctrl/Cmd + S", action: "Simpan formulir" },
    { key: "Alt + 1-8", action: "Lompat ke bagian formulir" },
    { key: "Tab", action: "Pindah ke field berikutnya" },
    { key: "Enter", action: "Submit formulir" },
    { key: "Esc", action: "Tutup modal" },
  ];

  return (
    <div className="mt-6 space-y-4">
      {/* Floating Panel */}
      <div className="fixed bottom-24 right-4 bg-background/95 backdrop-blur border border-border p-4 rounded-lg shadow-lg max-w-xs">
        <p className="text-sm font-semibold text-primary mb-2">Pintasan Aktif</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-primary/10 px-2 py-1 rounded text-primary">Ctrl</span>
            <span className="text-muted-foreground">+</span>
            <span className="bg-primary/10 px-2 py-1 rounded text-primary">S</span>
            <span className="text-muted-foreground">Simpan</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-primary/10 px-2 py-1 rounded text-primary">Alt</span>
            <span className="text-muted-foreground">+</span>
            <span className="bg-primary/10 px-2 py-1 rounded text-primary">2</span>
            <span className="text-muted-foreground">Detail Perangkat</span>
          </div>
        </div>
      </div>

      {/* Help Table */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-primary mb-4">Pintasan Keyboard</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 font-semibold">Pintasan</th>
              <th className="text-left pb-2 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((s, idx) => (
              <tr key={idx} className="border-b border-border/50">
                <td className="py-3 font-mono bg-primary/10 rounded px-2 inline-block mr-2">{s.key}</td>
                <td className="py-3 text-muted-foreground">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Get UI Mockup based on slide ID
function getUIMockup(slideId: number) {
  switch (slideId) {
    case 1:
      return <DashboardMockup />;
    case 2:
      return <HeaderMockup />;
    case 3:
      return <StatisticsCardsMockup />;
    case 4:
      return <ChartsGridMockup />;
    case 5:
      return <UrgentDevicesMockup />;
    case 6:
      return <EmployeeCardsMockup />;
    case 7:
      return <EmployeeInfoSectionMockup />;
    case 8:
      return <DeviceDetailsFormMockup />;
    case 9:
    case 10:
    case 11:
      return <DeviceDetailsFormMockup />;
    case 12:
      return <DeviceDetailsFormMockup />;
    case 13:
      return <CheckDataPageMockup />;
    case 15:
      return <HelpModalMockup />;
    default:
      return null;
  }
}
