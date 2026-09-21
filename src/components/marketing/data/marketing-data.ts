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
  type: 'junior' | 'expert' | 'bootcamp';
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
        type: 'bootcamp',
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
        type: 'bootcamp',
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
    description: "Pelajari Python, SQL, Machine Learning, dan Data Visualization untuk karir data.",
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
        type: 'bootcamp',
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
        type: 'bootcamp',
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
    icon: "briefcase",
    title: "Portfolio dari Project Nyata",
    description: "Bukan tugas simulasi. Setiap project dikerjakan berdasarkan studi kasus industri yang bisa langsung masuk portfolio Anda.",
  },
  {
    icon: "monitor",
    title: "Live Mentoring, Bukan Rekaman",
    description: "Sesi tatap muka virtual langsung dengan mentor. Tanya jawab real-time, bukan komentar di bawah video.",
  },
  {
    icon: "users",
    title: "Mentor dari Industri",
    description: "Praktisi aktif di perusahaan teknologi. Mereka tahu apa yang dicari recruiter karena mereka sendiri yang merekrut.",
  },
  {
    icon: "shield-check",
    title: "Dukungan Cari Kerja",
    description: "Review CV, simulasi interview, dan koneksi ke perusahaan yang sedang hiring. Proses lengkap sampai Anda diterima.",
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
    question: "Apa itu E17 Course?",
    answer: "E17 Course adalah platform bootcamp intensif untuk membantu Anda switch career atau up-skilling di bidang teknologi. Format belajarnya live mentoring, bukan sekadar nonton video.",
  },
  {
    question: "Bagaimana format belajarnya?",
    answer: "Live mentoring via Zoom, bukan video rekaman. Anda bertatap muka langsung dengan mentor, bisa tanya jawab real-time. Semua materi dan tugas dikumpulkan lewat LMS.",
  },
  {
    question: "Apakah cocok untuk pemula tanpa background IT?",
    answer: "Ya. Kurikulum dimulai dari level dasar. Yang Anda butuhkan hanya laptop dan komitmen untuk belajar.",
  },
  {
    question: "Apakah ada jaminan kerja setelah lulus?",
    answer: "Kami tidak menjanjikan garansi 100% diterima kerja. Yang kami sediakan: review CV, latihan interview, dan koneksi ke perusahaan yang sedang mencari talent.",
  },
  {
    question: "Bagaimana jika saya tidak bisa hadir di sesi live?",
    answer: "Setiap sesi direkam dan bisa Anda tonton ulang kapan saja lewat LMS.",
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
