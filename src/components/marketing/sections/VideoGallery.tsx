"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function VideoGallery({ 
  dynamicPrograms, 
  isLoggedIn, 
  purchasedProgramId 
}: { 
  dynamicPrograms?: any[], 
  isLoggedIn?: boolean, 
  purchasedProgramId?: string 
}) {
  const shouldReduceMotion = useReducedMotion();
  const programsToUse = dynamicPrograms || [];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll active pill into view on mobile
    if (pillRefs.current[activeIndex]) {
      pillRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    const maxIndex = programsToUse.length - 1;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = index < maxIndex ? index + 1 : 0;
        break;
      case "ArrowLeft":
        nextIndex = index > 0 ? index - 1 : maxIndex;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = maxIndex;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(nextIndex);
    pillRefs.current[nextIndex]?.focus();
  };

  if (programsToUse.length === 0) return null;

  return (
    <section id="curriculum" className="w-full bg-[var(--color-ink)] py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[36px] font-bold text-white mb-4">
            Jalur Belajar Komprehensif
          </h2>
          <p className="text-[18px] text-[var(--color-ink-muted)] font-medium">
            Intip materi yang akan Anda pelajari. Tersedia untuk tingkat dasar hingga lanjutan.
          </p>
        </div>

        {/* Tabs / Pills */}
        {programsToUse.length > 1 && (
          <div className="flex justify-center mb-16 relative">
            <div 
              ref={tablistRef}
              role="tablist" 
              aria-label="Pilih program belajar"
              className="inline-flex gap-2 max-w-full overflow-x-auto hide-scrollbar pb-2"
            >
              {programsToUse.map((program, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={program.id}
                    ref={(el) => { pillRefs.current[idx] = el; }}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${program.id}`}
                    id={`tab-${program.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`px-5 py-2.5 rounded-full text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-white whitespace-nowrap border ${
                      isActive
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-ink)] border-[var(--color-primary)] font-bold"
                        : "bg-transparent text-[var(--color-locked)] border-white/20 hover:text-white"
                    }`}
                  >
                    {program.shortName || program.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cards Carousel Area */}
        <div className="relative mx-auto max-w-[1200px]">
          {programsToUse.length > 1 ? (
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 24}px))` }}>
              {programsToUse.map((program, idx) => (
                <div 
                  key={program.id}
                  className="w-full shrink-0 pr-6 lg:pr-0 flex items-center"
                  style={{ marginRight: idx !== programsToUse.length - 1 ? '24px' : '0' }}
                >
                  <ProgramTrackCard 
                    program={program} 
                    isActive={activeIndex === idx}
                    isLeftCard={idx < activeIndex}
                    isRightCard={idx > activeIndex}
                    isLoggedIn={isLoggedIn}
                    onActivate={() => setActiveIndex(idx)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <ProgramTrackCard 
                program={programsToUse[0]} 
                isActive={true}
                isLoggedIn={isLoggedIn}
                onActivate={() => {}}
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

function ProgramTrackCard({ 
  program, 
  isActive,
  isLeftCard,
  isRightCard,
  isLoggedIn,
  onActivate
}: { 
  program: any, 
  isActive: boolean,
  isLeftCard?: boolean,
  isRightCard?: boolean,
  isLoggedIn?: boolean,
  onActivate: () => void
}) {
  const supabase = createClient();
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMobile, setShowAllMobile] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_program_materials", {
          p_program_slug: program.id
        });
        
        if (!error && data) {
          setMaterials(data);
          setActiveMaterial(data[0]);
        } else {
          const fallbackData = program.curriculum?.map((c: any) => ({
            ...c,
            content_url: null,
            preview_url: c.videoUrl || null, 
          })) || [];
          setMaterials(fallbackData);
          setActiveMaterial(fallbackData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [isActive, program.id, supabase, program.curriculum]);


  if (!isActive) {
    return (
      <button 
        aria-hidden="true"
        tabIndex={-1}
        onClick={onActivate}
        className={`w-full rounded-[16px] cursor-pointer transition-colors overflow-hidden border border-white/10 ${
          isLeftCard ? 'text-right' : 'text-left'
        }`}
        style={{ 
          background: 'color-mix(in srgb, var(--color-ink) 88%, white)', 
          height: '88%',
          minHeight: '400px'
        }}
      >
        <div className="p-8 lg:p-12">
          <h2 className={`text-[16px] lg:text-[18px] font-bold text-white mb-4 line-clamp-3 ${
            isLeftCard ? 'ml-auto' : 'mr-auto'
          }`}>
            {program.name}
          </h2>
        </div>
      </button>
    );
  }

  const isGuest = !isLoggedIn;
  const hasFullAccess = !!activeMaterial?.content_url;
  const hasPreview = !!activeMaterial?.preview_url;
  const videoUrlToPlay = hasFullAccess ? activeMaterial.content_url : (hasPreview ? activeMaterial.preview_url : null);

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

  const calculateTotalDuration = () => {
    let totalSeconds = 0;
    const source = materials.length > 0 ? materials : (program.curriculum || []);
    source.forEach((mat: any) => {
      if (mat.duration) {
        const parts = mat.duration.split(':');
        if (parts.length === 2) {
          totalSeconds += (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        } else if (parts.length === 3) {
          totalSeconds += (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
        }
      }
    });
    if (totalSeconds === 0) return "";
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;
  };

  const totalSessions = program.curriculum?.length || materials.length || 0;
  const totalDuration = calculateTotalDuration();
  
  // Custom pill component to ensure reuse
  const MetaPills = () => (
    <>
      <span className="bg-white/40 text-[var(--color-primary-ink)] px-3 py-1.5 rounded-full text-[14px] font-bold shadow-sm">
        {totalSessions} sesi
      </span>
      {totalDuration && (
        <span className="bg-white/40 text-[var(--color-primary-ink)] px-3 py-1.5 rounded-full text-[14px] font-bold shadow-sm">
          {totalDuration}
        </span>
      )}
    </>
  );



  return (
    <div
      role="tabpanel"
      id={`panel-${program.id}`}
      aria-labelledby={`tab-${program.id}`}
      className="w-full rounded-[16px] overflow-hidden p-6 lg:p-[48px] flex flex-col shadow-lg"
      style={{ background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, white))' }}
    >
      {/* 1. Header Row */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-4 lg:gap-8 lg:mb-[32px] items-start">
        <div className="w-full lg:max-w-[560px] col-start-1 row-start-1 row-span-2">
          <h2 className="text-[28px] lg:text-[36px] font-bold text-[var(--color-primary-ink)] mb-2 leading-tight">
            {program.name}
          </h2>
          <p className="text-[16px] lg:text-[18px] text-[var(--color-primary-ink)]/80 lg:line-clamp-2">
            {program.description}
          </p>
        </div>

        {/* Desktop Meta & Button (Hidden on Mobile) */}
        <div className="hidden lg:flex col-start-2 row-start-1 justify-end gap-2">
          <MetaPills />
        </div>
        <div className="hidden lg:flex col-start-2 row-start-2 justify-end mt-2">
          <Link 
            href={`/program/${program.id}`}
            className="bg-[var(--color-ink)] text-white px-8 py-3 rounded-[10px] font-bold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black min-h-[48px] inline-flex items-center justify-center"
          >
            Lihat Paket
          </Link>
        </div>

        {/* Mobile Meta (Hidden on Desktop) */}
        <div className="flex lg:hidden flex-wrap gap-2 mt-2">
          <MetaPills />
        </div>
      </div>

      {/* 2. Content Row */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-[32px] mt-6 lg:mt-0 items-stretch">
        
        {/* Video Panel (Col 6-12) */}
        <div className="w-full aspect-video bg-[var(--color-ink)] rounded-[12px] overflow-hidden relative flex flex-col items-center justify-center order-1 lg:order-2 lg:col-start-6 lg:col-span-7 flex-shrink-0 border border-white/5 shadow-md">
          {isLoading ? (
            <div className="w-full h-full bg-black/50 animate-pulse"></div>
          ) : materials.length === 0 ? (
            <div className="text-center text-white/50">
              <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            </div>
          ) : isGuest ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--color-ink)]">
              <PlayCircle className="w-16 h-16 text-white/10 mb-4" />
              <div className="flex items-center gap-2 mb-5 max-w-full">
                <Lock className="w-4 h-4 text-white shrink-0" aria-label="Konten terkunci" />
                <span className="text-white text-[14px] font-medium leading-snug text-left">
                  Masuk untuk melihat cuplikan {activeMaterial?.title}
                </span>
              </div>
              <Link href="/login" className="bg-[var(--color-primary)] text-[var(--color-primary-ink)] px-6 rounded-full text-[15px] font-bold hover:brightness-110 transition-all flex items-center justify-center min-h-[44px]">
                Masuk
              </Link>
            </div>
          ) : (
            <>
              {videoUrlToPlay ? (
                <div className="w-full h-full relative">
                  {hasPreview && !hasFullAccess && (
                    <div className="absolute top-3 left-3 z-30 bg-[var(--color-primary)] text-[var(--color-primary-ink)] px-3 py-1 rounded-full text-[12px] font-bold shadow-md">
                      Preview
                    </div>
                  )}
                  <iframe
                    src={getEmbedUrl(videoUrlToPlay)!}
                    className="absolute inset-0 w-full h-full object-cover"
                    allowFullScreen
                    title={activeMaterial?.title}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/40 text-[14px]">
                    Video belum tersedia.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Session List (Col 1-5) */}
        <div className="w-full bg-white rounded-[12px] flex flex-col overflow-hidden order-2 lg:order-1 lg:col-start-1 lg:col-span-5 lg:row-start-1 shadow-sm border border-black/5">
          <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col" style={{ scrollbarWidth: 'thin' }}>
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            ) : materials.length > 0 ? (
              <>
                {materials.map((mat, i) => {
                  const isSelected = activeMaterial?.id === mat.id;
                  const isHiddenMobile = !showAllMobile && i >= 5;
                  return (
                    <button
                      key={mat.id || i}
                      onClick={() => setActiveMaterial(mat)}
                      className={`w-full min-h-[56px] flex-col justify-center gap-1 p-3 px-4 text-left border-b border-black/5 transition-colors focus:outline-none focus:bg-gray-50 ${
                        isHiddenMobile ? 'hidden lg:flex' : 'flex'
                      } ${
                        isSelected ? "bg-[var(--color-bg-soft)] border-l-4 border-l-[var(--color-primary)]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className={`text-[14px] font-medium leading-snug line-clamp-2 ${isSelected ? "text-[var(--color-primary-ink)]" : "text-[var(--color-ink)]"}`}>
                          {mat.title}
                        </span>
                        {hasFullAccess && mat.is_completed && (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                      {mat.duration && (
                        <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)] text-[13px] font-medium mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{mat.duration}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
                {!showAllMobile && materials.length > 5 && (
                  <button 
                    onClick={() => setShowAllMobile(true)}
                    className="lg:hidden p-4 w-full text-center text-[14px] font-bold text-[var(--color-ink)] hover:bg-gray-50 flex items-center justify-center min-h-[56px]"
                  >
                    Lihat {materials.length - 5} sesi lainnya
                  </button>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-[var(--color-ink-muted)] text-[14px]">
                Materi sedang disiapkan.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Button (Hidden on Desktop) */}
      <div className="w-full mt-6 lg:hidden">
        <Link 
          href={`/program/${program.id}`}
          className="w-full bg-[var(--color-ink)] text-white px-8 py-3 rounded-[10px] font-bold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black min-h-[48px] inline-flex items-center justify-center"
        >
          Lihat Paket
        </Link>
      </div>
    </div>
  );
}
