"use client";

import React, { useState } from "react";
import { PlayCircle, Clock, MonitorPlay, Sparkles, Lock, Check } from "lucide-react";

export default function ProgramCurriculumGallery({ 
  curriculum,
  isLoggedIn = false,
  hasPurchased = false
}: { 
  curriculum: any[],
  isLoggedIn?: boolean,
  hasPurchased?: boolean
}) {
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

  let videoUrlToPlay = null;
  let showPreviewBadge = false;

  if (hasPurchased) {
    videoUrlToPlay = getEmbedUrl(activeMaterial?.video_url || activeMaterial?.preview_video_url);
    showPreviewBadge = false;
  } else if (isLoggedIn) {
    videoUrlToPlay = getEmbedUrl(activeMaterial?.preview_video_url);
    showPreviewBadge = !!videoUrlToPlay;
  } else {
    // Guest - No video
    videoUrlToPlay = null;
  }


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
            {showPreviewBadge ? (
              <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    Preview
                  </span>
                </div>
              </div>
            ) : hasPurchased ? (
              <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    Akses Penuh Aktif
                  </span>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center p-8 lg:p-12">
            {!isLoggedIn ? (
              <>
                <div className="w-20 h-20 bg-[var(--color-paper)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-[var(--color-locked)]" />
                </div>
                <h3 className="text-white text-[24px] font-black mb-3">Materi Terkunci</h3>
                <p className="text-white/60 text-[15px] max-w-md mx-auto font-medium">
                  Masuk untuk lihat cuplikan.
                </p>
              </>
            ) : (
              <>
                <PlayCircle className="w-20 h-20 text-white/10 mx-auto mb-6" strokeWidth={1} />
                <h3 className="text-white text-[24px] font-black mb-3">Materi Terkunci</h3>
                <p className="text-white/60 text-[15px] max-w-md mx-auto font-medium">
                  Video materi penuh tersedia setelah Anda memilih paket dan mendaftar.
                </p>
              </>
            )}
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
                    {isActive ? (
                      <PlayCircle className="w-5 h-5" strokeWidth={2.5} />
                    ) : hasPurchased && idx < activeIndex ? (
                      <Check className="w-5 h-5 text-[var(--color-signal)]" strokeWidth={1.5} />
                    ) : (
                      <span className="text-[14px] font-black">{idx + 1}</span>
                    )}
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
