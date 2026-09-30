"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqData } from "../data/marketing-data";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
  shouldReduceMotion
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : index * 0.1 }}
      className={`border-b border-[#EFE6CC] last:border-0 transition-colors duration-300 ${
        isOpen ? "bg-[#FFFBEF]/60" : "hover:bg-[#FFFBEF]/40"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-4 md:px-6 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFD400]"
      >
        <span
          className={`text-[16px] md:text-[18px] font-bold pr-8 transition-colors duration-200 ${
            isOpen ? "text-[#FF7A1A]" : "text-[#1C1A14] group-hover:text-[#FF7A1A]"
          }`}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOpen
              ? "bg-[#FFFBEF] text-[#FF7A1A] border border-[#FFD400]"
              : "bg-white text-[#6B6355] border border-[#EFE6CC] group-hover:bg-[#FFFBEF] group-hover:text-[#FF7A1A]"
          }`}
        >
          <Plus className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 pt-0">
              <p className="text-[#6B6355] text-[15px] md:text-[16px] leading-relaxed font-medium">
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
  const headline = dbContent.headline || "Sebelum daftar,<br className=\"md:hidden\" /> mungkin Anda bertanya...";
  const subheadline = dbContent.subheadline || "Ini pertanyaan yang paling sering kami dengar dari calon peserta.";
  const items = dbContent.items?.length ? dbContent.items : faqData;
  const shouldReduceMotion = useReducedMotion();

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[36px] font-bold text-[#1C1A14] leading-tight mb-4 tracking-tight" dangerouslySetInnerHTML={{ __html: headline }} />
          <p className="text-[#6B6355] text-[18px]">
            {subheadline}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto bg-white rounded-[16px] border border-[#EFE6CC] shadow-[0_8px_24px_rgba(28,26,20,0.08)] overflow-hidden">
          {items.map((faq: any, i: number) => (
            <FAQItem
              key={i}
              index={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
