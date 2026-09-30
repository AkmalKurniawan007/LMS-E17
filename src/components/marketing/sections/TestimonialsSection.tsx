"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { testimonialsData } from "../data/marketing-data";
import { Star } from "lucide-react";

export default function TestimonialsSection({ dbContent = {} }: { dbContent?: any }) {
  const headline = dbContent.headline || "Cerita Sukses\nAlumni E17 Course.";
  const subheadline = dbContent.subheadline || "Jangan hanya dengar dari kami. Lihat apa yang dikatakan oleh mereka yang telah membuktikan sendiri.";
  const items = dbContent.items?.length ? dbContent.items : testimonialsData;
  const shouldReduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Slight parallax effect on the cards
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="py-24 bg-[#FFFBEF] overflow-hidden relative border-t border-[#EFE6CC]">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="md:w-1/3">
            <motion.h2 
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[36px] font-bold text-[#1C1A14] mb-4 tracking-tight leading-[1.2]"
            >
              Cerita Sukses<br />Alumni E17 Course.
            </motion.h2>
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
              className="text-[#6B6355] text-[18px]"
            >
              {subheadline}
            </motion.p>
          </div>
          
          <div className="md:w-2/3 w-full relative">
            {/* Horizontal scrollable container */}
            <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 gap-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {items.map((testimonial: any, i: number) => (
                <motion.div
                  key={i}
                  style={shouldReduceMotion ? {} : { y: i % 2 !== 0 ? y : 0 }}
                  className="min-w-[300px] md:min-w-[350px] w-[80vw] md:w-[350px] flex-shrink-0 snap-center bg-white border border-[#EFE6CC] shadow-[0_8px_24px_rgba(28,26,20,0.08)] rounded-[16px] p-8 flex flex-col"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`w-5 h-5 ${idx < (testimonial.rating || 5) ? "fill-[#FFD400] text-[#FFD400]" : "text-[#EFE6CC]"}`} 
                      />
                    ))}
                  </div>
                  
                  <p className="text-[#1C1A14] font-medium leading-relaxed mb-8 flex-grow">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="mt-auto flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FFFBEF] border border-[#EFE6CC] overflow-hidden shrink-0">
                      {testimonial.avatarUrl ? (
                        <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF7A1A] font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1C1A14]">{testimonial.name}</h4>
                      <p className="text-[13px] text-[#6B6355]">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
