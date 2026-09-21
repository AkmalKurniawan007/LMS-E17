"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppUrl } from "../data/marketing-data";

export default function WhatsAppFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 px-4 py-3 max-w-[200px]"
              >
                <button
                  onClick={() => setShowTooltip(false)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                  aria-label="Tutup tooltip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">
                  Ada pertanyaan?
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chat kami lewat WhatsApp.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat via WhatsApp"
          >
            <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 transition-colors duration-200">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
