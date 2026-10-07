"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, BookOpen, Clock, Code, Layout, Database } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CurriculumTabsSection({ programs = [] }: { programs?: any[] }) {
  const [activeTab, setActiveTab] = useState(programs[0]?.id || "");
  const t = useTranslations("Kurikulum");

  if (!programs || programs.length === 0) return null;

  const activeProgram = programs.find((p) => p.id === activeTab) || programs[0];

  // Helper function to map program names to icons
  const getIconForProgram = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("web") || lower.includes("frontend") || lower.includes("backend") || lower.includes("fullstack")) return <Code className="w-5 h-5" strokeWidth={2.5} />;
    if (lower.includes("ui") || lower.includes("ux") || lower.includes("design")) return <Layout className="w-5 h-5" strokeWidth={2.5} />;
    if (lower.includes("data") || lower.includes("ai") || lower.includes("machine")) return <Database className="w-5 h-5" strokeWidth={2.5} />;
    return <BookOpen className="w-5 h-5" strokeWidth={2.5} />;
  };

  return (
    <section id="curriculum" className="w-full bg-[var(--color-paper)] py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <h2 className="font-display italic uppercase text-[36px] md:text-[48px] lg:text-[56px] font-extrabold text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
            {t("tabs_title1")} <span className="text-[var(--color-signal)]">{t("tabs_title2")}</span>
          </h2>
          <p className="text-[17px] text-[var(--color-muted-light)] font-medium leading-relaxed">
            {t("tabs_subtitle")}
          </p>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {programs.map((program) => {
            const isActive = activeTab === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setActiveTab(program.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[15px] font-extrabold transition-all duration-300 focus:outline-none ${
                  isActive 
                    ? "bg-[var(--color-ink)] text-white shadow-xl scale-105 border border-transparent" 
                    : "bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-cream-line)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)]/20"
                }`}
              >
                {getIconForProgram(program.name)}
                {program.shortName || program.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="bg-[var(--color-bg)] rounded-[24px] border border-[var(--color-cream-line)] shadow-sm overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProgram.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              
              {/* Left Side: Overview & CTA */}
              <div className="col-span-1 lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[var(--color-cream-line)] flex flex-col bg-[var(--color-bg)]">
                <div className="inline-block mb-4">
                  <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full">
                    Kurikulum Terpilih
                  </span>
                </div>
                <h3 className="text-[28px] lg:text-[36px] font-bold text-[var(--color-ink)] leading-tight mb-4 tracking-tight">
                  {activeProgram.name}
                </h3>
                <p className="text-[var(--color-muted-light)] text-[16px] leading-relaxed font-medium mb-8">
                  {activeProgram.description}
                </p>
                
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-cream-line)] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-[var(--color-ink)]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[12px] font-extrabold text-[var(--color-muted)] uppercase tracking-wider mb-0.5">Total Materi</p>
                      <p className="text-[18px] font-black text-[var(--color-ink)]">{activeProgram.curriculum?.length || 0} Sesi Pembelajaran</p>
                    </div>
                  </div>
                  
                  {activeProgram.features && activeProgram.features.length > 0 && (
                    <div className="pt-6 border-t border-[var(--color-cream-line)]">
                      <p className="text-[12px] font-extrabold text-[var(--color-muted)] uppercase tracking-wider mb-4">Fokus Pembelajaran</p>
                      <ul className="space-y-3">
                        {activeProgram.features.slice(0, 3).map((feat: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="bg-[var(--color-signal)] p-0.5 rounded-full mt-0.5 shrink-0">
                              <Check className="w-3.5 h-3.5 text-[var(--color-ink)]" strokeWidth={3} />
                            </div>
                            <span className="text-[var(--color-ink)] text-[15px] font-bold leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-8">
                  <Link 
                    href={`/program/${activeProgram.id}`}
                    className="inline-flex items-center justify-center w-full py-4 px-6 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-white font-bold text-[15px] rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-2"
                  >
                    Lihat Program Detail
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>

              {/* Right Side: Curriculum Timeline */}
              <div className="col-span-1 lg:col-span-7 bg-[var(--color-paper)]">
                <div className="p-8 lg:p-12">
                  <h4 className="text-[20px] font-black text-[var(--color-ink)] mb-8 flex items-center">
                    Daftar Materi Pembelajaran
                    <span className="ml-3 bg-[var(--color-signal)] text-[var(--color-ink)] text-[12px] font-bold px-3 py-1 rounded-full">
                      {activeProgram.curriculum?.length || 0} Bab
                    </span>
                  </h4>

                  <div className="space-y-6 relative border-l-[3px] border-[var(--color-cream-line)] ml-3 pl-8">
                    {activeProgram.curriculum && activeProgram.curriculum.length > 0 ? (
                      activeProgram.curriculum.map((item: any, index: number) => (
                        <div key={item.id} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[45px] top-1 w-8 h-8 bg-[var(--color-paper)] border-[3px] border-[var(--color-cream-line)] rounded-full flex items-center justify-center group-hover:border-[var(--color-signal)] transition-colors">
                            <span className="text-[12px] font-bold text-[var(--color-muted)] group-hover:text-[var(--color-ink)]">{index + 1}</span>
                          </div>
                          
                          <div className="bg-[var(--color-bg)] rounded-[16px] p-6 border border-[var(--color-cream-line)] group-hover:border-[var(--color-signal)] group-hover:shadow-[0_4px_12px_rgba(28,26,20,0.03)] transition-all">
                            <h5 className="font-extrabold text-[17px] text-[var(--color-ink)] mb-2">{item.title}</h5>
                            {item.description && (
                              <p className="text-[15px] text-[var(--color-muted-light)] leading-relaxed mb-4 font-medium">
                                {item.description}
                              </p>
                            )}
                            {item.duration && (
                              <div className="inline-flex items-center gap-1.5 bg-[var(--color-paper)] border border-[var(--color-cream-line)] px-3 py-1.5 rounded-lg text-[var(--color-ink)] text-[13px] font-bold">
                                <Clock className="w-4 h-4 text-[var(--color-bronze)]" strokeWidth={2.5} />
                                <span>{item.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[var(--color-bg)] rounded-2xl p-8 border border-[var(--color-cream-line)] text-center">
                        <p className="text-[var(--color-muted-light)] font-medium">Silabus untuk program ini sedang diperbarui.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
