"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqData } from "../data/marketing-data";
import { useTranslations } from "next-intl";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
  reduce
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  reduce: boolean | null;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : index * 0.08 }}
      className={`relative border-b border-[var(--color-cream-line)] last:border-0 transition-colors duration-300 ${
        isOpen ? "bg-white" : "hover:bg-white/50"
      }`}
    >
      <div 
        aria-hidden 
        className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${isOpen ? "bg-[var(--color-signal)]" : "bg-transparent"}`} 
      />
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-6 lg:px-8 text-left cursor-pointer group focus:outline-none focus-visible:bg-[var(--color-paper)]"
      >
        <span
          className={`text-[17px] md:text-[19px] font-bold pr-8 transition-colors duration-200 ${
            isOpen ? "text-[var(--color-ink)]" : "text-[var(--color-muted)] group-hover:text-[var(--color-ink)]"
          }`}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 border ${
            isOpen
              ? "bg-[var(--color-signal)] text-[var(--color-ink)] border-[var(--color-signal)]"
              : "bg-transparent text-[var(--color-muted)] border-[var(--color-muted-light)] group-hover:border-[var(--color-ink)] group-hover:text-[var(--color-ink)]"
          }`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-6 lg:px-8 pb-8 pt-0">
              <p className="text-[var(--color-muted-light)] text-[15px] md:text-[16px] leading-relaxed max-w-3xl">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection({ dbContent = {} }: { dbContent?: any }) {
  const t = useTranslations("FAQ");
  const subheadline = t("subtitle");
  const items = faqData;
  const reduce = useReducedMotion();

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-[var(--color-paper)] relative">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduce ? 0 : 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] leading-[1] tracking-tight text-[var(--color-ink)] mb-5">
            {t("title1")} <br className="hidden md:block" /> {t("title2")}
          </h2>
          <p className="text-[17px] text-[var(--color-muted-light)] font-medium">
            {subheadline}
          </p>
        </motion.div>

        <div className="bg-[var(--color-paper)] border border-[var(--color-cream-line)] rounded-2xl overflow-hidden shadow-sm">
          {items.map((faq: any, i: number) => (
            <FAQItem
              key={i}
              index={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
