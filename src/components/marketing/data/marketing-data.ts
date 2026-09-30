import {
  ShieldCheck, Award, Users, BookOpen, Monitor, Briefcase,
  GraduationCap, Zap, Globe, FileCheck, Clock, Headphones, Code, PenTool, Database, TrendingUp
} from "lucide-react";

// ============================================
// PROGRAMS / COURSE DATA (BOOTCAMP FOCUS)
// ============================================
export interface CurriculumVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
}

export interface PricingTier {
  type: 'junior' | 'expert' | 'complete';
  label: string;
  price: number;
  originalPrice: number;
  features: string[];
  excludes?: string[];
  badge?: string;
  popular?: boolean;
}

export interface ProgramData {
  id: string;
  name: string;
  shortName: string;
  description: string;
  sessions: number;
  modules: number;
  price: number;
  originalPrice: number;
  rating: number;
  students: number;
  videoUrl: string;
  thumbnailText: string;
  features: string[];
  popular?: boolean;
  curriculum?: CurriculumVideo[];
  tiers?: PricingTier[];
}

export const programs: ProgramData[] = [
  {
    id: "ui-ux",
    name: "UI/UX Research & Design",
    shortName: "UI/UX Design",
    description: "Dari User Research, Wireframing, hingga High-Fidelity Prototype menggunakan Figma.",
    sessions: 16,
    modules: 28,
    price: 2800000,
    originalPrice: 4000000,
    rating: 4.8,
    students: 380,
    videoUrl: "",
    thumbnailText: "UI/UX Design",
    features: ["Figma Mastery", "Real Case Studies", "Design Portfolio", "Mentoring 1-on-1", "Hiring Partners"],
    curriculum: [
      { id: "v1", title: "Pengenalan UI/UX", description: "Memahami perbedaan mendasar antara User Interface dan User Experience serta pentingnya dalam pengembangan produk.", duration: "15:20", videoUrl: "" },
      { id: "v2", title: "Design Thinking Framework", description: "Langkah-langkah praktis dalam menerapkan design thinking: Empathize, Define, Ideate, Prototype, Test.", duration: "22:45", videoUrl: "" },
      { id: "v3", title: "Pengenalan Figma", description: "Mengenal antarmuka Figma, dasar-dasar artboard, dan penggunaan tools utama.", duration: "18:10", videoUrl: "" },
      { id: "v4", title: "Wireframing Dasar", description: "Membuat kerangka desain kasar (Lo-Fi) untuk memetakan alur pengguna (user flow).", duration: "25:30", videoUrl: "" }
    ],
    tiers: [
      {
        type: 'junior',
        label: 'Junior (Video Only)',
        price: 800000,
        originalPrice: 1500000,
        features: ["Akses Video Materi Basic", "28 Modul Materi", "Sertifikat Digital"],
        excludes: ["Materi Expert", "Tanpa Mentor", "Tanpa Career", "Tanpa Akses LMS"],
      },
      {
        type: 'expert',
        label: 'Expert (Video Only)',
        price: 1200000,
        originalPrice: 2000000,
        features: ["Akses Materi Basic & Expert", "Semua Modul Materi", "Sertifikat Digital"],
        excludes: ["Tanpa Mentor", "Tanpa Career Support", "Tanpa Akses LMS"],
      },
      {
        type: 'complete',
        label: 'Bootcamp Lengkap',
        price: 2800000,
        originalPrice: 4000000,
        features: ["Semua di Paket Expert +", "16 Sesi Live Mentoring", "Design Portfolio Review", "Career Support & Job Fair", "Akses Penuh LMS E17", "Sertifikat Kelulusan"],
        popular: true,
      }
    ]
  },
  {
    id: "fullstack-web",
    name: "Fullstack Web Development",
    shortName: "Fullstack Web",
    description: "Bangun aplikasi web modern dari nol hingga deploy dengan stack MERN/Next.js.",
    sessions: 24,
    modules: 40,
    price: 3500000,
    originalPrice: 5000000,
    rating: 4.9,
    students: 450,
    videoUrl: "",
    thumbnailText: "Fullstack Web",
    features: ["Project Real-World", "24 Sesi Live Mentoring", "Career Preparation", "Code Review", "Portfolio Siap Kerja"],
    popular: true,
    curriculum: [
      { id: "v1", title: "Fundamental HTML & CSS", description: "Memahami struktur dasar web dan cara melakukan styling dasar menggunakan HTML5 dan CSS3.", duration: "20:15", videoUrl: "" },
      { id: "v2", title: "Javascript Modern (ES6+)", description: "Konsep penting Javascript seperti Arrow Function, Destructuring, Promises, dan Async/Await.", duration: "35:10", videoUrl: "" },
      { id: "v3", title: "Pengenalan React & Next.js", description: "Cara kerja React component dan keunggulan menggunakan Next.js App Router.", duration: "42:05", videoUrl: "" },
      { id: "v4", title: "State Management", description: "Mengelola data di dalam aplikasi React menggunakan useState, useEffect, dan Context API.", duration: "28:50", videoUrl: "" },
      { id: "v5", title: "Backend API dengan Node.js", description: "Membangun REST API sederhana menggunakan Express.js dan menghubungkannya ke frontend.", duration: "45:20", videoUrl: "" }
    ],
    tiers: [
      {
        type: 'junior',
        label: 'Junior (Video Only)',
        price: 1000000,
        originalPrice: 1800000,
        features: ["Akses Video Materi Basic", "40 Modul Materi", "Sertifikat Digital"],
        excludes: ["Materi Expert", "Tanpa Mentor", "Tanpa Career", "Tanpa Akses LMS"],
      },
      {
        type: 'expert',
        label: 'Expert (Video Only)',
        price: 1500000,
        originalPrice: 2500000,
        features: ["Akses Materi Basic & Expert", "Semua Modul Materi", "Sertifikat Digital"],
        excludes: ["Tanpa Mentor", "Tanpa Career Support", "Tanpa Akses LMS"],
      },
      {
        type: 'complete',
        label: 'Bootcamp Lengkap',
        price: 3500000,
        originalPrice: 5000000,
        features: ["Semua di Paket Expert +", "24 Sesi Live Mentoring", "Code Review Personal", "Career Support & Job Fair", "Akses Penuh LMS E17", "Sertifikat Kelulusan"],
        popular: true,
      }
    ]
  },
  {
    id: "data-science",
    name: "Data Science & AI",
    shortName: "Data Science",
    description: "Pelajari analisis data dari dasar hingga visualisasi menggunakan tools industri terkemuka.",
    sessions: 20,
    modules: 35,
    price: 4000000,
    originalPrice: 6000000,
    rating: 4.7,
    students: 210,
    videoUrl: "",
    thumbnailText: "Data Science",
    features: ["Python & SQL", "Machine Learning", "Capstone Project", "Kaggle Competitions", "Job Connector"],
    tiers: [
      {
        type: 'junior',
        label: 'Junior (Video Only)',
        price: 1200000,
        originalPrice: 2200000,
        features: ["Akses Video Materi Basic", "35 Modul Materi", "Sertifikat Digital"],
        excludes: ["Materi Expert", "Tanpa Mentor", "Tanpa Career", "Tanpa Akses LMS"],
      },
      {
        type: 'expert',
        label: 'Expert (Video Only)',
        price: 1800000,
        originalPrice: 3000000,
        features: ["Akses Materi Basic & Expert", "Semua Modul Materi", "Sertifikat Digital"],
        excludes: ["Tanpa Mentor", "Tanpa Career Support", "Tanpa Akses LMS"],
      },
      {
        type: 'complete',
        label: 'Bootcamp Lengkap',
        price: 4000000,
        originalPrice: 6000000,
        features: ["Semua di Paket Expert +", "20 Sesi Live Mentoring", "Capstone Project Review", "Career Support & Job Fair", "Akses Penuh LMS E17", "Sertifikat Kelulusan"],
        popular: true,
      }
    ]
  },
  {
    id: "digital-marketing",
    name: "Performance Digital Marketing",
    shortName: "Digital Marketing",
    description: "SEO, SEM, Social Media Ads, dan Analytics untuk strategi pemasaran digital.",
    sessions: 16,
    modules: 25,
    price: 2500000,
    originalPrice: 3500000,
    rating: 4.8,
    students: 520,
    videoUrl: "",
    thumbnailText: "Digital Marketing",
    features: ["Meta & Google Ads", "SEO Optimization", "Budgeting Strategy", "Live Campaign", "Career Support"],
    tiers: [
      {
        type: 'junior',
        label: 'Junior (Video Only)',
        price: 600000,
        originalPrice: 1200000,
        features: ["Akses Video Materi Basic", "25 Modul Materi", "Sertifikat Digital"],
        excludes: ["Materi Expert", "Tanpa Mentor", "Tanpa Career", "Tanpa Akses LMS"],
      },
      {
        type: 'expert',
        label: 'Expert (Video Only)',
        price: 1000000,
        originalPrice: 1800000,
        features: ["Akses Materi Basic & Expert", "Semua Modul Materi", "Sertifikat Digital"],
        excludes: ["Tanpa Mentor", "Tanpa Career Support", "Tanpa Akses LMS"],
      },
      {
        type: 'complete',
        label: 'Bootcamp Lengkap',
        price: 2500000,
        originalPrice: 3500000,
        features: ["Semua di Paket Expert +", "16 Sesi Live Mentoring", "Live Campaign Review", "Career Support & Job Fair", "Akses Penuh LMS E17", "Sertifikat Kelulusan"],
        popular: true,
      }
    ]
  }
];

