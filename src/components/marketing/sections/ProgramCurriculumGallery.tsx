"use client";

import React, { useState } from "react";
import { PlayCircle, Clock, MonitorPlay, Sparkles } from "lucide-react";

export default function ProgramCurriculumGallery({ curriculum }: { curriculum: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-[var(--color-bg)] rounded-[24px] p-12 border border-[var(--color-cream-line)] shadow-sm text-center">
        <p className="text-[var(--color-muted-light)] text-[16px] font-medium">Materi sedang disiapkan.</p>
      </div>
    );
  }

  const activeMaterial = curriculum[activeIndex];
  
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      return url; 
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : url;
  };

  const hasPreview = !!activeMaterial?.preview_video_url;
  const videoUrlToPlay = hasPreview ? getEmbedUrl(activeMaterial.preview_video_url) : null;

  const getAccessBadge = (accessTiers: string[]) => {
    if (!accessTiers || accessTiers.length === 0) return null;
    const hasJunior = accessTiers.includes("junior");
    const hasExpert = accessTiers.includes("expert");
    const hasBootcamp = accessTiers.includes("bootcamp");
  
    if (!hasJunior && hasExpert && hasBootcamp) {
      return (
        <span className="px-2 py-1 rounded-md text-[10px] font-black bg-[var(--color-ink)] text-white shrink-0 whitespace-nowrap mt-2 inline-flex items-center gap-1 uppercase tracking-wider">
          Mulai dari Expert
        </span>
      );
    }
    if (!hasJunior && !hasExpert && hasBootcamp) {
      return (
        <span className="px-2 py-1 rounded-md text-[10px] font-black bg-[var(--color-signal)] text-[var(--color-ink)] shrink-0 whitespace-nowrap mt-2 inline-flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3 h-3" /> Khusus Bootcamp
        </span>
      );
    }
    return null; 
  };

  return (
    <div className="max-w-6xl mx-auto bg-[var(--color-bg)] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(28,26,20,0.06)] border border-[var(--color-cream-line)] flex flex-col lg:flex-row">
      
      {/* Left: Video Player Area */}
      <div className="flex-1 bg-[var(--color-ink)] relative aspect-video lg:aspect-auto min-h-[300px] flex flex-col items-center justify-center">
        {videoUrlToPlay ? (
          <>
            <iframe
              key={activeMaterial.id || activeIndex}
              src={videoUrlToPlay}
              className="absolute inset-0 w-full h-full object-cover"
              allowFullScreen
              title={activeMaterial.title}
            />
            {/* Overlay Details */}
            <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Preview Materi
                </span>
              </div>
              <h3 className="text-white text-[24px] lg:text-[32px] font-extrabold drop-shadow-md leading-tight">
                {activeMaterial.title}
              </h3>
            </div>
          </>
        ) : (
          <div className="text-center p-8 lg:p-12">
            <PlayCircle className="w-20 h-20 text-white/10 mx-auto mb-6" strokeWidth={1} />
            <h3 className="text-white text-[24px] font-black mb-3">Materi Terkunci</h3>
            <p className="text-white/60 text-[15px] max-w-md mx-auto font-medium">
              Video materi penuh tersedia setelah Anda memilih paket dan mendaftar.
            </p>
          </div>
        )}
      </div>

      {/* Right: Curriculum Playlist */}
      <div className="w-full lg:w-[450px] flex flex-col h-[400px] lg:h-[600px] bg-[var(--color-paper)] border-t lg:border-t-0 lg:border-l border-[var(--color-cream-line)]">
        <div className="p-6 lg:p-8 border-b border-[var(--color-cream-line)] bg-[var(--color-bg)]">
          <h3 className="text-[20px] font-black text-[var(--color-ink)] flex items-center">
            <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] border border-[var(--color-cream-line)] flex items-center justify-center mr-3 shrink-0">
              <MonitorPlay className="w-4 h-4 text-[var(--color-ink)]" strokeWidth={2.5} />
            </div>
            Daftar Materi
          </h3>
          <p className="text-[13px] font-bold text-[var(--color-muted)] mt-2 uppercase tracking-widest pl-11">{curriculum.length} Video Pelajaran</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {curriculum.map((mat, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={mat.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-full text-left p-5 rounded-[20px] transition-all duration-300 border ${
                  isActive 
                    ? "bg-[var(--color-bg)] border-[var(--color-signal)] shadow-[0_4px_16px_rgba(28,26,20,0.04)] ring-1 ring-[var(--color-signal)]" 
                    : "bg-transparent border-transparent hover:bg-[var(--color-bg)] hover:border-[var(--color-cream-line)] hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? "bg-[var(--color-signal)] border-[var(--color-signal)] text-[var(--color-ink)]" : "bg-[var(--color-bg)] border-[var(--color-cream-line)] text-[var(--color-muted)]"
                  }`}>
                    {isActive ? <PlayCircle className="w-5 h-5" strokeWidth={2.5} /> : <span className="text-[14px] font-black">{idx + 1}</span>}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold text-[15px] leading-snug mb-1.5 ${
                      isActive ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                    }`}>
                      {mat.title}
                    </h4>
                    {mat.duration && (
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-bronze)] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>{mat.duration}</span>
                      </div>
                    )}
                    {getAccessBadge(mat.access_tiers)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
