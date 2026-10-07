"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X as XIcon, Sparkles } from "lucide-react";
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

      <section id="pricing" className="py-24 md:py-32 bg-[var(--color-paper)] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
            className="mb-12 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[var(--color-ink)] leading-[1.1] mb-6 tracking-tight">
              Pilih cara belajar <br className="hidden md:block"/>
              yang cocok untuk Anda.
            </h2>
            <p className="text-[var(--color-muted)] text-[18px] leading-relaxed">
              Mau belajar mandiri lewat video, atau langsung dibimbing mentor
              sampai siap kerja? Keduanya tersedia.
            </p>
          </motion.div>

          {/* Selector Program (Pills) */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto items-end">
            <AnimatePresence>
              {activeProgram.tiers?.map((tier: any, i: number) => {
                const originalPrice = tier.original_price ?? tier.originalPrice ?? 0;
                const price = tier.price ?? 0;
                const discount = getDiscountPercent(originalPrice, price);
                const durationText = (tier.tier_type ?? tier.type) === "complete" ? "Akses 1 Tahun" : "Akses 6 Bulan";
                
                return (
                  <PricingCard 
                    key={`${activeProgram.id}-${tier.tier_type ?? tier.type}`} 
                    tier={tier} 
                    discount={discount} 
                    durationText={durationText}
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
function PricingCard({ tier, discount, durationText, i, handleCheckoutClick, shouldReduceMotion }: any) {
  const isPopular = tier.is_popular ?? tier.popular;
  
  return (
    <motion.div
      key={tier.tier_type ?? tier.type} // Ensures AnimatePresence works properly when changing programs
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: shouldReduceMotion ? 0 : i * 0.05, ease: "easeOut" }}
      className={`relative rounded-[16px] flex flex-col h-full ${
        isPopular 
          ? "z-10 bg-[var(--color-ink)] shadow-[var(--shadow-card-featured)] border-2 border-[var(--color-signal)] -mt-4 mb-4" 
          : "z-0 bg-[var(--color-bg)] shadow-sm border border-[var(--color-cream-line)] mt-4"
      }`}
    >
      <div className="flex-1 p-8 flex flex-col h-full relative">
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <span className="flex items-center gap-1.5 bg-[var(--color-signal)] text-[var(--color-ink)] text-[12px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> Rekomendasi
            </span>
          </div>
        )}

        <h3 className={`font-extrabold text-[24px] mb-8 text-center ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
          {tier.label}
        </h3>

        {/* Price */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-[14px] line-through font-bold ${isPopular ? "text-[var(--color-muted)]" : "text-[var(--color-line-strong)]"}`}>
              {formatPrice(tier.original_price ?? tier.originalPrice ?? 0)}
            </span>
            <span className={`px-2.5 py-1 rounded-[6px] text-[12px] font-extrabold ${isPopular ? "bg-[var(--color-signal)]/10 text-[var(--color-signal)] border border-[var(--color-signal)]/30" : "bg-[var(--color-bg-soft)] text-[var(--color-signal-hover)] border border-[var(--color-signal)]/30"}`}>
              Hemat {discount}%
            </span>
          </div>
          <p className={`text-[32px] lg:text-[40px] font-extrabold tracking-tight whitespace-nowrap ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>
            {formatPrice(tier.price)}
          </p>
          <p className={`text-[14px] font-bold mt-2 ${isPopular ? "text-[var(--color-mint)]" : "text-[var(--color-signal-hover)]"}`}>{durationText}</p>
        </div>

        {/* Features */}
        <ul className={`space-y-4 mb-8 flex-1 border-t pt-8 ${isPopular ? "border-[var(--color-ink-2)]" : "border-[var(--color-cream-line)]"}`}>
          {tier.features.map((f: string, fi: number) => (
            <li key={fi} className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? "bg-[var(--color-mint)]/20" : "bg-[var(--color-mint)]/10"}`}>
                <Check className={`w-3.5 h-3.5 ${isPopular ? "text-[var(--color-mint)]" : "text-[var(--color-mint)]"}`} />
              </div>
              <span className={`text-[15px] font-medium leading-snug ${isPopular ? "text-white" : "text-[var(--color-ink)]"}`}>{f}</span>
            </li>
          ))}
          {tier.excludes?.map((f: string, fi: number) => (
            <li key={`ex-${fi}`} className="flex items-start gap-3 opacity-40">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? "bg-[var(--color-ink-2)]" : "bg-[var(--color-cream-line)]"}`}>
                <XIcon className={`w-3.5 h-3.5 ${isPopular ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"}`} />
              </div>
              <span className={`text-[15px] font-medium leading-snug line-through ${isPopular ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"}`}>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA Below Price */}
        <div className="flex justify-center mt-auto">
          <button
            onClick={handleCheckoutClick}
            className={`w-full py-4 rounded-[12px] text-center text-[16px] font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-signal)] ${
              isPopular
                ? "bg-[var(--color-signal)] text-[var(--color-ink)] shadow-[var(--shadow-btn)] hover:bg-[var(--color-signal-hover)] hover:-translate-y-1"
                : "bg-[var(--color-bg)] text-[var(--color-ink)] hover:bg-[var(--color-bg-soft)] border border-[var(--color-cream-line)] shadow-sm hover:border-[var(--color-signal)]"
            }`}
          >
            {isPopular ? "Pilih Paket Bootcamp" : "Pilih Paket Video"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
