"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

type Benefit = {
  id: string;
  title: string;
  description: string;
};

const BenefitCard = ({
  benefit,
  className = "",
  index,
  featured = false,
}: {
  benefit: Benefit;
  className?: string;
  index: number;
  featured?: boolean;
}) => {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || reduce) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative snap-start shrink-0 w-[85%] sm:w-[60%] md:w-auto min-h-[240px] rounded-2xl p-7 lg:p-8 border border-white/10 bg-[var(--color-ink-2)] overflow-hidden group hover:border-[var(--color-signal)]/40 hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {/* Cursor glow */}
      {!reduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(360px circle at ${pos.x}px ${pos.y}px, rgba(255,212,0,0.12), transparent 45%)`,
          }}
        />
      )}

      {featured && (
        <>
          <div
            aria-hidden
            className="absolute -right-10 -bottom-10 w-[240px] h-[160px] opacity-[0.15] pointer-events-none"
            style={{ background: "repeating-linear-gradient(45deg, var(--color-signal), var(--color-signal) 8px, transparent 8px, transparent 20px)" }}
          />
          <svg aria-hidden className="absolute right-8 top-8 w-20 h-20 text-[var(--color-bronze)]/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <span className="font-mono text-sm font-bold text-[var(--color-signal)] mb-8 flex items-center gap-3">
          {benefit.id}
          <span className="h-px w-8 bg-[var(--color-signal)]/40 group-hover:w-14 transition-all duration-300" />
        </span>
        <h3 className={`font-bold text-white mb-3 leading-snug ${featured ? "text-2xl md:text-[32px] font-display italic uppercase tracking-tight max-w-md" : "text-xl"}`}>
          {benefit.title}
        </h3>
        <p className="text-[15px] text-[var(--color-muted)] leading-relaxed mt-auto max-w-md">{benefit.description}</p>
      </div>
    </motion.div>
  );
};

export default function BenefitsSection() {
  const reduce = useReducedMotion();
  const t = useTranslations("Benefits");

  const benefits: Benefit[] = [
    {
      id: "01",
      title: t("b1_title"),
      description: t("b1_desc"),
    },
    {
      id: "02",
      title: t("b2_title"),
      description: t("b2_desc"),
    },
    {
      id: "03",
      title: t("b3_title"),
      description: t("b3_desc"),
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[var(--color-ink)] overflow-hidden">
      <div aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, var(--color-bronze) 0%, transparent 45%)" }} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(var(--color-cream-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-cream-line) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduce ? 0 : 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] leading-[1] tracking-tight text-white">
              Kenapa Kamu Harus <br className="hidden md:block" />
              Belajar di <span className="text-[var(--color-signal)]">E17?</span>
            </h2>
          </div>
          <p className="text-[var(--color-muted)] max-w-sm text-[15px] leading-relaxed">
            Dari panduan terstruktur hingga proyek nyata, kami merancang pengalaman belajar agar kamu siap direkrut.
          </p>
        </motion.div>

        {/* Mobile: horizontal snap carousel. Desktop: bento grid */}
        <div className="-mx-6 px-6 md:mx-0 md:px-0 flex md:grid md:grid-cols-6 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <BenefitCard benefit={benefits[0]} index={0} featured className="md:col-span-6 md:min-h-[250px]" />
          <BenefitCard benefit={benefits[1]} index={1} className="md:col-span-3" />
          <BenefitCard benefit={benefits[2]} index={2} className="md:col-span-3" />
        </div>
        <p className="md:hidden mt-4 font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Geser →</p>
      </div>
    </section>
  );
}
