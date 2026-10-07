"use client";

import React from "react";
import { motion } from "framer-motion";
import { featureShowcaseData } from "../data/marketing-data";
import { CheckCircle2, PlayCircle, Users, LayoutDashboard, Award } from "lucide-react";
import Link from "next/link";

const MockupGraphic = ({ type }: { type: string }) => {
  if (type === "video") {
    return (
      <div className="w-full aspect-video bg-[var(--color-ink)] rounded-xl shadow-2xl border border-[var(--color-ink-2)] flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-ink)] via-[var(--color-ink-2)] to-[var(--color-ink)]"></div>
        <div className="relative flex-1 flex flex-col">
          <div className="h-10 border-b border-[var(--color-ink-2)] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-signal)]/80"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-mint)]/80"></div>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl cursor-pointer hover:scale-110 transition-transform">
              <PlayCircle className="w-8 h-8 text-white fill-white/20" />
            </div>
            {/* Progress bar mock */}
            <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-[var(--color-ink-2)] rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-[var(--color-signal)]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "live") {
    return (
      <div className="w-full aspect-video bg-[var(--color-ink)] rounded-xl shadow-2xl border border-[var(--color-ink-2)] flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-[var(--color-ink)]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--color-ink-2)] rounded-lg relative overflow-hidden flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-[var(--color-muted)]">
                <Users className="w-6 h-6" />
              </div>
              {i === 1 && (
                <div className="absolute bottom-2 left-2 bg-[var(--color-mint)] text-[var(--color-ink)] text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Speaking
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="h-12 bg-[var(--color-ink-2)] border-t border-[var(--color-ink)] flex items-center justify-center gap-4 px-4">
          <div className="w-8 h-8 rounded-full bg-[var(--color-ink)]"></div>
          <div className="w-8 h-8 rounded-full bg-[var(--color-ink)]"></div>
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/50"><XIcon /></div>
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="w-full aspect-video bg-white rounded-xl shadow-xl border border-[var(--color-cream-line)] flex flex-col overflow-hidden">
        <div className="h-10 border-b border-[var(--color-cream-line)] flex items-center px-4 gap-4 bg-[var(--color-bg-soft)]">
          <div className="w-24 h-4 bg-[var(--color-cream-line)] rounded"></div>
          <div className="w-16 h-4 bg-[var(--color-cream-line)] rounded ml-auto"></div>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-signal)]/10 flex items-center justify-center text-[var(--color-signal-hover)]">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="w-32 h-4 bg-[var(--color-cream-line)] rounded mb-2"></div>
              <div className="w-48 h-3 bg-[var(--color-cream-line)]/50 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 border border-[var(--color-cream-line)] rounded-lg p-3 flex flex-col justify-between">
                <div className="w-12 h-3 bg-[var(--color-cream-line)] rounded"></div>
                <div className="w-8 h-6 bg-[var(--color-cream-line)]/50 rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex-1 border border-[var(--color-cream-line)] rounded-lg flex items-end p-4 gap-2">
            {[40, 70, 45, 90, 60, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-[var(--color-signal)] rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "certificate") {
    return (
      <div className="w-full aspect-[4/3] bg-[var(--color-bg-soft)] rounded-xl shadow-xl border border-[var(--color-cream-line)] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-cream-line)_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="w-full h-full border-4 border-double border-[var(--color-cream-line)] bg-white shadow-sm p-8 flex flex-col items-center justify-center text-center relative z-10">
          <Award className="w-12 h-12 text-[var(--color-signal)] mb-4" />
          <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4">Certificate of Completion</div>
          <div className="w-48 h-8 bg-[var(--color-ink)] rounded-sm mb-6"></div>
          <div className="w-32 h-2 bg-[var(--color-cream-line)] mb-2"></div>
          <div className="w-40 h-2 bg-[var(--color-cream-line)] mb-8"></div>
          
          <div className="flex w-full justify-between mt-auto px-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-[var(--color-cream-line)] mb-1"></div>
              <div className="w-12 h-1.5 bg-[var(--color-cream-line)]/50"></div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[var(--color-signal)]/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[var(--color-signal)]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="w-full aspect-video bg-[var(--color-bg-soft)] rounded-xl"></div>;
};

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default function FeatureShowcase({ dbContent = {} }: { dbContent?: any }) {
  const headline = dbContent.headline || "Satu platform untuk semua kebutuhan belajar Anda.";
  const subheadline = dbContent.subheadline || "Kami membangun sistem yang membuat proses belajar dari nol hingga mahir menjadi jauh lebih efektif, tanpa perlu berganti-ganti aplikasi.";
  const items = dbContent.items?.length ? dbContent.items : featureShowcaseData;

  return (
    <section className="py-24 bg-[var(--color-paper)] overflow-hidden" id="features">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--color-ink)] tracking-tight mb-4">
            {headline}
          </h2>
          <p className="text-lg text-[var(--color-muted)]">
            {subheadline}
          </p>
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {items.map((feature: any, index: number) => {
            const isLeft = feature.align === "left";
            return (
              <div key={index} className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                
                {/* Text Content */}
                <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-4">{feature.title}</h3>
                    <p className="text-lg text-[var(--color-muted)] mb-8 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="flex flex-col gap-4 mb-8">
                      {feature.points.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-[var(--color-mint)] shrink-0" />
                          <span className="text-[var(--color-ink)] font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/pembeli/login"
                      className="inline-flex items-center text-[var(--color-signal-hover)] font-bold hover:text-[var(--color-signal)] transition-colors group"
                    >
                      Mulai belajar sekarang
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </motion.div>
                </div>

                {/* Visual / Mockup */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <MockupGraphic type={feature.imageType} />
                  </motion.div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
