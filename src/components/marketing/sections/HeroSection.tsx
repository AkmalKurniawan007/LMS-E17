"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getWhatsAppUrl } from "../data/marketing-data";

export default function HeroSection({ dbContent = {}, dbPrograms = [] }: { dbContent?: any, dbPrograms?: any[] }) {
  const shouldReduceMotion = useReducedMotion();

  const t = useTranslations("Hero");

  // Hardcoded marketing copy
  const hl1 = t("title1");
  const hl2 = t("title2");
  const subheadline = t("description");
  const ctaPrimary = t("cta_primary");
  const ctaSecondary = t("cta_secondary");

  return (
    <section className="relative w-full min-h-screen flex items-center bg-[var(--color-ink)] pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, var(--color-bronze) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--color-cream-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-cream-line) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Diagonal speed stripes motif */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4" style={{ background: 'repeating-linear-gradient(45deg, var(--color-signal), var(--color-signal) 10px, transparent 10px, transparent 20px)' }} />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Column: Text content */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
            className="w-full lg:w-[55%] pt-8 lg:pt-0"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-bronze)]/30 bg-[var(--color-bronze)]/10 mb-6">
              <svg className="w-4 h-4 text-[var(--color-bronze)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-xs font-semibold tracking-wide text-white/90">{t("badge")}</span>
            </div>

            <h1 className="font-display italic text-[44px] md:text-[56px] lg:text-[72px] font-extrabold text-white leading-[1] mb-6 tracking-tight uppercase">
              {hl1} <br />
              <span className="relative inline-block text-[var(--color-signal)] lowercase text-[36px] md:text-[48px] lg:text-[60px] tracking-normal font-sans not-italic font-bold">
                {hl2}
                {/* Slanted underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[var(--color-signal)]" viewBox="0 0 100 24" preserveAspectRatio="none" fill="none">
                  <path d="M0 20 L100 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            
            <p className="text-[16px] md:text-[18px] text-gray-400 font-medium leading-relaxed mb-10 max-w-lg">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link
                href="/programs"
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] font-bold text-[16px] shadow-[var(--shadow-btn)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:ring-offset-2 focus:ring-offset-[var(--color-ink)] group flex items-center justify-center gap-2"
              >
                {ctaPrimary}
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              
              <Link
                href="#story"
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full border border-gray-600 text-white font-bold text-[16px] hover:bg-white/5 hover:border-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-ink)]"
              >
                {ctaSecondary}
              </Link>
            </div>

            {/* Dark Stats Row */}
            <div className="flex items-center gap-8 border-t border-[var(--color-ink-2)] pt-8">
              <div>
                <p className="text-3xl font-display font-bold text-white mb-1">50+</p>
                <p className="text-xs text-[var(--color-muted)] font-medium">Siswa Aktif</p>
              </div>
              <div className="w-px h-10 bg-[var(--color-ink-2)]" />
              <div>
                <p className="text-3xl font-display font-bold text-white mb-1">{dbPrograms.length || 4}</p>
                <p className="text-xs text-[var(--color-muted)] font-medium">Program Pilihan</p>
              </div>
              <div className="w-px h-10 bg-[var(--color-ink-2)]" />
              <div>
                <p className="text-3xl font-display font-bold text-white mb-1">90%</p>
                <p className="text-xs text-[var(--color-muted)] font-medium">Tingkat Lulus</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual The Achiever (Bootcamp Student) */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.2 }}
            className="w-full lg:w-[45%] relative h-[450px] md:h-[550px] mt-12 lg:mt-0 flex items-center justify-center"
          >
            {/* Main Photo Frame */}
            <div className="relative w-[85%] md:w-[75%] h-[85%] rounded-[40px] rounded-br-[120px] overflow-hidden border-[8px] border-[var(--color-ink)] shadow-[var(--shadow-gold)] z-10">
              <div className="absolute inset-0 bg-[var(--color-ink-2)] animate-pulse"></div>
              {/* High quality stock photo of diverse students/developers coding */}
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop" 
                alt="Siswa E17 Bootcamp Belajar Coding" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/80 via-transparent to-transparent"></div>
            </div>

            {/* Decorative blob behind */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[var(--color-signal)]/20 blur-[60px] rounded-full z-0"
            ></motion.div>

            {/* Floating Element 1: Top Right Tech Stack */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-8 -right-4 md:-right-8 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
               <div className="w-10 h-10 rounded-xl bg-[var(--color-sky)]/20 flex items-center justify-center border border-[var(--color-sky)]/30">
                 {/* React-like icon */}
                 <svg className="w-6 h-6 text-[var(--color-sky)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
               </div>
               <div>
                 <p className="text-white font-bold text-sm">Fullstack Dev</p>
                 <p className="text-[var(--color-signal)] text-[11px] font-semibold">Kurikulum Industri</p>
               </div>
            </motion.div>

            {/* Floating Element 2: Bottom Left Mentor Review */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-12 -left-6 md:-left-12 z-20 bg-[var(--color-ink-2)] border border-[var(--color-bronze)]/40 p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-[240px]"
            >
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joni&backgroundColor=f8fafc" alt="Mentor" className="w-10 h-10 rounded-full border border-[var(--color-cream-line)] shrink-0" />
               <div>
                 <p className="text-white font-bold text-xs mb-1">Mentor E17 <span className="text-[var(--color-mint)] ml-1">●</span></p>
                 <p className="text-[var(--color-line-strong)] text-[11px] leading-snug font-medium">"Logika kodenya sudah tajam. Portofolio siap dipakai melamar kerja!"</p>
               </div>
            </motion.div>

            {/* Floating Element 3: Bottom Right Hiring Partners */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 right-8 md:right-16 z-20 bg-[var(--color-signal)] text-[var(--color-ink)] p-3 rounded-xl shadow-[var(--shadow-btn)] flex items-center gap-3 font-bold"
            >
               <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
               <div className="text-left leading-tight">
                 <p className="text-[10px] uppercase tracking-wider font-black">Lulusan Kami</p>
                 <p className="text-sm">Siap Bekerja</p>
               </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
