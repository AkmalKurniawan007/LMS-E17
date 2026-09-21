"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, ChevronDown, Clock, BookOpen } from "lucide-react";
import { programs } from "../data/marketing-data";

export default function CurriculumSection() {
  const [activeTab, setActiveTab] = useState(programs[0].id);
  const activeProgram = programs.find((p) => p.id === activeTab) || programs[0];

  const [expandedModule, setExpandedModule] = useState<string | null>(
    activeProgram.curriculum?.[0]?.id || null
  );

  return (
    <section id="curriculum" className="py-24 bg-[#FAFAF8] relative overflow-hidden border-b border-slate-200">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm mb-4">
            <BookOpen className="w-4 h-4" />
            Intip Materi
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Apa yang akan Anda pelajari?
          </h2>
          <p className="text-slate-500 text-lg">
            Kurikulum kami dirancang oleh praktisi industri untuk memastikan Anda belajar *skill* yang relevan dengan kebutuhan dunia kerja saat ini.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Program Tabs (Vertical on Desktop) */}
          <div className="lg:w-1/3 shrink-0">
            <div className="sticky top-28 flex flex-col gap-3">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => {
                    setActiveTab(program.id);
                    setExpandedModule(program.curriculum?.[0]?.id || null);
                  }}
                  className={`w-full text-left px-6 py-5 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden ${
                    activeTab === program.id
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {activeTab === program.id && (
                    <motion.div 
                      layoutId="curriculum-active-tab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <h3 className="text-lg relative z-10">{program.shortName}</h3>
                  <p className={`text-sm mt-1 relative z-10 ${activeTab === program.id ? "text-slate-300" : "text-slate-400"}`}>
                    {program.modules} Modul Total
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Modules Accordion */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProgram.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {activeProgram.curriculum && activeProgram.curriculum.length > 0 ? (
                  activeProgram.curriculum.map((module, index) => {
                    const isExpanded = expandedModule === module.id;
                    return (
                      <motion.div
                        key={module.id}
                        initial={false}
                        className={`bg-white rounded-2xl border transition-all duration-300 ${
                          isExpanded ? "border-orange-200 shadow-md shadow-orange-500/5 ring-1 ring-orange-500/10" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                          className="w-full text-left px-6 py-6 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                              isExpanded ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className={`text-lg font-bold transition-colors ${
                                isExpanded ? "text-slate-900" : "text-slate-700"
                              }`}>
                                {module.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{module.duration}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pt-0">
                                <div className="pl-[60px]">
                                  <p className="text-slate-600 leading-relaxed text-[15px]">
                                    {module.description}
                                  </p>
                                  <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 group">
                                    <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Tonton Cuplikan Video
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="text-slate-500">Materi kurikulum sedang dalam proses pembaruan.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