// ============================================
// VALUE PROPOSITIONS
// ============================================
export interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

export const valueProps: ValueProp[] = [
  {
    icon: "play-circle",
    title: "Akses Video Materi & LMS Secara Instan",
    description: "Setelah pembelian berhasil, Anda langsung mendapatkan akses ke dalam sistem LMS (Learning Management System) untuk mulai belajar detik itu juga.",
  },
  {
    icon: "monitor",
    title: "Tatap Muka dengan Mentor, Tiap Minggu (Khusus Paket Komplit)",
    description: "Belajar bareng mentor lewat Zoom, bisa tanya langsung saat stuck. Beda jauh dari nonton video sendiri jam 2 pagi.",
  },
  {
    icon: "users",
    title: "Mentor yang Masih Aktif Merekrut (Khusus Paket Komplit)",
    // TODO: Verifikasi klaim "aktif merekrut" ini kebenarannya dengan user
    description: "Bukan pengajar penuh waktu. Mereka praktisi yang tiap bulan mewawancarai kandidat, jadi tahu persis apa yang bikin CV lolos atau ditolak.",
  },
  {
    icon: "award",
    title: "Sertifikat Kelulusan Resmi",
    description: "Dapatkan sertifikat kelulusan yang diakui untuk memvalidasi skill baru Anda setelah menyelesaikan seluruh materi kelas.",
  },
];

