"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function VideoGallery({ 
  dynamicPrograms, 
  isLoggedIn, 
  purchasedProgramId,
  purchasedTier
}: { 
  dynamicPrograms?: any[], 
  isLoggedIn?: boolean, 
  purchasedProgramId?: string,
  purchasedTier?: string
}) {
  const shouldReduceMotion = useReducedMotion();
  const programsToUse = dynamicPrograms || [];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tablistRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Curriculum");

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
    <section id="curriculum" className="w-full relative py-24 lg:py-32 overflow-hidden bg-[var(--color-paper)]">
      {/* Diagonal stripe accent */}
      <div aria-hidden className="absolute top-0 right-0 w-[320px] h-[180px] opacity-[0.10] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, var(--color-bronze), var(--color-bronze) 6px, transparent 6px, transparent 18px)' }} />
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] leading-[1] tracking-tight text-[var(--color-ink)] mb-5">
              {t("title1")} <span className="relative inline-block isolate">{t("title2")}<span aria-hidden className="absolute left-0 -bottom-1 h-[6px] w-full bg-[var(--color-signal)] -skew-x-12 -z-10" /></span>
            </h2>
            <p className="text-[17px] text-[var(--color-muted-light)] font-medium leading-relaxed">
              {t("subtitle")}
            </p>
          </motion.div>
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
                    className={`px-6 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] whitespace-nowrap border ${
                      isActive
                        ? "bg-[var(--color-ink)] text-[var(--color-signal)] border-[var(--color-ink)] shadow-[0_6px_20px_rgba(14,13,10,0.25)]"
                        : "bg-[var(--color-bg)] text-[var(--color-muted-light)] border-[var(--color-cream-line)] hover:text-[var(--color-ink)] hover:border-[var(--color-bronze)]"
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
                    purchasedProgramId={purchasedProgramId}
                    purchasedTier={purchasedTier}
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
                purchasedProgramId={purchasedProgramId}
                purchasedTier={purchasedTier}
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
  purchasedProgramId,
  purchasedTier,
  onActivate
}: { 
  program: any, 
  isActive: boolean,
  isLeftCard?: boolean,
  isRightCard?: boolean,
  isLoggedIn?: boolean,
  purchasedProgramId?: string,
  purchasedTier?: string,
  onActivate: () => void
}) {
  const supabase = createClient();
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMobile, setShowAllMobile] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Use the marketing curriculum data provided by the page
    const curriculumData = program.curriculum?.map((c: any) => ({
      ...c,
      content_url: null, // Full video access is determined by purchasedTier below
      preview_url: c.preview_video_url || null,
    })) || [];
    
    setMaterials(curriculumData);
    setActiveMaterial(curriculumData[0] || null);
    setIsLoading(false);
  }, [isActive, program.curriculum]);


  if (!isActive) {
    return (
      <button 
        aria-hidden="true"
        tabIndex={-1}
        onClick={onActivate}
        className={`w-full rounded-[24px] cursor-pointer transition-all duration-500 overflow-hidden border border-[var(--color-cream-line)] hover:border-[var(--color-bronze)] bg-[var(--color-bg)] group relative ${
          isLeftCard ? 'text-right' : 'text-left'
        }`}
        style={{ 
          height: '88%',
          minHeight: '400px'
        }}
      >
        <div className="p-8 lg:p-12 h-full flex flex-col justify-center relative z-10">
          <h2 className={`text-[16px] lg:text-[20px] font-bold text-[var(--color-muted)] group-hover:text-[var(--color-ink)] transition-colors duration-300 mb-4 line-clamp-3 ${
            isLeftCard ? 'ml-auto' : 'mr-auto'
          }`}>
            {program.name}
          </h2>
          <span className={`text-[14px] font-bold text-[var(--color-bronze)] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ${isLeftCard ? 'ml-auto' : 'mr-auto'}`}>
            Lihat Kurikulum &rarr;
          </span>
        </div>
      </button>
    );
  }

  const isGuest = !isLoggedIn;
  const isPurchased = purchasedProgramId === program.id;
  const isTierAllowed = purchasedTier ? (activeMaterial?.access_tiers || ["junior", "expert", "bootcamp"]).includes(purchasedTier) : false;
  const hasFullAccess = !!activeMaterial?.content_url || (isPurchased && isTierAllowed);
  const hasPreview = !!activeMaterial?.preview_url;
  const videoUrlToPlay = hasFullAccess ? (activeMaterial?.content_url || activeMaterial?.video_url || activeMaterial?.preview_url) : (hasPreview ? activeMaterial?.preview_url : null);

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

  const getAccessBadge = (accessTiers: string[]) => {
    if (!accessTiers || accessTiers.length === 0) return null;
    const hasJunior = accessTiers.includes("junior");
    const hasExpert = accessTiers.includes("expert");
    const hasBootcamp = accessTiers.includes("bootcamp");
  
    if (!hasJunior && hasExpert && hasBootcamp) {
      return <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--color-bg-soft)] text-[var(--color-bronze)] shrink-0 whitespace-nowrap border border-[var(--color-cream-line)]">Mulai dari Expert</span>;
    }
    if (!hasJunior && !hasExpert && hasBootcamp) {
      return <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--color-ink)] text-[var(--color-signal)] shrink-0 whitespace-nowrap">Khusus Bootcamp</span>;
    }
    return null; 
  };

  const totalSessions = program.curriculum?.length || materials.length || 0;
  const totalDuration = calculateTotalDuration();
  
  // Custom pill component to ensure reuse
  const MetaPills = () => (
    <>
      <span className="bg-white/5 border border-white/15 text-white px-3 py-1.5 rounded-full font-mono text-[13px] font-bold">
        {totalSessions} sesi
      </span>
      {totalDuration && (
        <span className="bg-white/5 border border-white/15 text-white px-3 py-1.5 rounded-full font-mono text-[13px] font-bold">
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
      className="w-full rounded-[24px] overflow-hidden p-6 lg:p-[48px] flex flex-col shadow-[0_30px_60px_-20px_rgba(14,13,10,0.45)] relative bg-[var(--color-ink)]"
    >
      {/* Yellow top bar + stripes + crest watermark */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--color-signal)]" />
      <div aria-hidden className="absolute -top-6 -right-6 w-[260px] h-[140px] opacity-[0.12] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, var(--color-signal), var(--color-signal) 8px, transparent 8px, transparent 20px)' }} />
      <svg aria-hidden className="absolute -left-10 -bottom-10 w-64 h-64 text-[var(--color-bronze)]/10 pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
      {/* 1. Header Row */}
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-4 lg:gap-8 lg:mb-[32px] items-start">
        <div className="w-full lg:max-w-[560px] col-start-1 row-start-1 row-span-2">
          <h2 className="font-display italic uppercase text-[28px] lg:text-[40px] font-extrabold tracking-tight text-white mb-3 leading-[1.05]">
            {program.name}
          </h2>
          <p className="text-[16px] lg:text-[17px] text-[var(--color-muted)] lg:line-clamp-2">
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
            className="group bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] px-7 py-3 rounded-full font-bold transition-all hover:-translate-y-0.5 shadow-[var(--shadow-btn)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ink)] min-h-[48px] inline-flex items-center justify-center gap-2"
          >
            Lihat Paket
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Mobile Meta (Hidden on Desktop) */}
        <div className="flex lg:hidden flex-wrap gap-2 mt-2">
          <MetaPills />
        </div>
      </div>

      {/* 2. Content Row */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-[32px] mt-6 lg:mt-0 items-stretch relative z-10">
        
        {/* Video Panel (Col 6-12) */}
        <div className="w-full aspect-video bg-[var(--color-ink-2)] rounded-[16px] overflow-hidden relative flex flex-col items-center justify-center order-1 lg:order-2 lg:col-start-6 lg:col-span-7 flex-shrink-0 border border-white/10">
          {isLoading ? (
            <div className="w-full h-full bg-[var(--color-ink-2)] animate-pulse"></div>
          ) : materials.length === 0 ? (
            <div className="text-center text-white/50">
              <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            </div>
          ) : (isGuest && !hasPreview) ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--color-ink-2)]">
              <PlayCircle className="w-16 h-16 text-white/10 mb-4" />
              <div className="flex items-center gap-2 mb-5 max-w-full">
                <Lock className="w-4 h-4 text-white shrink-0" aria-label="Konten terkunci" />
                <span className="text-white text-[14px] font-medium leading-snug text-left">
                  Materi {activeMaterial?.title} terkunci.
                </span>
              </div>
              <Link href="/pembeli/login" className="bg-[var(--color-signal)] text-[var(--color-ink)] px-6 rounded-full text-[15px] font-bold hover:brightness-110 transition-all flex items-center justify-center min-h-[44px]">
                Masuk untuk Akses
              </Link>
            </div>
          ) : (
            <>
              {videoUrlToPlay ? (
                <div className="w-full h-full relative">
                  {hasPreview && !hasFullAccess && (
                    <div className="absolute top-3 left-3 z-30 bg-[var(--color-signal)] text-[var(--color-ink)] px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-bold shadow-md">
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
                    {!isTierAllowed && purchasedTier 
                      ? "Video ini tidak tersedia untuk paket Anda." 
                      : "Video belum tersedia."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Session List (Col 1-5) */}
        <div className="w-full bg-[var(--color-paper)] rounded-[16px] flex flex-col overflow-hidden order-2 lg:order-1 lg:col-start-1 lg:col-span-5 lg:row-start-1 max-h-[420px]">
          <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col" style={{ scrollbarWidth: 'thin' }}>
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-4 bg-[var(--color-cream-line)] rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-[var(--color-cream-line)] rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-[var(--color-cream-line)] rounded animate-pulse w-5/6"></div>
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
                      className={`w-full min-h-[56px] flex-col justify-center gap-1 p-3 px-4 text-left border-b border-[var(--color-cream-line)] transition-colors focus:outline-none focus-visible:bg-[var(--color-bg)] ${
                        isHiddenMobile ? 'hidden lg:flex' : 'flex'
                      } ${
                        isSelected ? "bg-[var(--color-bg)] border-l-4 border-l-[var(--color-signal)]" : "hover:bg-[var(--color-bg)]/70 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-[14px] leading-snug line-clamp-2 text-[var(--color-ink)] ${isSelected ? "font-bold" : "font-medium"}`}>
                            {mat.title}
                          </span>
                          {getAccessBadge(mat.access_tiers)}
                        </div>
                        {hasFullAccess && mat.is_completed && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-mint)] shrink-0 mt-0.5" />
                        )}
                      </div>
                      {mat.duration && (
                        <div className="flex items-center gap-1.5 text-[var(--color-muted)] font-mono text-[12px] font-medium mt-0.5">
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
                    className="lg:hidden p-4 w-full text-center text-[14px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-bg)] flex items-center justify-center min-h-[56px]"
                  >
                    Lihat {materials.length - 5} sesi lainnya
                  </button>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-[var(--color-muted)] text-[14px]">
                Materi sedang disiapkan.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Button (Hidden on Desktop) */}
      <div className="relative z-10 w-full mt-6 lg:hidden">
        <Link 
          href={`/program/${program.id}`}
          className="w-full bg-[var(--color-signal)] text-[var(--color-ink)] px-8 py-3 rounded-full font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] min-h-[48px] inline-flex items-center justify-center"
        >
          Lihat Paket
        </Link>
      </div>
    </div>
  );
}
