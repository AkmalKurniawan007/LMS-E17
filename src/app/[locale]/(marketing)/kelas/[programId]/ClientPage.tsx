"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PlayCircle, CheckCircle, ArrowLeft, Clock, MonitorPlay, ChevronLeft, ChevronRight, Lock, Download, Sparkles, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassVideoPlayer({ role, purchasedTier }: { role?: string | null, purchasedTier?: string | null }) {
  const params = useParams();
  const programId = params.programId as string;
  const supabase = createClient();
  
  const [program, setProgram] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      const { data: programData, error: progError } = await supabase
        .from('marketing_programs')
        .select('*')
        .or(`id.eq.${programId},lms_program_id.eq.${programId}`)
        .single();
        
      if (!progError && programData) {
        setProgram(programData);
        
        const { data: currData, error: currError } = await supabase
          .from('marketing_program_curriculum')
          .select('*')
          .eq('program_id', programData.id)
          .order('sort_order', { ascending: true });
          
        if (!currError && currData) {
          setCurriculum(currData);
          if (currData.length > 0) {
            const availableVideos = currData.filter((item: any) => 
              role === 'admin' || role === 'mentor' || (purchasedTier && item.access_tiers?.includes(purchasedTier))
            );
            if (availableVideos.length > 0) {
              setActiveVideoId(availableVideos[0].id);
            }
          }
        }

        if (role !== 'admin' && role !== 'mentor') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { data: accessData } = await supabase
              .from('video_access')
              .select('expires_at')
              .eq('user_id', userData.user.id)
              .eq('program_id', programData.id)
              .single();
            
            if (accessData?.expires_at) {
              setExpiresAt(accessData.expires_at);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchClassData();
  }, [programId, supabase, role, purchasedTier]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-signal)]"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-ink)] text-center px-4">
        <h1 className="text-3xl font-black text-white mb-3">Kelas Tidak Ditemukan</h1>
        <p className="text-[var(--color-muted-light)] mb-8">Materi untuk kelas ini tidak tersedia atau link tidak valid.</p>
        <Link href="/">
          <Button className="bg-[var(--color-signal)] text-[var(--color-ink)] hover:bg-[var(--color-signal-hover)] font-bold px-8 py-3 rounded-full">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  const activeVideo = curriculum.find(v => v.id === activeVideoId);
  const activeIndex = curriculum.findIndex(v => v.id === activeVideoId);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = "";
        if (url.includes('youtu.be')) {
          videoId = url.split('/').pop()?.split('?')[0] || "";
        } else {
          videoId = new URL(url).searchParams.get('v') || "";
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      }
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}?color=f97316&title=0&byline=0&portrait=0`;
      }
    } catch (e) {
      console.error("Invalid video URL", e);
    }
    return url;
  };

  const currentVideoUrl = activeVideo?.video_url || activeVideo?.preview_video_url;
  const embedUrl = currentVideoUrl ? getEmbedUrl(currentVideoUrl) : "";

  return (
    <div className="min-h-screen bg-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-signal)] selection:text-[var(--color-ink)]">
      
      {/* CINEMATIC HEADER */}
      <header className="h-20 bg-transparent flex items-center px-6 lg:px-10 absolute top-0 w-full z-50 justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="flex items-center text-white/80 hover:text-white transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-[var(--color-signal)] group-hover:text-[var(--color-ink)] transition-all backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-wide uppercase">Beranda</span>
        </Link>
        <div className="flex items-center gap-4">
           {purchasedTier && (
             <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Sparkles className="w-4 h-4 text-[var(--color-signal)]" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">{purchasedTier} Access</span>
             </div>
           )}
        </div>
      </header>

      {/* THEATER STAGE (Video Area) */}
      <div className="w-full bg-black relative pt-20 pb-8 lg:pt-24 lg:pb-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ink)]/20 via-transparent to-[var(--color-ink)] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Player Container */}
          <div className="w-full bg-[#0a0f1c] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full absolute inset-0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-br from-[#0a0f1c] to-[var(--color-ink)]">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <PlayCircle className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Video Belum Tersedia</h3>
                <p className="text-sm text-white/50">Materi ini sedang dalam tahap penyempurnaan.</p>
              </div>
            )}
          </div>
          
          {/* Video Metadata Panel */}
          <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Sesi {activeIndex + 1}
                </span>
                <span className="text-white/60 text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {activeVideo?.duration || "00:00"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                {activeVideo?.title}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-3xl font-light">
                {activeVideo?.description}
              </p>
            </div>
            
            {/* Action / Expiry Card */}
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
              {/* Premium Ticket Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-signal)]/10 blur-[30px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Status Akses
                </h4>
                
                {(role === 'admin' || role === 'mentor') ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-mint)]/20 flex items-center justify-center">
                      <MonitorPlay className="w-5 h-5 text-[var(--color-mint)]" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Akses Spesial</div>
                      <div className="text-[var(--color-mint)] text-xs font-semibold">Admin / Mentor</div>
                    </div>
                  </div>
                ) : expiresAt ? (
                  <div>
                    <div className="text-3xl font-black text-white tracking-tighter mb-1">
                      {new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-[var(--color-signal)] text-sm font-semibold">
                      Tahun {new Date(expiresAt).getFullYear()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-signal)]/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[var(--color-signal)]" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">Lifetime</div>
                      <div className="text-[var(--color-signal)] text-xs font-semibold uppercase tracking-wider">Akses Selamanya</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Removed Download Resource Button */}
            </div>
          </div>
        </div>
      </div>

      {/* EPISODES GALLERY (Netflix Style) */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Daftar Materi</h2>
            <p className="text-white/50 text-sm">Pilih episode untuk melanjutkan pembelajaran Anda.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 w-10 h-10 p-0 rounded-full"
              onClick={() => setActiveVideoId(curriculum[activeIndex - 1]?.id)}
              disabled={activeIndex <= 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 w-10 h-10 p-0 rounded-full"
              onClick={() => setActiveVideoId(curriculum[activeIndex + 1]?.id)}
              disabled={activeIndex >= curriculum.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {curriculum.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-white/10 rounded-2xl bg-white/5 text-white/50">
              Belum ada materi untuk program ini.
            </div>
          ) : curriculum.map((item, idx) => {
            const isActive = item.id === activeVideoId;
            const hasAccess = role === 'admin' || role === 'mentor' || (purchasedTier && item.access_tiers?.includes(purchasedTier));
            
            if (!hasAccess) {
              return (
                <div key={item.id} className="group relative bg-white/5 rounded-2xl border border-white/5 p-5 flex flex-col h-[180px] opacity-50 cursor-not-allowed overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--color-ink)]/40 z-10 flex flex-col items-center justify-center">
                    <Lock className="w-8 h-8 text-white/50 mb-2" />
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">Terkunci</span>
                  </div>
                  <div className="flex justify-between items-start mb-auto">
                    <span className="text-4xl font-black text-white/10">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white/40 line-clamp-2 mb-1">{item.title}</h4>
                    <span className="text-[11px] text-white/30 font-medium">{item.duration}</span>
                  </div>
                </div>
              );
            }

            return (
              <button 
                key={item.id}
                onClick={() => setActiveVideoId(item.id)}
                className={`group text-left relative bg-[#131936] rounded-2xl border p-5 flex flex-col h-[180px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--color-signal)]/10 overflow-hidden ${
                  isActive ? "border-[var(--color-signal)] ring-1 ring-[var(--color-signal)]" : "border-white/10 hover:border-white/30"
                }`}
              >
                {/* Background glow on active */}
                {isActive && <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-signal)]/10 to-transparent pointer-events-none" />}
                
                <div className="flex justify-between items-start mb-auto relative z-10">
                  <span className={`text-4xl font-black transition-colors ${isActive ? "text-[var(--color-signal)]/30" : "text-white/10 group-hover:text-white/20"}`}>
                    {idx + 1}
                  </span>
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-signal)] text-[var(--color-ink)] flex items-center justify-center shadow-lg shadow-[var(--color-signal)]/40">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-ink)] animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="relative z-10">
                  <h4 className={`text-sm md:text-[15px] line-clamp-2 mb-2 transition-colors ${isActive ? "text-white font-extrabold" : "text-white/80 font-bold group-hover:text-white"}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center text-xs text-white/50 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {item.duration || "00:00"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Dark Footer variant */}
      <div className="mt-auto border-t border-white/5 bg-[#0a0e1a]">
        <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img src="/assets/logo-wide.png" alt="E17 Course" className="h-6 md:h-8 object-contain" />
          </div>
          <p className="text-white/40 text-sm font-medium text-center">
            © {new Date().getFullYear()} E17 Course. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
