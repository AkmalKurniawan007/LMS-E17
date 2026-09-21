"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ShieldCheck, Monitor, Users, Briefcase } from "lucide-react";
import { valueProps } from "../data/marketing-data";

const iconMap: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck className="w-6 h-6" />,
  monitor: <Monitor className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
};

// Variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

export default function ValueProposition() {
  return (
    <section className="py-24 md:py-32 bg-[#FAFAF8] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Standar baru dalam <br/>
            <span className="text-orange-500">bootcamp teknologi.</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
            Kami tidak hanya menjual video tutorial. Kami membimbing Anda sampai siap bersaing di industri nyata.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[240px]"
        >
          
          {/* Card 1: Wide (Col Span 2) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-slate-300 transition-colors"
          >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-orange-100/60 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-orange-200/60 transition-colors duration-500" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
                {iconMap[valueProps[0].icon]}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                  {valueProps[0].title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                  {valueProps[0].description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Tall (Row Span 2) */}
          <motion.div 
            variants={itemVariants}
            className="md:row-span-2 bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-800 shadow-xl shadow-slate-900/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/80 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mb-10 border border-white/10">
                {iconMap[valueProps[3].icon]}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white mb-4">
                  {valueProps[3].title}
                </h3>
                <p className="text-slate-400 text-[15px] leading-relaxed">
                  {valueProps[3].description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Standard Square */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
              {iconMap[valueProps[1].icon]}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {valueProps[1].title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {valueProps[1].description}
            </p>
          </motion.div>

          {/* Card 4: Standard Square */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-300">
              {iconMap[valueProps[2].icon]}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {valueProps[2].title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {valueProps[2].description}
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
