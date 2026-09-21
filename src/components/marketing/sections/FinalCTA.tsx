"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "../data/marketing-data";

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
      
      {/* Animated Aurora Glow inside the dark section */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[conic-gradient(from_90deg,rgba(249,115,22,0.3),rgba(59,130,246,0.3),rgba(249,115,22,0.3))] rounded-full blur-[100px] pointer-events-none"
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0f172a_100%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Saatnya mulai<br className="hidden md:block"/> karir tech Anda.
          </h2>

          <p className="text-slate-300 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-medium">
            Daftar bootcamp atau hubungi kami untuk konsultasi gratis. Kami siap membantu Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/login"
              className="group relative overflow-hidden bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20 w-full sm:w-auto text-center"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10">Daftar Sekarang</span>
            </Link>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 text-white px-8 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm hover:shadow-md hover:scale-105 w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
              Tanya via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
