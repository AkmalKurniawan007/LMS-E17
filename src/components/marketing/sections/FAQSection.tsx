"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { faqData } from "../data/marketing-data";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`border-b border-slate-200 last:border-0 transition-colors duration-300 ${
        isOpen ? "bg-white/60" : "hover:bg-white/40"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-4 md:px-6 text-left cursor-pointer group"
      >
        <span
          className={`text-base md:text-lg font-bold pr-8 transition-colors duration-200 ${
            isOpen ? "text-orange-600" : "text-slate-900 group-hover:text-orange-500"
          }`}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOpen
              ? "bg-orange-100 text-orange-600"
              : "bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500"
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
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 pt-0">
              <p className="text-slate-600 text-[15px] md:text-base leading-relaxed font-medium">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#FAFAF8] relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
            Pertanyaan yang<br className="md:hidden" /> sering diajukan.
          </h2>
          <p className="text-slate-500 text-lg">
            Temukan jawaban untuk pertanyaan umum seputar program kami.
          </p>
        </motion.div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          {faqData.map((faq, i) => (
            <FAQItem
              key={i}
              index={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
