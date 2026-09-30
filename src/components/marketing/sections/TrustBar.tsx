"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function TrustBar({ dbContent = {} }: { dbContent?: any }) {
  const shouldReduceMotion = useReducedMotion();
  const headline = dbContent.headline || "Dipercaya oleh 1.200+ pelajar dari institusi & perusahaan terkemuka";
  const partners = dbContent.partners || [
    "Universitas Indonesia",
    "Institut Teknologi Bandung",
    "Universitas Gadjah Mada",
    "Telkomsel",
    "Gojek",
    "Tokopedia",
    "Traveloka",
    "Shopee",
  ];

  return (
    <section className="py-8 bg-white border-b border-[#EFE6CC] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-6">
        <p className="text-center text-[13px] font-semibold text-[#6B6355] uppercase tracking-wider">
          {headline}
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <motion.div
          animate={shouldReduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
          transition={{
            duration: shouldReduceMotion ? 0 : 30,
            ease: "linear",
            repeat: shouldReduceMotion ? 0 : Infinity,
          }}
          className="flex whitespace-nowrap items-center gap-12 md:gap-24 px-6 md:px-12"
        >
          {/* Double the array for seamless infinite loop */}
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
            >
              <span className="text-xl font-bold text-[#6B6355] font-sans tracking-tight">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
