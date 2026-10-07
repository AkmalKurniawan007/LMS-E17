"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function StorySection({ dbContent = {} }: { dbContent?: any }) {
  const reduce = useReducedMotion();
  const t = useTranslations("Story");

  const headline = t("headline");
  const subheadline = t("subheadline");
  const paragraphs = [
    t("p1"),
    t("p2"),
    t("p3")
  ];

  const fadeUp = (delay = 0) => ({
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: reduce ? 0 : 0.6, ease: "easeOut" as const, delay: reduce ? 0 : delay },
  });

  return (
    <section id="story" className="relative w-full bg-[var(--color-paper)] py-24 lg:py-32 overflow-hidden">
      {/* Diagonal stripe accent top-left */}
      <div
        aria-hidden
        className="absolute -top-10 -left-10 w-[260px] h-[160px] opacity-[0.12] pointer-events-none"
        style={{ background: "repeating-linear-gradient(-45deg, var(--color-bronze), var(--color-bronze) 6px, transparent 6px, transparent 18px)" }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: sticky editorial header */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <motion.h2
                {...fadeUp(0.05)}
                className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] leading-[1] tracking-tight text-[var(--color-ink)] mb-6 text-balance"
                dangerouslySetInnerHTML={{ __html: headline }}
              />
              <motion.p {...fadeUp(0.1)} className="text-[17px] lg:text-[19px] text-[var(--color-muted-light)] leading-relaxed max-w-md">
                {subheadline}
              </motion.p>
            </div>
          </div>

          {/* Right: story paragraphs */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                {...fadeUp(0.1 + i * 0.08)}
                className="text-[17px] md:text-[20px] text-[var(--color-ink)] leading-relaxed bg-[var(--color-bg)] border border-[var(--color-cream-line)] rounded-2xl p-6 md:p-8 shadow-sm"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
