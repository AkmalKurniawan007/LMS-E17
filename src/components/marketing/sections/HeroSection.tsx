"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getWhatsAppUrl } from "../data/marketing-data";

export default function HeroSection({ dbContent = {}, dbPrograms = [] }: { dbContent?: any, dbPrograms?: any[] }) {
  const shouldReduceMotion = useReducedMotion();

  // Use DB data or fallback to defaults
  const hl1 = dbContent.headline_line1 || "Bangun karir tech Anda";
  const hl2 = dbContent.headline_line2 || "dengan portofolio nyata.";
  const subheadline = dbContent.subheadline || "E17 Course adalah bootcamp berstandar nasional. Belajar langsung dari praktisi, bangun proyek sungguhan, dan siapkan diri Anda untuk dilirik rekruter.";
  const ctaPrimary = dbContent.cta_primary || "Lihat Paket";
  const ctaSecondary = dbContent.cta_secondary || "Lihat Story";

  return (
    <section className="relative w-full overflow-hidden bg-white pt-24 pb-32 lg:pt-32 lg:pb-48">
      {/* Bold yellow block on the right side for the "bold moment" */}
      <div className="absolute top-0 right-0 w-1/3 lg:w-[45%] h-full bg-[#FFD400] rounded-bl-[80px] pointer-events-none hidden md:block" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Column: Text content */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
            className="w-full lg:w-[55%] pt-8 lg:pt-16"
          >
            <h1 className="text-[34px] md:text-[48px] lg:text-[56px] font-extrabold text-[#1C1A14] leading-[1.1] mb-6 tracking-tight">
              {hl1} <br />
              <span className="text-[#6B6355]">{hl2}</span>
            </h1>
            
            <p className="text-[16px] md:text-[18px] text-[#6B6355] font-medium leading-relaxed mb-12 max-w-lg">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/programs"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-[10px] bg-gradient-to-br from-[#FF7A1A] to-[#FF3D68] text-white font-bold text-[16px] shadow-[0_8px_24px_rgba(28,26,20,0.08)] hover:-translate-y-0.5 transition-transform focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] focus:ring-offset-2"
              >
                {ctaPrimary}
              </Link>
              
              <Link
                href="#story"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-[10px] border border-[#EFE6CC] text-[#1C1A14] font-bold text-[16px] hover:bg-[#FFFBEF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:ring-offset-2"
              >
                {ctaSecondary}
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-8 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 border-t border-[#EFE6CC] pt-6">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
              </div>
              <p className="text-[14px] text-[#6B6355] font-medium max-w-[200px] leading-tight">
                Bergabung bersama <strong className="text-[#1C1A14]">50+ siswa aktif</strong> di {dbPrograms.length || 4} program pilihan.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.2 }}
            className="w-full lg:w-[45%] mt-12 lg:mt-0 relative"
          >
            {/* Main Visual Image - Realistic UI or Mentor */}
            <div className="relative rounded-[16px] overflow-hidden shadow-[0_8px_24px_rgba(28,26,20,0.08)] bg-white border border-[#EFE6CC] aspect-[4/3] md:aspect-square lg:aspect-[4/5]">
              {/* Fallback image block representing UI/Mentor photo */}
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Mentor mengajarkan materi di kelas E17 Course"
                className="w-full h-full object-cover"
              />
              
              {/* Top Left Badge: Kurikulum Industri */}
              <div className="absolute top-4 left-4 sm:-left-6 lg:-left-12 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-[10px] shadow-lg border border-[#EFE6CC] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFBEF] flex items-center justify-center text-[#FFD400]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div>
                  <p className="text-[#1C1A14] font-bold text-[14px]">Kurikulum Industri {new Date().getFullYear()}</p>
                </div>
              </div>
              
              {/* Floating overlay card for extra context (HIDDEN)
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-[10px] shadow-lg border border-[#EFE6CC] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFBEF] flex items-center justify-center text-[#FF7A1A] font-bold text-xl shrink-0">
                  98%
                </div>
                <div>
                  <p className="text-[#1C1A14] font-bold text-[15px]">Tingkat Kelulusan</p>
                  <p className="text-[#6B6355] text-[13px] font-semibold">Berdasarkan data alumni 2025</p>
                </div>
              </div>
              */}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
