"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "../data/marketing-data";
import { motion, useReducedMotion } from "framer-motion";

export default function FinalCTA({ dbContent = {}, whatsappDb = {} }: { dbContent?: any, whatsappDb?: any }) {
  const shouldReduceMotion = useReducedMotion();
  const headline = dbContent.headline || "Siap memulai karir digital Anda?";
  const subheadline = dbContent.subheadline || "Ambil langkah pertama sekarang, atau konsultasi gratis dengan tim kami.";
  const ctaPrimaryText = dbContent.cta_primary_text || "Pilih Program Anda";
  const ctaSecondaryText = dbContent.cta_secondary_text || "Tanya via WhatsApp";

  // Use whatsappDb for the link or fallback
  const waNumber = whatsappDb.number || "6281234567890";
  const waGreeting = whatsappDb.greeting || "Halo, saya tertarik mendaftar bootcamp di E17 Course. Mohon info lebih lanjut.";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waGreeting)}`;

  return (
    <section className="py-24 md:py-32 bg-[#FFD400] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="text-[40px] md:text-[56px] font-black text-[#1C1A14] leading-[1.1] tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: headline }} />
          <p className="text-[18px] md:text-[20px] text-[#2A2100] mb-12 font-medium">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#pricing"
              className="w-full sm:w-auto bg-[#1C1A14] hover:bg-[#2A2100] text-white px-8 py-4 rounded-[12px] font-bold text-[16px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1A14] focus:ring-offset-2 focus:ring-offset-[#FFD400]"
            >
              {ctaPrimaryText}
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-transparent border-2 border-[#1C1A14] hover:bg-[#1C1A14]/5 text-[#1C1A14] px-8 py-4 rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1A14] focus:ring-offset-2 focus:ring-offset-[#FFD400]"
            >
              <MessageCircle className="w-5 h-5" />
              {ctaSecondaryText}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
