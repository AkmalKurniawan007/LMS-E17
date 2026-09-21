"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { programs } from "@/components/marketing/data/marketing-data";
import { PlayCircle, CheckCircle, ArrowLeft, Clock, MonitorPlay, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClassVideoPlayer() {
  const params = useParams();
  const programId = params.programId as string;
  
  const program = programs.find(p => p.id === programId);
  
  // Jika program tidak ditemukan, kita fallback
  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Kelas Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">Materi untuk kelas ini tidak tersedia atau link tidak valid.</p>
        <Link href="/">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const curriculum = program.curriculum || [];
  const [activeVideoId, setActiveVideoId] = useState(curriculum[0]?.id);

  const activeVideo = curriculum.find(v => v.id === activeVideoId);
  const activeIndex = curriculum.findIndex(v => v.id === activeVideoId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mr-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline text-sm font-medium">Beranda</span>
        </Link>
        <div className="h-6 w-px bg-slate-200 mr-6 hidden sm:block"></div>
        <div className="flex-1 flex items-center">
          <div className="bg-orange-100 text-orange-600 p-1.5 rounded-md mr-3 hidden sm:block">
            <MonitorPlay className="w-4 h-4" />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {program.name}
          </h1>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT/TOP: VIDEO PLAYER AREA */}
        <div className="flex-1 flex flex-col">
          {/* Video Placeholder */}
          <div className="w-full bg-slate-900 aspect-video relative flex flex-col items-center justify-center group overflow-hidden">
            {/* Fake Video Player UI */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm cursor-pointer group-hover:scale-110 transition-transform">
              <PlayCircle className="w-8 h-8 text-white ml-1" />
            </div>
            
            {/* Fake Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="w-5 h-5 cursor-pointer hover:text-white" />
               <div className="h-1 flex-1 bg-white/20 rounded-full cursor-pointer">
                 <div className="h-1 w-1/3 bg-orange-500 rounded-full relative">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                 </div>
               </div>
               <span className="text-xs font-medium">04:20 / {activeVideo?.duration || "00:00"}</span>
            </div>
          </div>

          {/* Video Details */}
          <div className="p-6 md:p-8 bg-white border-b lg:border-b-0 border-slate-200">
             <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {activeIndex + 1}. {activeVideo?.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                    {activeVideo?.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveVideoId(curriculum[activeIndex - 1]?.id)}
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <Button 
                    className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                    disabled={activeIndex === curriculum.length - 1}
                    onClick={() => setActiveVideoId(curriculum[activeIndex + 1]?.id)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
             </div>
             
             {/* Note / Materials */}
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
               <h3 className="font-semibold text-blue-900 mb-1">Materi Tambahan</h3>
               <p className="text-sm text-blue-800 mb-3">Silakan unduh *slide* presentasi atau *source code* yang relevan dengan video ini.</p>
               <Button variant="outline" size="sm" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                 Unduh Berkas (.zip)
               </Button>
             </div>
          </div>
        </div>

        {/* RIGHT/BOTTOM: PLAYLIST SIDEBAR */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-white lg:border-l border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Kurikulum Kelas</h3>
              <p className="text-xs text-slate-500 mt-0.5">{curriculum.length} Video Materi</p>
            </div>
            {/* Progress Circular Mockup */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="100" strokeDashoffset="75" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700">25%</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {curriculum.map((item, idx) => {
                const isActive = item.id === activeVideoId;
                const isCompleted = idx < activeIndex; // Mock completed state
                
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveVideoId(item.id)}
                    className={`w-full text-left p-4 flex gap-4 transition-colors ${
                      isActive ? "bg-orange-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                          <PlayCircle className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 pr-2">
                      <h4 className={`text-sm font-medium line-clamp-2 mb-1.5 ${isActive ? "text-orange-700 font-bold" : "text-slate-700"}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center text-xs text-slate-500 gap-3">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {item.duration}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Locked Content Mockup */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-8">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Materi Expert (Terkunci)</h4>
               <div className="opacity-60 space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex gap-4 items-center">
                     <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                     <div className="flex-1">
                       <div className="h-4 w-3/4 bg-slate-200 rounded mb-1"></div>
                       <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-4">
                 <Button variant="outline" className="w-full text-xs h-8">Upgrade Paket untuk Akses</Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
