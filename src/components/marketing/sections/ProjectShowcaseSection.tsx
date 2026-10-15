"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  PlayCircle, 
  Laptop, 
  Users, 
  CheckCircle2, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  programs as defaultPrograms, 
  formatPrice, 
  getDiscountPercent, 
  PricingTier 
} from "../data/marketing-data";
import CheckoutLoginModal from "./CheckoutLoginModal";

export default function ProjectShowcaseSection(props: { isLoggedIn?: boolean; dynamicPrograms?: any[] }) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[16px] text-[var(--color-muted)]">Memuat informasi materi...</div>}>
      <ProjectShowcaseInner {...props} />
    </Suspense>
  );
}

function ProjectShowcaseInner({ isLoggedIn = false, dynamicPrograms }: { isLoggedIn?: boolean; dynamicPrograms?: any[] }) {
  const programsToUse = dynamicPrograms?.length ? dynamicPrograms : defaultPrograms;
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // State untuk perbandingan paket (drawer/accordion)
  const [showPricingTiers, setShowPricingTiers] = useState(false);

  // Ambil program utama atau pertama sebagai referensi harga & paket
  const featuredProgram = programsToUse.find((p: any) => p.is_flagship) || programsToUse[0] || defaultPrograms[0];

  // Hitung harga termurah dari semua program & tier yang ada
  const allPrices: number[] = [];
  programsToUse.forEach((p: any) => {
    if (Array.isArray(p.tiers)) {
      p.tiers.forEach((t: any) => {
        const pr = Number(t.price);
        if (pr > 0) allPrices.push(pr);
      });
    }
    if (p.price && Number(p.price) > 0) {
      allPrices.push(Number(p.price));
    }
  });
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 299000;

  // State modal login/checkout
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSelectedProgram, setAuthSelectedProgram] = useState<any>(undefined);
  const [authSelectedTier, setAuthSelectedTier] = useState<PricingTier | undefined>(undefined);

  const handleCheckoutClick = (tier: PricingTier | any) => {
    const programSlug = featuredProgram.slug || featuredProgram.id;
    if (isLoggedIn) {
      router.push(`/checkout?program=${programSlug}&tier=${tier.tier_type ?? tier.type}`);
    } else {
      setAuthSelectedProgram(featuredProgram);
      setAuthSelectedTier(tier);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <CheckoutLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        program={authSelectedProgram}
        tier={authSelectedTier}
      />

      {/* Container dengan id="projects" dan id="pricing" serta scroll-margin-top agar tidak tertutup navbar */}
      <section 
        id="projects" 
        className="relative py-20 md:py-28 bg-[var(--color-paper)] text-[var(--color-ink)] scroll-mt-28 overflow-hidden"
      >
        {/* Anchor point #pricing untuk menjaga kompatibilitas link lama */}
        <div id="pricing" aria-hidden className="absolute -top-28 left-0 w-0 h-0 pointer-events-none" />

        {/* Ambient Subtle Background Accents */}
        <div 
          aria-hidden 
          className="absolute -top-32 right-1/4 w-[450px] h-[450px] bg-[var(--color-signal)]/10 rounded-full blur-[130px] pointer-events-none" 
        />
        <div 
          aria-hidden 
          className="absolute -bottom-32 left-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" 
        />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">

          {/* 1. Judul & Subjudul */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-signal)]/15 border border-[var(--color-signal)]/30 text-[var(--color-ink)] font-bold text-[14px] mb-4">
              <Sparkles className="w-4 h-4 text-[var(--color-bronze)]" />
              <span>Yang Kamu Dapatkan</span>
            </div>

            <h2 className="font-display italic uppercase text-[34px] md:text-[46px] lg:text-[54px] font-black tracking-tight leading-[1.08] text-[var(--color-ink)] mb-4">
              Belajar Langsung Praktik, <br className="hidden sm:block" />
              <span className="text-[var(--color-signal)]">Bukan Sekadar Teori</span>
            </h2>

            <p className="text-[17px] md:text-[19px] text-[var(--color-muted-light)] font-medium leading-relaxed max-w-2xl mx-auto">
              Dari belajar mandiri sampai sertifikat resmi BNSP, pilih sesuai kebutuhanmu.
            </p>
          </motion.div>

          {/* 2. Grid Kartu: Bento Sempurna (Baris Atas: 2 Kartu Lebar, Baris Bawah: 3 Kartu Seimbang) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-12">
            
            {/* KARTU 1: Video Belajar Dari Nol (6 cols desktop) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
              className="lg:col-span-6 bg-white border border-[var(--color-cream-line)] rounded-[24px] p-7 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-[var(--color-signal)]/60 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[var(--color-signal)] shrink-0 shadow-sm">
                    <PlayCircle className="w-7 h-7 text-[var(--color-bronze)]" />
                  </div>
                  <span className="inline-block px-3.5 py-1.5 rounded-full text-[14px] font-bold text-gray-700 bg-gray-100 border border-gray-200">
                    Semua Paket
                  </span>
                </div>

                <h3 className="font-display italic uppercase text-[22px] md:text-[25px] font-black text-[var(--color-ink)] mb-3 leading-snug">
                  Video Belajar Dari Nol
                </h3>

                <p className="text-[16px] text-[var(--color-muted-light)] leading-relaxed mb-6">
                  Materi terstruktur yang mudah dipahami pemula, bebas kamu tonton kapan saja tanpa batas waktu.
                </p>
              </div>

              {/* Micro Pills Preview */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-cream-line)]">
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  ▶ Akses Selamanya
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  ⏱️ Bebas Atur Waktu
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  📚 Modul Lengkap
                </span>
              </div>
            </motion.div>

            {/* KARTU 2: Praktik Langsung Bikin Aplikasi (6 cols desktop) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.08 }}
              className="lg:col-span-6 bg-white border border-[var(--color-cream-line)] rounded-[24px] p-7 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-[var(--color-signal)]/60 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-ink)]/10 border border-[var(--color-ink)]/20 flex items-center justify-center text-[var(--color-ink)] shrink-0 shadow-sm">
                    <Laptop className="w-7 h-7 text-[var(--color-ink)]" />
                  </div>
                  <span className="inline-block px-3.5 py-1.5 rounded-full text-[14px] font-bold text-gray-700 bg-gray-100 border border-gray-200">
                    Semua Paket
                  </span>
                </div>

                <h3 className="font-display italic uppercase text-[22px] md:text-[25px] font-black text-[var(--color-ink)] mb-3 leading-snug">
                  Praktik Langsung Bikin Aplikasi
                </h3>

                <p className="text-[16px] text-[var(--color-muted-light)] leading-relaxed mb-6">
                  Belajar sambil langsung praktik membuat aplikasi nyata agar kamu benar-benar paham langkah demi langkah.
                </p>
              </div>

              {/* Micro Pills Preview */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-cream-line)]">
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  💻 Aplikasi Nyata
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  🚀 Jadi Portofolio
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--color-paper)] text-[14px] font-medium text-gray-700">
                  🛠️ Siap Kerja
                </span>
              </div>
            </motion.div>

            {/* KARTU 3: Mentoring Live Via Zoom (4 cols desktop) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.12 }}
              className="md:col-span-1 lg:col-span-4 bg-white border border-[var(--color-cream-line)] rounded-[24px] p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[14px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
                    Paket Mentoring Plus ke atas
                  </span>
                </div>

                <h3 className="font-display italic uppercase text-[20px] md:text-[22px] font-black text-[var(--color-ink)] mb-3 leading-snug">
                  Mentoring Live Via Zoom
                </h3>

                <p className="text-[15px] md:text-[16px] text-[var(--color-muted-light)] leading-relaxed">
                  Tatap muka interaktif dengan mentor untuk membahas materi dan tanya jawab kendala belajarmu.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--color-cream-line)] mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-[14px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Tanya Jawab Interaktif
                </span>
              </div>
            </motion.div>

            {/* KARTU 4: Bimbingan Tugas 1-on-1 (4 cols desktop) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.16 }}
              className="md:col-span-1 lg:col-span-4 bg-white border border-[var(--color-cream-line)] rounded-[24px] p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[14px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    Paket Mentoring Plus ke atas
                  </span>
                </div>

                <h3 className="font-display italic uppercase text-[20px] md:text-[22px] font-black text-[var(--color-ink)] mb-3 leading-snug">
                  Bimbingan Tugas 1-on-1
                </h3>

                <p className="text-[15px] md:text-[16px] text-[var(--color-muted-light)] leading-relaxed">
                  Tugas dan kodemu diperiksa langsung oleh mentor dengan masukan mendalam agar kamu cepat mahir.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--color-cream-line)] mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[14px] font-medium">
                  <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  Masukan Kode Terperinci
                </span>
              </div>
            </motion.div>

            {/* KARTU 5: Ujian & Sertifikat BNSP (4 cols desktop, Highlighted Luxury) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.20 }}
              className="md:col-span-2 lg:col-span-4 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/30 border-2 border-[var(--color-signal)]/50 rounded-[24px] p-7 flex flex-col justify-between shadow-md hover:shadow-xl hover:border-[var(--color-signal)] hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-signal)] text-[var(--color-ink)] flex items-center justify-center shrink-0 shadow-md">
                    <Award className="w-6 h-6 text-[var(--color-ink)]" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[14px] font-black text-amber-900 bg-amber-100 border border-amber-300">
                    Khusus Paket Pro Bootcamp
                  </span>
                </div>

                <h3 className="font-display italic uppercase text-[20px] md:text-[22px] font-black text-[var(--color-ink)] mb-3 leading-snug">
                  Ujian & Sertifikat BNSP
                </h3>

                <p className="text-[15px] md:text-[16px] text-[var(--color-muted-light)] leading-relaxed">
                  Uji kompetensi resmi berstandar nasional untuk memperkuat bukti keahlianmu saat melamar kerja.
                </p>
              </div>

              <div className="pt-4 border-t border-amber-200 mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100/80 text-amber-900 text-[14px] font-bold">
                  🎖️ Standar Resmi Nasional
                </span>
              </div>
            </motion.div>

          </div>

          {/* 3 & 4. Banner Aksi Terintegrasi (Harga Sederhana + Dua Tombol) */}
          <div className="bg-white border-2 border-[var(--color-cream-line)] rounded-[28px] p-8 md:p-10 shadow-lg shadow-black/5 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="text-[14px] font-bold text-[var(--color-bronze)] uppercase tracking-wider block mb-1">
                Investasi Terjangkau untuk Masa Depanmu
              </span>
              <div className="text-[34px] md:text-[44px] font-black text-[var(--color-ink)] tracking-tight leading-tight mb-1">
                Mulai dari <span className="text-[var(--color-signal)]">{formatPrice(minPrice)}</span>
              </div>
              <p className="text-[15px] text-[var(--color-muted-light)] font-medium">
                Sekali bayar • Akses video materi selamanya • Tanpa biaya tersembunyi
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
              <Link
                href="/programs"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] font-black text-[15px] md:text-[16px] shadow-[var(--shadow-btn)] hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Lihat Program & Harga</span>
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </Link>

              <button
                onClick={() => setShowPricingTiers(!showPricingTiers)}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-[var(--color-paper)] hover:bg-gray-100 border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)] font-bold text-[15px] md:text-[16px] transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{showPricingTiers ? "Tutup Perbandingan" : "Bandingkan Paket Belajar"}</span>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${showPricingTiers ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Bagian Perbandingan Paket (Terbuka dengan animasi halus jika tombol ditekan) */}
          <AnimatePresence>
            {showPricingTiers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden pt-12"
              >
                <div className="text-center mb-8">
                  <h3 className="font-display italic uppercase text-[24px] md:text-[28px] font-black text-[var(--color-ink)] mb-2">
                    Pilihan Paket Belajar — {featuredProgram.name}
                  </h3>
                  <p className="text-[15px] md:text-[16px] text-[var(--color-muted-light)]">
                    Semua paket mendapatkan akses video penuh. Pilih tingkat pendampingan mentor sesuai kebutuhanmu.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {featuredProgram.tiers?.map((tier: any, i: number) => {
                    const originalPrice = tier.original_price ?? tier.originalPrice ?? 0;
                    const price = tier.price ?? 0;
                    const discount = getDiscountPercent(originalPrice, price);
                    const isPopular = tier.is_popular ?? tier.popular ?? (tier.tier_type === "complete" || tier.type === "complete");

                    return (
                      <div
                        key={tier.tier_type ?? tier.type ?? i}
                        className={`rounded-[24px] p-8 flex flex-col justify-between transition-all duration-200 ${
                          isPopular
                            ? "bg-[var(--color-ink)] text-white shadow-2xl border-2 border-[var(--color-signal)] relative"
                            : "bg-white text-[var(--color-ink)] border border-[var(--color-cream-line)] shadow-sm"
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[14px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                              Paling Populer
                            </span>
                          </div>
                        )}

                        <div>
                          <h4 className={`font-display italic uppercase text-[22px] md:text-[24px] font-black text-center mb-4 ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
                            {tier.label}
                          </h4>

                          <div className="text-center mb-6">
                            {discount > 0 && (
                              <div className="flex items-center justify-center gap-2 mb-1.5">
                                <span className={`text-[14px] line-through font-bold ${isPopular ? "text-white/50" : "text-[var(--color-muted-light)]"}`}>
                                  {formatPrice(originalPrice)}
                                </span>
                                <span className="text-[14px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">
                                  Hemat {discount}%
                                </span>
                              </div>
                            )}
                            <p className={`text-[30px] md:text-[36px] font-black ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
                              {formatPrice(price)}
                            </p>
                          </div>

                          <ul className={`space-y-3 mb-8 text-[14px] md:text-[15px] border-t pt-5 ${isPopular ? "border-white/15 text-white/90" : "border-[var(--color-cream-line)] text-[var(--color-muted-light)]"}`}>
                            {Array.isArray(tier.features) && tier.features.map((f: string, fi: number) => (
                              <li key={fi} className="flex items-start gap-2.5">
                                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? "text-[var(--color-signal)]" : "text-emerald-600"}`} strokeWidth={3} />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleCheckoutClick(tier)}
                          className={`w-full py-4 px-6 rounded-full text-[15px] font-black transition-all ${
                            isPopular
                              ? "bg-[var(--color-signal)] text-[var(--color-ink)] hover:bg-[var(--color-signal-hover)] shadow-md"
                              : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-2)]"
                          }`}
                        >
                          Pilih Paket Ini
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}
