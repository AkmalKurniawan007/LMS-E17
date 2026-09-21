"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Sparkles, Users, Award, Briefcase, Video } from "lucide-react";
import { getWhatsAppUrl } from "../data/marketing-data";

// --- Animasi untuk Staggered Text ---
const textContainer: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 * i },
  }),
};

const textWord: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

// --- Komponen Floating Card ---
const FloatingCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  delay, 
  position, 
  floatRangeY,
  floatRangeX = [-5, 5],
  rotateRange = [-2, 2]
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  delay: number, 
  position: string, 
  floatRangeY: number[],
  floatRangeX?: number[],
  rotateRange?: number[]
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
      className={`absolute ${position} hidden lg:block z-20`}
    >
      <motion.div
        animate={{ 
          y: floatRangeY,
          x: floatRangeX,
          rotate: rotateRange
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut",
          delay 
        }}
        className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/40 p-4 rounded-2xl shadow-xl shadow-slate-200/50"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-500 shrink-0 border border-orange-100 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">{title}</p>
          <p className="text-[11px] font-semibold text-slate-500">{subtitle}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function HeroSection() {
  const { scrollY } = useScroll();
  const yBackground = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  const words = "Bootcamp intensif untuk jadi profesional tech.".split(" ");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#FAFAF8] overflow-hidden pt-20 pb-32">
      {/* --- Dynamic Aurora / Mesh Gradient Background --- */}
      <motion.div suppressHydrationWarning style={{ y: yBackground, opacity: opacityHero }} className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-300/20 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-200/10 rounded-full blur-[100px] mix-blend-multiply"
        />
      </motion.div>

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-slate-700 tracking-wide">Pendaftaran Batch Baru Telah Dibuka</span>
        </motion.div>

        {/* Staggered Headline */}
        <motion.h1
          variants={textContainer}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-6xl lg:text-[5rem] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={textWord}
              className="inline-block mr-[0.3em] last:mr-0"
            >
              {word === "profesional" || word === "tech." ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  {word}
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-slate-600 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto font-medium"
        >
          Belajar langsung dari praktisi industri, bangun portfolio nyata, dan dapatkan bimbingan karir intensif untuk mendapatkan pekerjaan impian Anda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group relative overflow-hidden bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-[15px] shadow-xl shadow-slate-900/20 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            {/* Shimmer effect inside button */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Eksplorasi Program</span>
          </Link>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2.5 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 bg-white/80 backdrop-blur-md border border-slate-200/60 hover:bg-white hover:border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <MessageCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
            Tanya via WhatsApp
          </a>
        </motion.div>
      </div>

      {/* --- Floating Glassmorphism Cards (Decorations) --- */}
      <FloatingCard 
        icon={Users} 
        title="Live Mentoring" 
        subtitle="Sesi 1-on-1 Intensif" 
        delay={0.2} 
        position="top-[20%] left-[8%]"
        floatRangeY={[-10, 15]}
        floatRangeX={[-5, 5]}
        rotateRange={[-2, 2]}
      />
      <FloatingCard 
        icon={Award} 
        title="Sertifikat Kelulusan" 
        subtitle="Kredibilitas Industri" 
        delay={0.5} 
        position="bottom-[25%] left-[12%]"
        floatRangeY={[15, -10]}
        floatRangeX={[5, -5]}
        rotateRange={[2, -2]}
      />
      <FloatingCard 
        icon={Briefcase} 
        title="Bimbingan Karir" 
        subtitle="Review CV & Portfolio" 
        delay={0.8} 
        position="top-[25%] right-[8%]"
        floatRangeY={[-15, 10]}
        floatRangeX={[-3, 4]}
        rotateRange={[-1, 3]}
      />
      <FloatingCard 
        icon={Video} 
        title="Akses Selamanya" 
        subtitle="Belajar Kapan Saja" 
        delay={1.1} 
        position="bottom-[30%] right-[10%]"
        floatRangeY={[10, -15]}
        floatRangeX={[4, -4]}
        rotateRange={[3, -1]}
      />

    </section>
  );
}
