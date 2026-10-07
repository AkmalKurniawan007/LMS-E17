"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function FinalCTA({ dbContent = {}, whatsappDb = {} }: { dbContent?: any, whatsappDb?: any }) {
  const reduce = useReducedMotion();
  const t = useTranslations("FinalCTA");
  const headline = t("title");
  const subheadline = t("subtitle");
  const ctaPrimaryText = t("cta_primary");
  const ctaSecondaryText = t("cta_secondary");

  const waNumber = whatsappDb.number || "6280000000000";
  const waGreeting = whatsappDb.greeting || "Halo Tim E17, saya masih pemula dan ingin konsultasi paket mana yang paling cocok untuk tujuan belajar saya. Bisa dibantu?";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waGreeting)}`;

  return (
    <section className="py-24 md:py-32 bg-[var(--color-signal)] relative overflow-hidden">
      {/* Background Motifs */}
      <div aria-hidden className="absolute -top-10 -left-10 w-[300px] h-[200px] opacity-[0.06] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, var(--color-ink), var(--color-ink) 8px, transparent 8px, transparent 24px)' }} />
      <svg aria-hidden className="absolute -right-16 -bottom-16 w-80 h-80 text-[var(--color-bronze)]/10 pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
      
      <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: reduce ? 0 : 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="font-display italic uppercase text-[40px] md:text-[56px] lg:text-[72px] font-black text-[var(--color-ink)] leading-[1.05] tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: headline }} />
          <p className="text-[17px] md:text-[20px] text-[var(--color-ink)]/70 mb-12 font-medium max-w-xl mx-auto">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#pricing"
              className="w-full sm:w-auto bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-white px-8 py-4 rounded-full font-bold text-[16px] shadow-xl hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-2 focus:ring-offset-[var(--color-signal)]"
            >
              {ctaPrimaryText}
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto bg-transparent border-2 border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] text-[var(--color-ink)] px-8 py-4 rounded-full font-bold text-[16px] flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-2 focus:ring-offset-[var(--color-signal)]"
            >
              <MessageCircle className="w-5 h-5 text-[var(--color-ink)]/50 group-hover:text-[var(--color-ink)] transition-colors" />
              {ctaSecondaryText}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
