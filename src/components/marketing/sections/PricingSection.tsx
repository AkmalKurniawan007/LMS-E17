"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { programs, formatPrice, getDiscountPercent, PricingTier } from "../data/marketing-data";
import CheckoutLoginModal from "./CheckoutLoginModal";
import { useRouter } from "next/navigation";

export default function PricingSection({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(programs[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>(undefined);

  const activeProgram = programs.find((p) => p.id === activeTab) || programs[0];

  const handleCheckoutClick = (tier: PricingTier) => {
    if (isLoggedIn) {
      router.push(`/checkout?program=${activeProgram.id}&tier=${tier.type}`);
    } else {
      setSelectedTier(tier);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <CheckoutLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        program={activeProgram}
        tier={selectedTier}
      />
      <section id="pricing" className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Soft background aurora */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Investasi untuk <br className="hidden md:block"/>
              masa depan Anda.
            </h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
              Mulai dari video mandiri atau langsung masuk bootcamp interaktif
              dengan mentoring intensif.
            </p>
          </motion.div>

          {/* Program tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setActiveTab(program.id)}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === program.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {activeTab === program.id && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute inset-0 border-2 border-orange-500 rounded-xl pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{program.shortName}</span>
              </button>
            ))}
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {activeProgram.tiers?.map((tier, i) => {
                const discount = getDiscountPercent(tier.originalPrice, tier.price);
                const isPopular = tier.popular;

                return (
                  <PricingCard 
                    key={`${activeProgram.id}-${tier.type}`} 
                    tier={tier} 
                    activeProgram={activeProgram} 
                    discount={discount} 
                    i={i} 
                    handleCheckoutClick={handleCheckoutClick} 
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

// Sub-component for individual pricing card to handle mouse movement state locally
function PricingCard({ tier, activeProgram, discount, i, handleCheckoutClick }: any) {
  const isPopular = tier.popular;
  
  // Spotlight effect logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, delay: i * 0.1, type: "spring" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative rounded-3xl flex flex-col group h-full ${
        isPopular ? "z-10 p-[3px] shadow-[0_0_40px_rgba(249,115,22,0.2)]" : "z-0 mt-0 md:mt-4 mb-0 md:mb-4 p-[1px]"
      }`}
    >
      {/* Animated Border Layer & Spotlight (isolated overflow to prevent badge clipping) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        {/* Spotlight Hover Effect */}
        <motion.div
          className="absolute inset-0 z-20 transition-opacity duration-300 mix-blend-overlay"
          animate={{ opacity: isHovering ? 1 : 0 }}
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(249,115,22,0.15), transparent 40%)`,
          }}
        />

        {isPopular ? (
          <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(249,115,22,1)_360deg)] animate-[spin_3s_linear_infinite]" />
        ) : (
          <div className="absolute inset-0 bg-slate-200" />
        )}
      </div>

      <div className={`relative z-10 flex-1 rounded-[21px] p-6 md:p-8 flex flex-col bg-white h-full ${
        isPopular ? "shadow-2xl shadow-orange-500/10" : "shadow-md shadow-slate-200/50"
      }`}>
                      
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                          <motion.span 
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-[11px] font-extrabold tracking-widest uppercase px-5 py-2 rounded-full shadow-lg shadow-orange-500/40 ring-2 ring-white"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Rekomendasi
                          </motion.span>
                        </div>
                      )}

                      <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-2 text-center">
                        {tier.label}
                      </h3>
                      <p className="text-xs md:text-sm font-semibold text-slate-500 mb-8 text-center">
                        {activeProgram.shortName}
                      </p>

                      {/* Price */}
                      {/* Price */}
                      <div className="mb-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-xs md:text-sm line-through font-bold text-slate-400">
                            {formatPrice(tier.originalPrice)}
                          </span>
                          <span className="px-2 py-1 rounded-md text-[10px] md:text-xs font-extrabold bg-orange-50 text-orange-600 border border-orange-100">
                            Hemat {discount}%
                          </span>
                        </div>
                        <p className="text-3xl md:text-4xl lg:text-[2.5rem] font-black tracking-tight text-slate-900 whitespace-nowrap">
                          {formatPrice(tier.price)}
                        </p>
                      </div>

                      {/* CTA Below Price */}
                      <div className="flex justify-center mb-10">
                        <button
                          onClick={() => handleCheckoutClick(tier)}
                          className={`w-full max-w-[240px] py-3.5 rounded-xl text-center text-sm md:text-[15px] font-bold transition-all duration-300 relative overflow-hidden group ${
                            isPopular
                              ? "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/30 hover:shadow-orange-500/20"
                              : "bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                          )}
                          <span className="relative z-10">{isPopular ? "Ambil Paket Bootcamp" : "Ambil Paket Video"}</span>
                        </button>
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-4 flex-1">
                        {tier.features.map((f: string, fi: number) => (
                          <li key={fi} className="flex items-start gap-3">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? "bg-orange-100" : "bg-slate-100"}`}>
                              <Check className={`w-3 h-3 ${isPopular ? "text-orange-600" : "text-slate-600"}`} />
                            </div>
                            <span className="text-sm md:text-[15px] font-medium text-slate-700 leading-snug">{f}</span>
                          </li>
                        ))}
                        {tier.excludes?.map((f: string, fi: number) => (
                          <li key={`ex-${fi}`} className="flex items-start gap-3 opacity-40">
                            <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
                              <X className="w-3 h-3 text-slate-500" />
                            </div>
                            <span className="text-sm md:text-[15px] font-medium text-slate-500 leading-snug line-through">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
  );
}
