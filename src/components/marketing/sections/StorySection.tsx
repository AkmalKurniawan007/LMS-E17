"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function StorySection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="story" className="w-full bg-[#FFFBEF] py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Column: Text content */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
            className="w-full lg:w-[50%]"
          >
            <h2 className="text-[26px] md:text-[36px] font-bold text-[#1C1A14] leading-[1.2] mb-6">
              Bukan sekadar tutorial, ini adalah simulasi dunia kerja sesungguhnya.
            </h2>
            <div className="space-y-6 text-[16px] md:text-[18px] text-[#6B6355] font-medium leading-relaxed">
              <p>
                Banyak kelas online hanya mengajarkan teori tanpa memberi tahu bagaimana menerapkannya di proyek nyata. Akibatnya, Anda tahu kodingannya, tapi bingung saat ditanya rekruter tentang studi kasus.
              </p>
              <p>
                Di E17 Course, kami membalik pendekatannya. Anda akan belajar langsung dengan membangun proyek sungguhan sejak hari pertama. Mentor kami adalah praktisi aktif yang akan mereview kode Anda persis seperti di perusahaan teknologi.
              </p>
              <p>
                Hasil akhirnya? Anda tidak hanya mendapat sertifikat, tetapi portofolio solid yang bisa Anda banggakan saat melamar kerja.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
            className="w-full lg:w-[50%]"
          >
            <div className="relative rounded-[16px] overflow-hidden shadow-[0_8px_24px_rgba(28,26,20,0.08)] bg-white border border-[#EFE6CC] aspect-[4/3] md:aspect-[16/10] lg:aspect-square">
              {/* Fallback image representing practical work / student collaborating */}
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Siswa sedang berdiskusi memecahkan masalah koding bersama mentor"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
