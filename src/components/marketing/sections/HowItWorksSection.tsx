"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PlayCircle, Target, Users, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type Step = {
  id: string;
  title: string;
  badge?: string;
  description: string;
  icon: React.ElementType;
};

function Chevron({ index }: { index: number }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="hidden lg:flex absolute top-10 -right-[22px] z-20 w-11 h-11 items-center justify-center">
      <motion.svg
        viewBox="0 0 24 24"
        className="w-7 h-7"
        initial={reduce ? { color: "var(--color-signal)" } : { color: "var(--color-cream-line)" }}
        whileInView={{ color: "var(--color-signal)" }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.3 + index * 0.25 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5l7 7-7 7" />
      </motion.svg>
    </div>
  );
}
export default function HowItWorksSection() {
  const reduce = useReducedMotion();
  const t = useTranslations("HowItWorks");

  const steps: Step[] = [
    {
      id: "01",
      title: t("s1_title"),
      description: t("s1_desc"),
      icon: PlayCircle,
    },
    {
      id: "02",
      title: t("s2_title"),
      description: t("s2_desc"),
      icon: Target,
    },
    {
      id: "03",
      title: t("s3_title"),
      badge: t("s3_badge"),
      description: t("s3_desc"),
      icon: Users,
    },
    {
      id: "04",
      title: t("s4_title"),
      badge: t("s4_badge"),
      description: t("s4_desc"),
      icon: Trophy,
    },
  ];

  return (
    <section className="relative w-full bg-[var(--color-bg)] py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.6 }}
          className="max-w-2xl mb-16 lg:mb-20"
        >
          <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] leading-[1] tracking-tight text-[var(--color-ink)] mb-5">
            {t("title")}
          </h2>
          <p className="text-[17px] text-[var(--color-muted-light)] font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Progress rail (desktop) */}
        <div aria-hidden className="hidden lg:block relative h-[3px] bg-[var(--color-cream-line)] mb-10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[var(--color-signal)] origin-left w-full"
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: reduce ? 0 : 1.4, ease: "easeInOut" }}
          />
        </div>

        <ol className="relative grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6">
          {/* Vertical rail (mobile) */}
          <span aria-hidden className="lg:hidden absolute left-[27px] top-2 bottom-2 w-[2px] bg-[var(--color-cream-line)]" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const last = index === steps.length - 1;
            return (
              <motion.li
                key={step.id}
                initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : index * 0.12 }}
                className="relative group flex lg:flex-col gap-5 pb-10 lg:pb-0"
              >
                <div
                  className={`relative z-10 shrink-0 w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:-translate-y-1 ${
                    last
                      ? "bg-[var(--color-signal)] border-[var(--color-signal)] text-[var(--color-ink)]"
                      : "bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-signal)]"
                  }`}
                >
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.75} />
                </div>

                {!last && <Chevron index={index} />}

                <div className="lg:pr-4">
                  <div className="flex items-center gap-2 mb-2 mt-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-bronze)] tracking-widest">LANGKAH {step.id}</span>
                    {step.badge && (
                      <span className="bg-[var(--color-ink)] text-[var(--color-signal)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--color-ink)] mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[var(--color-muted-light)] text-[15px] leading-relaxed">{step.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
