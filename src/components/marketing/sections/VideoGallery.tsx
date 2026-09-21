"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Code, PenTool, Database, TrendingUp, ArrowRight, Play } from "lucide-react";
import { programs } from "../data/marketing-data";
import Link from "next/link";

const programIconMap: Record<string, React.ReactNode> = {
  "fullstack-web": <Code className="w-8 h-8" />,
  "ui-ux": <PenTool className="w-8 h-8" />,
  "data-science": <Database className="w-8 h-8" />,
  "digital-marketing": <TrendingUp className="w-8 h-8" />,
};

const programAccents: Record<string, string> = {
  "fullstack-web": "from-blue-100 to-blue-50 text-blue-600 border-blue-200",
  "ui-ux": "from-purple-100 to-purple-50 text-purple-600 border-purple-200",
  "data-science": "from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200",
  "digital-marketing": "from-orange-100 to-orange-50 text-orange-600 border-orange-200",
};

export default function VideoGallery() {
  const targetRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const updateDimension = () => {
      if (carouselRef.current) {
        setWindowWidth(window.innerWidth);
        // Total width of all items minus the viewport width
        const distance = carouselRef.current.scrollWidth - window.innerWidth;
        setScrollRange(distance > 0 ? distance : 0);
      }
    };
    
    updateDimension();
    window.addEventListener("resize", updateDimension);
    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Apply a softer, more fluid spring for butter-smooth inertia
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 80,   // lowered from 400 (softer acceleration)
    damping: 20,     // lowered from 90 (more bounce/inertia)
    mass: 0.5,
    restDelta: 0.001 
  });
  
  const isMobile = windowWidth > 0 && windowWidth < 768;
  const x = useTransform(smoothProgress, [0, 1], [0, -scrollRange]);

  return (
    <section 
      ref={targetRef} 
      id="programs" 
      className="relative bg-slate-900" // Changed to dark for cinematic video feel
      style={{ height: isMobile ? "auto" : "400vh" }} 
    >
      <div className={isMobile ? "py-24 px-6" : "sticky top-0 h-screen flex flex-col overflow-hidden"}>
        
        <div className="flex h-full overflow-hidden w-full">
          <motion.div 
            ref={carouselRef}
            suppressHydrationWarning
            style={isMobile ? {} : { x }} 
            className={`flex h-full ${isMobile ? "flex-col gap-16" : ""}`}
          >
            {/* Introductory Panel */}
            <div className={`flex flex-col justify-center shrink-0 ${isMobile ? "w-full" : "w-screen px-[10vw]"}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-bold tracking-wide mb-6 border border-white/10">
                  <Play className="w-4 h-4 text-orange-500" />
                  Kenali Mentor Anda
                </div>
                <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                  Pengalaman belajar <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    yang immersive.
                  </span>
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed max-w-xl">
                  {isMobile ? "Scroll ke bawah" : "Scroll ke samping"} untuk melihat cuplikan kelas dari masing-masing program bootcamp kami.
                </p>
              </motion.div>
            </div>

            {/* Program Panels */}
            {programs.map((program, i) => (
              <div 
                key={program.id}
                className={`flex items-center shrink-0 ${isMobile ? "w-full flex-col gap-8" : "w-screen px-[5vw]"}`}
              >
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                  
                  {/* Left: Info */}
                  <div className="w-full md:w-5/12 flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${programAccents[program.id]} flex items-center justify-center border shadow-sm`}>
                        {programIconMap[program.id] || <Code className="w-8 h-8" />}
                      </div>
                      <div className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-white/5">
                        {program.sessions} Sesi
                      </div>
                    </div>

                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">
                      {program.name}
                    </h3>
                    
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                      {program.description}
                    </p>

                    <div className="space-y-4 mb-10">
                      {program.features.slice(0, 3).map((f, fi) => (
                        <div key={fi} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-base font-medium text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>

                    <Link 
                      href={`/program/${program.id}`}
                      className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-[15px] transition-all hover:bg-slate-100 hover:scale-105 w-fit"
                    >
                      Lihat Silabus Lengkap <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Right: Video Player */}
                  <div className="w-full md:w-7/12">
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group bg-slate-800">
                      
                      {/* TODO: Replace src with actual mentor video URL */}
                      {/* Using a placeholder aesthetic gradient animation in place of missing video */}
                      <div className="absolute inset-0 bg-slate-900">
                         <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(249,115,22,0.3)_360deg)] animate-[spin_8s_linear_infinite]" />
                         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0f172a_100%)] opacity-80" />
                      </div>

                      <video 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        poster="/assets/placeholder-video.jpg"
                      >
                        {/* Dummy video source - change later */}
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Glass UI Overlay on Video */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="self-end bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md text-white text-xs font-bold border border-white/10 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Mentoring
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors border border-white/30">
                            <Play className="w-5 h-5 ml-1" />
                          </button>
                          <div>
                            <p className="text-white font-bold text-lg">Cuplikan Kelas</p>
                            <p className="text-white/70 text-sm">Preview suasana bootcamp nyata</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
