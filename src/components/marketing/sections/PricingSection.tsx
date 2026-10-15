"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X as XIcon, Sparkles, ChevronRight } from "lucide-react";
import { programs as defaultPrograms, formatPrice, getDiscountPercent, PricingTier } from "../data/marketing-data";
import CheckoutLoginModal from "./CheckoutLoginModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function PricingSection(props: { isLoggedIn?: boolean, dynamicPrograms?: any[] }) {
  return (
    <Suspense fallback={<div className="py-32 text-center text-[#6B6355]">Memuat paket belajar...</div>}>
      <PricingSectionInner {...props} />
    </Suspense>
  );
}

function PricingSectionInner({ isLoggedIn = false, dynamicPrograms }: { isLoggedIn?: boolean, dynamicPrograms?: any[] }) {
  const programsToUse = dynamicPrograms?.length ? dynamicPrograms : defaultPrograms;
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  
  // Auth Modal State (hanya untuk login jika belum)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSelectedProgram, setAuthSelectedProgram] = useState<any>(undefined);
  const [authSelectedTier, setAuthSelectedTier] = useState<PricingTier | undefined>(undefined);

  // 1. Inisialisasi state dari URL atau program flagship atau program pertama
  const queryProgram = searchParams.get("program");
  const fallbackProgram = programsToUse.find((p: any) => p.is_flagship) || programsToUse[0];
  const defaultProgramId = programsToUse.some((p: any) => p.id === queryProgram) 
    ? queryProgram 
    : fallbackProgram?.id || "p1";
    
  const [activeTab, setActiveTab] = useState(defaultProgramId);

  useEffect(() => {
    if (queryProgram && programsToUse.some((p: any) => p.id === queryProgram) && queryProgram !== activeTab) {
      setActiveTab(queryProgram);
    }
  }, [queryProgram, programsToUse, activeTab]);

  // Sync state ke URL jika pindah tab untuk deep linking
  const handleTabChange = (programId: string) => {
    setActiveTab(programId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("program", programId);
      url.hash = "pricing";
      router.replace(url.pathname + url.search + url.hash, { scroll: false });
    }
  };

  const activeProgram = programsToUse.find((p: any) => p.id === activeTab) || programsToUse[0] || defaultPrograms[0];

  const handleCheckoutClick = (tier: PricingTier | any) => {
    if (isLoggedIn) {
      router.push(`/checkout?program=${activeProgram.id}&tier=${tier.tier_type ?? tier.type}`);
    } else {
      setAuthSelectedProgram(activeProgram);
      setAuthSelectedTier(tier);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <CheckoutLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        program={authSelectedProgram}
        tier={authSelectedTier}
      />

      <section id="pricing" suppressHydrationWarning className="py-24 md:py-32 bg-[var(--color-paper)] relative overflow-hidden">
        {/* Background Subtle Lines */}
        <div aria-hidden suppressHydrationWarning className="absolute -top-10 -left-10 w-[300px] h-[200px] opacity-[0.04] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, var(--color-ink), var(--color-ink) 8px, transparent 8px, transparent 24px)' }} />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
            className="mb-14 text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display italic uppercase text-[36px] md:text-[48px] font-black text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
              PILIH CARA BELAJAR <br className="hidden md:block"/>
              <span className="text-[var(--color-signal)]">YANG COCOK UNTUK ANDA</span>
            </h2>
            <p className="text-[var(--color-muted-light)] text-[17px] font-medium leading-relaxed">
              Semua paket mendapatkan akses penuh ke seluruh video pembelajaran. Pilih tingkat pendampingan mentor dan sertifikasi sesuai kebutuhan Anda.
            </p>
          </motion.div>

          {/* Selector Program (Pills) - tampil jika ada lebih dari 1 program */}
          {programsToUse.length > 1 && (
            <div className="flex justify-center mb-16">
              <div className="inline-flex bg-[var(--color-bg)] border border-[var(--color-cream-line)] p-1.5 rounded-full shadow-sm max-w-full overflow-x-auto hide-scrollbar">
                {programsToUse.map((program: any) => {
                  const isActive = activeTab === program.id;
                  return (
                    <button
                      key={program.id}
                      onClick={() => handleTabChange(program.id)}
                      role="button"
                      aria-pressed={isActive}
                      className={`relative px-6 py-2.5 rounded-full text-[15px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-signal)] whitespace-nowrap ${
                        isActive
                          ? "text-[var(--color-ink)] font-bold"
                          : "text-[var(--color-muted)] hover:text-[var(--color-ink)] font-medium hover:bg-[var(--color-bg-soft)]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-[var(--color-signal)] rounded-full shadow-sm"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30, duration: shouldReduceMotion ? 0 : undefined }}
                        />
                      )}
                      <span className="relative z-10">{program.shortName || program.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
            <AnimatePresence>
              {activeProgram.tiers?.map((tier: any, i: number) => {
                const originalPrice = tier.original_price ?? tier.originalPrice ?? 0;
                const price = tier.price ?? 0;
                const discount = getDiscountPercent(originalPrice, price);
                
                return (
                  <PricingCard 
                    key={`${activeProgram.id}-${tier.tier_type ?? tier.type}`} 
                    tier={tier} 
                    discount={discount} 
                    originalPrice={originalPrice}
                    price={price}
                    i={i} 
                    handleCheckoutClick={() => handleCheckoutClick(tier)} 
                    shouldReduceMotion={shouldReduceMotion}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

// Sub-component for individual pricing card
function PricingCard({ tier, discount, originalPrice, price, i, handleCheckoutClick, shouldReduceMotion }: any) {
  const isPopular = tier.is_popular ?? tier.popular ?? (tier.tier_type === "complete" || tier.type === "complete");
  
  return (
    <motion.div
      key={tier.tier_type ?? tier.type}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: shouldReduceMotion ? 0 : i * 0.05, ease: "easeOut" }}
      className={`relative rounded-[32px] flex flex-col h-full transition-all duration-300 group ${
        isPopular 
          ? "z-10 bg-[var(--color-ink)] text-white shadow-[var(--shadow-card-featured)] border-2 border-[var(--color-signal)] scale-100 lg:scale-105 hover:-translate-y-2" 
          : "z-0 bg-[var(--color-bg)] text-[var(--color-ink)] shadow-sm border border-[var(--color-cream-line)] hover:shadow-xl hover:border-[var(--color-ink)]/20 hover:-translate-y-1"
      }`}
    >
      <div className="flex-1 p-8 lg:p-10 flex flex-col h-full relative">
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <span className="flex items-center gap-1.5 bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> PALING POPULER
            </span>
          </div>
        )}

        <h3 className={`font-display italic uppercase text-[26px] lg:text-[28px] font-black text-center mb-3 tracking-tight ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
          {tier.label}
        </h3>

        {/* Price & Investment */}
        <div className="mb-8 text-center flex flex-col items-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest mb-1.5 text-[var(--color-bronze)]">
            INVESTASI
          </span>
          {discount > 0 && (
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className={`text-[13px] line-through font-bold ${isPopular ? "text-white/40" : "text-[var(--color-muted)]"}`}>
                {formatPrice(originalPrice)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isPopular ? "bg-[var(--color-signal)]/20 text-[var(--color-signal)]" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
                Hemat {discount}%
              </span>
            </div>
          )}
          <p className={`text-[36px] lg:text-[44px] font-black tracking-tight leading-none whitespace-nowrap ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Features */}
        <ul className={`space-y-4 mb-10 flex-1 border-t pt-8 ${isPopular ? "border-white/10" : "border-[var(--color-cream-line)]"}`}>
          {Array.isArray(tier.features) && tier.features.map((f: string, fi: number) => (
            <li key={fi} className="flex items-start gap-3">
              <div className={`mt-0.5 p-1 rounded-full shrink-0 ${isPopular ? "bg-[var(--color-signal)]" : "bg-[var(--color-paper)]"}`}>
                <Check className={`w-3.5 h-3.5 ${isPopular ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]"}`} strokeWidth={3} />
              </div>
              <span className={`text-[15px] font-medium leading-relaxed ${isPopular ? "text-white/90" : "text-[var(--color-muted-light)]"}`}>
                {f}
              </span>
            </li>
          ))}
          {tier.excludes?.map((f: string, fi: number) => (
            <li key={`ex-${fi}`} className="flex items-start gap-3 opacity-40">
              <div className={`mt-0.5 p-1 rounded-full shrink-0 ${isPopular ? "bg-white/10" : "bg-[var(--color-cream-line)]"}`}>
                <XIcon className={`w-3.5 h-3.5 ${isPopular ? "text-white/60" : "text-[var(--color-muted)]"}`} strokeWidth={2.5} />
              </div>
              <span className={`text-[15px] font-medium leading-relaxed line-through ${isPopular ? "text-white/50" : "text-[var(--color-muted)]"}`}>
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="flex justify-center mt-auto">
          <button
            onClick={handleCheckoutClick}
            className={`w-full py-4 px-6 rounded-full flex items-center justify-center text-[15px] font-black transition-all group-focus-within:ring-2 ${
              isPopular
                ? "bg-[var(--color-signal)] text-[var(--color-ink)] shadow-[var(--shadow-btn)] hover:bg-[var(--color-signal-hover)] hover:scale-[1.02]"
                : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-2)] hover:scale-[1.02]"
            }`}
          >
            {isPopular ? "Ambil Paket Ini" : "Pilih Paket"}
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
