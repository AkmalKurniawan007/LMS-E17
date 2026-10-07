"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { testimonialsData } from "../data/marketing-data";
import { Star } from "lucide-react";

const MarqueeRow = ({ items, reverse = false }: { items: any[]; reverse?: boolean }) => {
  const reduce = useReducedMotion();
  
  // Create 4 copies of the items to ensure it fills ultra-wide screens
  // 50% translation will exactly shift by 2 copies, creating a perfect loop
  const duplicatedItems = [...items, ...items, ...items, ...items];
  
  return (
    <div className="flex overflow-hidden w-full mb-6 relative">
      <motion.div
        className="flex min-w-max"
        animate={reduce ? {} : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
      >
        {duplicatedItems.map((t: any, i: number) => (
          <div
            key={i}
            className="w-[320px] shrink-0 bg-[var(--color-ink-2)] border border-white/10 rounded-2xl p-7 flex flex-col hover:border-[var(--color-signal)]/40 transition-colors mx-3"
          >
            <div className="flex gap-1 mb-5">
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-4 h-4 ${idx < (t.rating || 5) ? "fill-[var(--color-signal)] text-[var(--color-signal)]" : "text-white/20"}`}
                />
              ))}
            </div>
            
            <p className="text-white/85 font-medium leading-relaxed mb-8 flex-grow text-[15px]">
              "{t.quote}"
            </p>
            
            <div className="mt-auto flex items-center gap-4 border-t border-white/10 pt-5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] border border-[var(--color-bronze)]/30 overflow-hidden shrink-0">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-signal)] font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-[14px]">{t.name}</h4>
                <p className="text-[12px] text-[var(--color-muted)]">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function TestimonialsSection({ dbContent = {} }: { dbContent?: any }) {
  // CATATAN FASE 2: Komponen ini disembunyikan sampai ada testimoni riil/asli
  return null;

  const headline = dbContent.headline || "Cerita Sukses<br/>Alumni E17 Course.";
  const subheadline = dbContent.subheadline || "Jangan hanya dengar dari kami. Lihat apa yang dikatakan oleh mereka yang telah membuktikan sendiri.";
  const items = dbContent.items?.length ? dbContent.items : testimonialsData;
  const reduce = useReducedMotion();

  return (
    <section id="reviews" className="py-24 lg:py-32 bg-[var(--color-ink)] overflow-hidden relative">
      <div aria-hidden className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 80%, var(--color-signal) 0%, transparent 45%)" }} />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 lg:mb-24">
          <div>
            <motion.h2
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.6 }}
              className="font-display italic text-[36px] md:text-[48px] lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.05] uppercase"
              dangerouslySetInnerHTML={{ __html: headline }}
            />
          </div>
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.1 }}
            className="text-[var(--color-muted)] max-w-sm text-[15px] leading-relaxed"
          >
            {subheadline}
          </motion.p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {/* Desktop: 1 row of marquee */}
        <div className="hidden lg:block w-full">
          <MarqueeRow items={items} reverse={false} />
        </div>

        {/* Mobile: 1 row, horizontal scroll */}
        <div className="lg:hidden flex overflow-x-auto gap-5 px-6 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((t: any, i: number) => (
            <div
              key={i}
              className="w-[85vw] sm:w-[320px] shrink-0 snap-start bg-[var(--color-ink-2)] border border-white/10 rounded-2xl p-7 flex flex-col"
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${idx < (t.rating || 5) ? "fill-[var(--color-signal)] text-[var(--color-signal)]" : "text-white/20"}`}
                  />
                ))}
              </div>
              
              <p className="text-white/85 font-medium leading-relaxed mb-8 flex-grow text-[15px]">
                "{t.quote}"
              </p>
              
              <div className="mt-auto flex items-center gap-4 border-t border-white/10 pt-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] border border-[var(--color-bronze)]/30 overflow-hidden shrink-0">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-signal)] font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-[14px]">{t.name}</h4>
                  <p className="text-[12px] text-[var(--color-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
