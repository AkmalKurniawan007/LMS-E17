"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function PromoSection() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("BATCHBARU50");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 md:py-32 bg-white relative z-20 overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          className="relative rounded-[2rem] p-[1px] overflow-hidden"
        >
          {/* Animated Gradient Border Layer */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(249,115,22,0.4)_360deg)] opacity-70"
          />

          {/* Inner Card content */}
          <div className="relative z-10 bg-slate-900 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
            
            {/* Subtle inner mesh */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-60" />

            {/* Left content */}
            <div className="flex-1 text-center md:text-left relative z-20">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Flash Sale
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                Diskon 50% untuk <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  batch berikutnya.
                </span>
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-8 max-w-md">
                Gunakan kode voucher ini saat mendaftar. Berlaku untuk semua program bootcamp intensif.
              </p>

              {/* Countdown */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Berakhir dalam</span>
                <div className="flex gap-2">
                  {[
                    String(timeLeft.hours).padStart(2, "0"),
                    String(timeLeft.minutes).padStart(2, "0"),
                    String(timeLeft.seconds).padStart(2, "0"),
                  ].map((val, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-slate-600 font-bold self-center">:</span>}
                      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-white font-mono font-bold text-lg w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
                        {val}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Voucher code with glassmorphism */}
            <div className="w-full md:w-auto shrink-0 relative z-20">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl text-center shadow-2xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Kode voucher
                </p>
                <button
                  onClick={handleCopy}
                  className="bg-white w-full px-8 py-4 rounded-2xl cursor-pointer group hover:bg-slate-50 transition-all duration-300 border border-slate-200 flex items-center justify-between gap-6 shadow-xl shadow-orange-900/20 hover:-translate-y-1"
                >
                  <span className="text-2xl font-black text-slate-900 tracking-widest">
                    BATCHBARU50
                  </span>
                  <div className="bg-slate-100 text-slate-500 p-2.5 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                </button>
                <div className="h-6 mt-3 flex items-center justify-center">
                  <p
                    className={`text-sm font-bold transition-all duration-300 ${
                      copied ? "text-green-400 opacity-100 translate-y-0" : "text-slate-500 opacity-0 translate-y-2"
                    }`}
                  >
                    Berhasil disalin!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
