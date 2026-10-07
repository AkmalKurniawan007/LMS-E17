"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, ChevronDown, Clock, BookOpen, Lock, X } from "lucide-react";
import { programs as defaultPrograms } from "../data/marketing-data";
import Link from "next/link";

export default function CurriculumSection({ dynamicPrograms, isLoggedIn, purchasedProgramId }: { dynamicPrograms?: any[], isLoggedIn?: boolean, purchasedProgramId?: string }) {
  const programsToUse = dynamicPrograms?.length ? dynamicPrograms : defaultPrograms;
  const [activeTab, setActiveTab] = useState(programsToUse[0]?.id || "p1");
  const activeProgram = programsToUse.find((p) => p.id === activeTab) || programsToUse[0] || defaultPrograms[0];

  const [expandedModule, setExpandedModule] = useState<string | null>(
    activeProgram?.curriculum?.[0]?.id || null
  );

  const [previewVideo, setPreviewVideo] = useState<{ title: string, url: string } | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      return url; 
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const isYouTube = (url: string) => {
    return url.includes("youtu.be") || url.includes("youtube.com");
  };

  return (
    <section id="curriculum" className="py-24 bg-[var(--color-bg)] relative overflow-hidden border-b border-[var(--color-cream-line)]">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-sky)]/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--color-ink)] leading-tight mb-6">
            Intip isi kelasnya
          </h2>
          <p className="text-[var(--color-muted)] text-lg">
            Kurikulum disusun oleh instruktur dan praktisi profesional. Tiap materi dirancang agar mudah dipahami dan bisa langsung dipraktikkan.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Program Tabs (Vertical on Desktop) */}
          <div className="lg:w-1/3 shrink-0">
            <div className="sticky top-28 flex flex-col gap-3">
              {programsToUse.map((program) => (
                <button
                  key={program.id}
                  onClick={() => {
                    setActiveTab(program.id);
                    setExpandedModule(program.curriculum?.[0]?.id || null);
                  }}
                  className={`w-full text-left px-6 py-5 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden ${
                    activeTab === program.id
                      ? "bg-[var(--color-ink)] text-white shadow-xl shadow-[var(--color-ink)]/10"
                      : "bg-[var(--color-bg)] text-[var(--color-muted)] hover:bg-[var(--color-bg-soft)] border border-[var(--color-cream-line)]"
                  }`}
                >
                  {activeTab === program.id && (
                    <motion.div 
                      layoutId="curriculum-active-tab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-signal)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <h3 className="text-lg relative z-10">{program.shortName}</h3>
                  <p className={`text-sm mt-1 relative z-10 ${activeTab === program.id ? "text-[var(--color-line-strong)]" : "text-[var(--color-muted-light)]"}`}>
                   {program.modules_count ?? program.modules ?? 0} Modul Total
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
                  activeProgram.curriculum.map((module: any, index: number) => {
                    const isExpanded = expandedModule === module.id;
                    return (
                      <motion.div
                        key={module.id}
                        initial={false}
                        className={`bg-[var(--color-bg)] rounded-2xl border transition-all duration-300 ${
                          isExpanded ? "border-[var(--color-signal)]/30 shadow-md shadow-[var(--color-signal)]/5 ring-1 ring-[var(--color-signal)]/10" : "border-[var(--color-cream-line)] hover:border-[var(--color-line-strong)] hover:shadow-sm"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                          className="w-full text-left px-6 py-6 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                              isExpanded ? "bg-[var(--color-signal)]/10 text-[var(--color-signal-hover)]" : "bg-[var(--color-bg-soft)] text-[var(--color-muted)]"
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className={`text-lg font-bold transition-colors ${
                                isExpanded ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                              }`}>
                                {module.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-muted-light)] font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{module.duration}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-[var(--color-muted)] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
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
                                  <p className="text-[var(--color-muted)] leading-relaxed text-[15px]">
                                    {module.description}
                                  </p>
                                  <div className="mt-4">
                                    {purchasedProgramId === activeProgram.id ? (
                                      <Link href={`/kelas/${activeProgram.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-mint)] hover:text-green-500 group bg-[var(--color-mint)]/10 px-4 py-2 rounded-lg transition-colors">
                                        <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Mulai Belajar (Materi Lengkap)
                                      </Link>
                                    ) : isLoggedIn ? (
                                      index === 0 ? (
                                        <button 
                                          onClick={() => setPreviewVideo({ title: module.title, url: module.videoUrl || "" })}
                                          className="flex items-center gap-2 text-sm font-semibold text-[var(--color-signal-hover)] hover:text-[var(--color-signal-active)] group bg-[var(--color-signal)]/10 px-4 py-2 rounded-lg transition-colors"
                                        >
                                          <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                          Tonton Cuplikan Video
                                        </button>
                                      ) : (
                                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] bg-[var(--color-bg-soft)] px-4 py-2 rounded-lg border border-[var(--color-cream-line)]">
                                          <Lock className="w-4 h-4" />
                                          Video Terkunci (Khusus Member)
                                        </div>
                                      )
                                    ) : (
                                      <Link href="/pembeli/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] group bg-[var(--color-bg-soft)] px-4 py-2 rounded-lg transition-colors border border-[var(--color-cream-line)]">
                                        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Login untuk melihat cuplikan
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-cream-line)] p-10 text-center">
                    <p className="text-[var(--color-muted)]">Materi kurikulum sedang dalam proses pembaruan.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative border border-slate-700"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-4 items-center w-full justify-between px-4">
                <span className="text-white font-semibold drop-shadow-md bg-black/50 px-3 py-1 rounded-full text-sm">
                  Preview: {previewVideo.title}
                </span>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md ml-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full aspect-video bg-black">
                {previewVideo.url && isYouTube(previewVideo.url) ? (
                  <iframe
                    src={getEmbedUrl(previewVideo.url) || ""}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={previewVideo.url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