// ============================================
// FAQ DATA
// ============================================
export interface FAQData {
  question: string;
  answer: string;
}

export const faqData: FAQData[] = [
  {
    question: "Saya pemula dan belum punya dasar ilmunya sama sekali. Bisa ikut?",
    answer: "Bisa. Kurikulum dimulai dari nol, dari istilah dasar sampai bikin project utuh. Yang perlu Anda siapkan: laptop yang bisa buka browser, dan waktu 10-15 jam per minggu.",
  },
  {
    question: "Bedanya E17 sama kursus online lain?",
    answer: "Kami mengintegrasikan pembelian kelas langsung ke sistem LMS eksklusif kami. Anda bisa akses video rekaman, materi bacaan, dan tugas tambahan dalam satu platform yang terpusat.",
  },
  {
    question: "Kalau saya ketinggalan sesi live, bagaimana?",
    answer: "Untuk Anda yang mengambil Paket Komplit, rekaman setiap sesi mentoring live tersedia di LMS dalam 24 jam. Anda bisa tonton ulang kapan saja.",
  },
  {
    question: "Bagaimana cara akses kelasnya setelah membayar?",
    answer: "Sistem kami terotomatisasi penuh. Setelah pembayaran terkonfirmasi, Anda akan diarahkan ke Dashboard LMS dan semua modul video terbuka sesuai masa aktif paket Anda (6 Bulan / 1 Tahun).",
  },
  {
    question: "Saya sudah kerja full-time. Jadwalnya fleksibel?",
    answer: "Sangat fleksibel. Untuk Paket Junior dan Expert, Anda bisa menonton video materi kapan saja tanpa batasan jadwal. Khusus untuk Paket Komplit, sesi mentoring live diadakan malam hari (19.00-21.00 WIB) agar tidak bentrok jam kerja.",
  },
];

