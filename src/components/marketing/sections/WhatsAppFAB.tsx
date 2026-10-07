"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WhatsAppFAB({ dbContent = {} }: { dbContent?: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Hardcoded Data
  const waNumber = "6280000000000";
  const greeting = "Halo Tim E17, saya masih pemula dan ingin konsultasi paket mana yang paling cocok untuk tujuan belajar saya. Bisa dibantu?";
  const dynamicWaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(greeting)}`;

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const tooltipTimer = setTimeout(() => setShowTooltip(true), 5000);
    const hideTooltipTimer = setTimeout(() => setShowTooltip(false), 12000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(tooltipTimer);
      clearTimeout(hideTooltipTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Desktop: Floating Action Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="hidden md:flex fixed bottom-6 right-6 z-50 items-end gap-3"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white rounded-xl shadow-[0_8px_24px_rgba(28,26,20,0.12)] border border-[var(--color-cream-line)] px-4 py-3 max-w-[200px] relative"
                >
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-paper)] hover:bg-[var(--color-cream-line)] rounded-full flex items-center justify-center text-[var(--color-muted)] transition-colors"
                    aria-label="Tutup tooltip"
                  >
                    <X className="w-3 h-3" strokeWidth={3} />
                  </button>
                  <p className="text-sm font-bold text-[var(--color-ink)] mb-1">
                    Butuh bantuan memilih paket?
                  </p>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Chat admin lewat WhatsApp.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAB */}
            <a
              href={dynamicWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat via WhatsApp"
              className="group"
            >
              <div className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.3)] transition-all duration-300 group-hover:-translate-y-1">
                <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </a>
          </motion.div>

          {/* Mobile: Sticky Bottom Bar */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-cream-line)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(28,26,20,0.08)] flex gap-3"
          >
            <Link
              href="/#pricing"
              className="flex-1 bg-[var(--color-signal)] text-[var(--color-ink)] rounded-full h-12 flex items-center justify-center font-bold text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:ring-offset-2"
            >
              Daftar Sekarang
            </Link>
            <a
              href={dynamicWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat via WhatsApp"
              className="w-12 h-12 shrink-0 bg-[#25D366] rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            >
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
            </a>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
