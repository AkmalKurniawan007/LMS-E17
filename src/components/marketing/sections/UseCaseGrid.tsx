"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCasesData } from "../data/marketing-data";
import { GraduationCap, Briefcase, Laptop, Compass, BookOpen, Building } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Laptop: <Laptop className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Building: <Building className="w-6 h-6" />,
};

export default function UseCaseGrid({ dbContent = {} }: { dbContent?: any }) {
  const headline = dbContent.headline || "Untuk Siapa E17 Course?";
  const subheadline = dbContent.subheadline || "Materi kami dirancang secara fleksibel dan komprehensif, cocok untuk siapapun yang ingin beradaptasi dengan kebutuhan industri saat ini.";
  const items = dbContent.items?.length ? dbContent.items : useCasesData;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight"
          >
            {headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            {subheadline}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((useCase: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 mb-6 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-200 transition-colors">
                {iconMap[useCase.icon]}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{useCase.title}</h3>
              <p className="text-slate-600 leading-relaxed">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
