"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, Clock, BookOpen, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import ProgramCurriculumGallery from "@/components/marketing/sections/ProgramCurriculumGallery";

interface ProgramContentViewProps {
  program: any;
  tiers: any[];
  outline: any[];
  totalDurationFormatted: string;
  descriptionParagraphs: string[];
}

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ProgramContentView({
  program,
  tiers,
  outline,
  totalDurationFormatted,
  descriptionParagraphs
}: ProgramContentViewProps) {
  const t = useTranslations("ProgramDetail");
  
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden bg-[var(--color-ink)] text-white pt-24 lg:pt-32">
        {/* Background elements */}
        <div aria-hidden className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, var(--color-bronze) 0%, transparent 50%)' }} />
        <div aria-hidden className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-cream-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-cream-line) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Diagonal speed stripes motif */}
        <div aria-hidden className="absolute top-0 left-0 w-[500px] h-[500px] opacity-10 pointer-events-none transform -translate-x-1/4 -translate-y-1/4" style={{ background: 'repeating-linear-gradient(45deg, var(--color-signal), var(--color-signal) 10px, transparent 10px, transparent 20px)' }} />
        
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & CTA */}
          <motion.div 
            className="flex flex-col items-start text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-block mb-6">
              <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Bootcamp
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="font-display italic text-[48px] md:text-[64px] lg:text-[72px] font-black uppercase text-white tracking-tight leading-[1] mb-6 text-balance">
              {program.short_name || program.name}
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-[17px] lg:text-[20px] text-[var(--color-muted)] leading-relaxed font-medium max-w-xl mb-10 text-balance">
              {program.description}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-8 mb-10 border-l-[3px] border-[var(--color-signal)] pl-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[var(--color-bronze)] font-bold uppercase tracking-widest mb-1">{t("materials")}</span>
                <span className="font-bold text-white text-[16px] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--color-signal)]" />
                  {outline.length} {t("sessions")}
                </span>
              </div>
              {totalDurationFormatted && (
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[var(--color-bronze)] font-bold uppercase tracking-widest mb-1">{t("duration")}</span>
                  <span className="font-bold text-white text-[16px] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-signal)]" />
                    {totalDurationFormatted}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link 
                href="#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] font-black text-[15px] py-4 px-8 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[var(--color-signal)]/20"
              >
                {t("see_pricing")}
              </Link>
              <Link 
                href="#curriculum"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold text-[15px] py-4 px-8 rounded-full transition-all border border-white/10 backdrop-blur-sm"
              >
                {t("see_curriculum")}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual/Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full h-[400px] lg:h-[500px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group"
          >
            <div className="absolute inset-0 bg-slate-800 animate-pulse"></div>
            <img 
              src={`https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop`} 
              alt={program.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/40 to-transparent"></div>
            
            {/* Floating Badge */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--color-signal)]/20 rounded-full flex items-center justify-center border border-[var(--color-signal)]/30 shrink-0">
                  <Check className="w-6 h-6 text-[var(--color-signal)]" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-[15px] mb-0.5">Akses Materi Selamanya</h4>
                  <p className="text-white/60 text-[13px] font-medium">Belajar kapanpun tanpa batasan waktu.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 py-20 lg:py-32 space-y-24 lg:space-y-32">
        {/* Deskripsi Lengkap */}
        {descriptionParagraphs.length > 0 && (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start"
          >
            <div className="lg:col-span-5">
              <motion.h2 variants={fadeInUp} className="font-display italic uppercase text-[36px] lg:text-[48px] font-black text-[var(--color-ink)] tracking-tight leading-[1] sticky top-32">
                {t.rich("about_program", {
                  signal: (chunks) => <span className="text-[var(--color-signal)]">{chunks}</span>,
                  br: () => <br/>
                })}
              </motion.h2>
            </div>
            <div className="lg:col-span-7 space-y-6 lg:pt-2">
              {descriptionParagraphs.map((para: string, idx: number) => (
                <motion.p variants={fadeInUp} key={idx} className="text-[var(--color-muted-light)] text-[16px] lg:text-[18px] leading-relaxed font-medium">
                  {para}
                </motion.p>
              ))}
            </div>
          </motion.section>
        )}

        {/* Kurikulum & Materi */}
        <motion.section 
          id="curriculum" 
          className="scroll-mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-20">
            <h2 className="font-display italic uppercase text-[36px] lg:text-[48px] font-black text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
              {t.rich("curriculum_title", {
                signal: (chunks) => <span className="text-[var(--color-signal)]">{chunks}</span>
              })}
            </h2>
            <p className="text-[17px] text-[var(--color-muted-light)] font-medium">{t("curriculum_subtitle")}</p>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <ProgramCurriculumGallery curriculum={outline} />
          </motion.div>
        </motion.section>

        {/* Harga / Tiers */}
        <motion.section 
          id="pricing" 
          className="scroll-mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-20">
            <h2 className="font-display italic uppercase text-[36px] lg:text-[48px] font-black text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
              {t.rich("pricing_title", {
                signal: (chunks) => <span className="text-[var(--color-signal)]">{chunks}</span>
              })}
            </h2>
            <p className="text-[17px] text-[var(--color-muted-light)] font-medium">{t("pricing_subtitle")}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
            {tiers?.map((tier, idx) => {
              const isComplete = tier.tier_type === 'complete' || tier.tier_type === 'bootcamp';
              return (
                <motion.div 
                  key={tier.tier_type} 
                  variants={fadeInUp}
                  className={`relative rounded-[32px] flex flex-col h-full transition-all duration-300 group ${
                    isComplete 
                      ? "bg-[var(--color-ink)] text-white shadow-[var(--shadow-card-featured)] border-2 border-[var(--color-signal)] scale-100 lg:scale-105 z-10 hover:-translate-y-2" 
                      : "bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-cream-line)] shadow-sm hover:shadow-xl hover:border-[var(--color-ink)]/20 hover:-translate-y-1 z-0"
                  }`}
                >
                  <div className="flex-1 p-8 lg:p-10 flex flex-col h-full relative">
                    {isComplete && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className="flex items-center gap-1.5 bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                          <Sparkles className="w-3.5 h-3.5" /> {t("popular")}
                        </span>
                      </div>
                    )}

                    <h3 className={`font-display italic text-[28px] uppercase font-black text-center mb-3 ${isComplete ? "text-white" : "text-[var(--color-ink)]"}`}>
                      {tier.label}
                    </h3>

                    <div className="mb-8 text-center flex flex-col items-center">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--color-bronze)]">{t("investment")}</span>
                      <p className={`text-[36px] lg:text-[44px] font-black tracking-tight leading-[1] whitespace-nowrap ${isComplete ? "text-white" : "text-[var(--color-ink)]"}`}>
                        {formatRupiah(tier.price)}
                      </p>
                    </div>

                    <ul className={`space-y-4 mb-10 flex-1 border-t pt-8 ${isComplete ? "border-white/10" : "border-[var(--color-cream-line)]"}`}>
                      {Array.isArray(tier.features) && tier.features.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full shrink-0 ${isComplete ? "bg-[var(--color-signal)]" : "bg-[var(--color-paper)]"}`}>
                            <Check className={`w-3.5 h-3.5 ${isComplete ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]"}`} strokeWidth={3} />
                          </div>
                          <span className={`text-[15px] font-medium leading-relaxed ${isComplete ? "text-white/90" : "text-[var(--color-muted-light)]"}`}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-center mt-auto">
                      <Link
                        href={`/checkout?program=${program.slug}&tier=${tier.tier_type}`}
                        className={`w-full py-4 px-6 rounded-full flex items-center justify-center text-[15px] font-black transition-all group-focus-within:ring-2 ${
                          isComplete
                            ? "bg-[var(--color-signal)] text-[var(--color-ink)] shadow-[var(--shadow-btn)] hover:bg-[var(--color-signal-hover)] hover:scale-[1.02]"
                            : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-2)] hover:scale-[1.02]"
                        }`}
                      >
                        {isComplete ? t("take_package") : t("choose_package")}
                        <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