// ============================================
// WHATSAPP CONFIG
// ============================================
export const whatsappNumber = "6281234567890"; // [REAL DATA] Replace with real number
export const getWhatsAppUrl = (programName?: string) => {
  const message = programName
    ? `Halo, saya tertarik dengan bootcamp *${programName}* di E17 Course. Mohon info lebih lanjut.`
    : `Halo, saya tertarik mendaftar bootcamp di E17 Course. Mohon info lebih lanjut.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

// ============================================
// FORMATTING HELPERS
// ============================================
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getDiscountPercent = (original: number, current: number) => {
  return Math.round(((original - current) / original) * 100);
};

export const useCasesData = [
  {
    icon: "GraduationCap",
    title: "Mahasiswa",
    description: "Lengkapi skill yang tidak diajarkan di kampus dengan praktik langsung.",
  },
  {
    icon: "Briefcase",
    title: "Profesional",
    description: "Tingkatkan kompetensi untuk promosi atau perpindahan karir yang lebih baik.",
  },
  {
    icon: "Laptop",
    title: "Freelancer",
    description: "Tambah portofolio dengan project nyata untuk menarik lebih banyak klien.",
  },
  {
    icon: "Compass",
    title: "Career Switcher",
    description: "Mulai dari nol hingga mahir dengan bimbingan mentor yang berpengalaman.",
  },
  {
    icon: "BookOpen",
    title: "Pelajar SMA/SMK",
    description: "Curi start belajar skill industri sebelum masuk dunia perkuliahan.",
  },
  {
    icon: "Building",
    title: "Tim Perusahaan",
    description: "Upskill tim Anda dengan materi terstruktur dan terpantau lewat dashboard.",
  },
];

export const featureShowcaseData = [
  {
    title: "Video Materi Berkualitas HD",
    description: "Belajar mandiri kapan saja dengan ratusan video materi yang direkam secara profesional.",
    points: [
      "Kualitas video dan audio jernih",
      "Materi selalu di-update secara berkala",
      "Akses penuh sesuai masa aktif paket (6 Bulan / 1 Tahun)"
    ],
    imageType: "video",
    align: "left"
  },
  {
    title: "Live Class via Zoom",
    description: "Interaksi langsung dengan instruktur profesional. Tanyakan hal yang membingungkan secara real-time.",
    points: [
      "Jadwal fleksibel (malam hari/weekend)",
      "Rekaman sesi tersedia di LMS",
      "Diskusi interaktif dengan peserta lain"
    ],
    imageType: "live",
    align: "right"
  },
  {
    title: "Dashboard Progress Belajar",
    description: "Pantau perkembangan belajar Anda dengan mudah. Sistem LMS kami terintegrasi secara otomatis.",
    points: [
      "Tracking penyelesaian modul",
      "Kumpulan nilai tugas dan kuis",
      "Akses instan setelah pembelian"
    ],
    imageType: "dashboard",
    align: "left"
  },
  {
    title: "Sertifikat Resmi",
    description: "Validasi skill Anda dengan sertifikat kelulusan yang diakui industri setelah menyelesaikan kelas.",
    points: [
      "Sertifikat digital dengan ID unik",
      "Dapat langsung diunggah ke LinkedIn",
      "Meningkatkan kredibilitas profesional Anda"
    ],
    imageType: "certificate",
    align: "right"
  }
];

export const testimonialsData = [
  {
    name: "Budi Santoso",
    role: "Data Analyst",
    rating: 5,
    quote: "Materi sangat terstruktur. Awalnya saya sama sekali tidak mengerti SQL, sekarang saya bisa membuat dashboard data sendiri. Sangat direkomendasikan!"
  },
  {
    name: "Siti Rahmawati",
    role: "Mahasiswa Tingkat Akhir",
    rating: 5,
    quote: "Live class-nya sangat membantu. Mentornya sabar dan jelas dalam menjelaskan materi. Berasa punya tutor pribadi."
  },
  {
    name: "Andi Wijaya",
    role: "Freelance Web Developer",
    rating: 4.5,
    quote: "Materi video yang terstruktur itu yang paling saya suka. Kalau lupa sesuatu, tinggal login dan tonton lagi videonya. Sangat praktis."
  },
  {
    name: "Rina Kusuma",
    role: "Digital Marketer",
    rating: 5,
    quote: "Sistem LMS-nya gampang banget dipakai. Begitu bayar, langsung bisa akses semua video. Gak perlu nunggu admin manual."
  }
];
