import { getActiveMarketingPrograms, type MarketingCurriculumItem } from "@/app/(lms)/(dashboard)/admin/marketing/program-actions";
import { getWhatsAppUrl } from "@/components/marketing/data/marketing-data";
import Link from "next/link";
import { BookOpen, Clock, Check, ArrowRight } from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { getMarketingSession } from "@/utils/marketing-auth";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Programs" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Programs" });
  const [programs, { isLoggedIn, purchasedProgramId, role, hasLmsAccess }] = await Promise.all([
    getActiveMarketingPrograms(),
    getMarketingSession()
  ]);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-sans relative overflow-hidden">
      {/* Motif Backgrounds */}
      <div aria-hidden className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-signal)]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div aria-hidden className="absolute top-40 left-10 w-[300px] h-[200px] opacity-[0.03] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, var(--color-ink), var(--color-ink) 2px, transparent 2px, transparent 12px)' }} />

      {/* Header */}
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={role} hasLmsAccess={hasLmsAccess} />

      {/* Hero / Pembuka */}
      <section className="max-w-[1000px] mx-auto px-6 pt-32 lg:pt-40 pb-20 text-center flex flex-col items-center relative z-10">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--color-bronze)] mb-6">{t("tag")}</p>
        <h1 className="font-display italic uppercase text-[44px] md:text-[64px] lg:text-[76px] font-black text-[var(--color-ink)] tracking-tight leading-[1] mb-6 max-w-4xl text-balance">
          {t("hero_title1")} <span className="relative inline-block isolate">{t("hero_title2")}<span aria-hidden className="absolute left-0 -bottom-2 h-[8px] w-full bg-[var(--color-signal)] -skew-x-12 -z-10" /></span>
        </h1>
        <p className="text-[17px] lg:text-[20px] text-[var(--color-muted-light)] font-medium leading-relaxed max-w-2xl text-balance">
          {t("hero_desc")}
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 pb-32 relative z-10">
        {programs.length === 0 ? (
          <div className="bg-white border border-[var(--color-cream-line)] rounded-2xl p-16 text-center shadow-sm">
            <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-3 font-display italic uppercase">{t("empty_title")}</h2>
            <p className="text-[var(--color-muted-light)]">{t("empty_desc")}</p>
          </div>
        ) : (
          <div className="space-y-12 lg:space-y-16">
            {programs.map((program, index) => {
              // Kalkulasi Sesi dan Durasi
              const outline = Array.isArray(program.curriculum) ? program.curriculum : [];
              const sessionsCount = outline.length;
              
              let totalSeconds = 0;
              outline.forEach((mat: MarketingCurriculumItem) => {
                if (mat.duration) {
                  const parts = mat.duration.split(":");
                  if (parts.length === 2) {
                    totalSeconds += (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                  } else if (parts.length === 3) {
                    totalSeconds += (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
                  }
                }
              });

              let durationText = "";
              if (totalSeconds > 0) {
                const mins = Math.round(totalSeconds / 60);
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                durationText = h > 0 ? `${h} jam ${m} mnt` : `${m} mnt`;
              }

              // Kalkulasi Harga Termurah (Mulai Dari)
              const activeTiers = (program.tiers || []).filter(t => t.is_active && t.price > 0);
              const displayPrice = activeTiers.length > 0 ? Math.min(...activeTiers.map(t => t.price)) : null;

              // Ambil fitur dari tier tertinggi untuk highlight
              const featuresTier = activeTiers.length > 0 
                ? [...activeTiers].sort((a, b) => b.price - a.price)[0] 
                : null;
              const featuresList = featuresTier?.features?.slice(0, 4) || [];

              return (
                <div 
                  key={program.id} 
                  className={`flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden border border-[var(--color-cream-line)] bg-white shadow-xl shadow-[var(--color-ink)]/5 group ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* VISUAL BLOCK */}
                  <div className="w-full lg:w-5/12 aspect-[4/3] lg:aspect-auto bg-[var(--color-ink)] relative overflow-hidden flex flex-col justify-end p-8 lg:p-12">
                    {/* Image Placeholder */}
                    <img 
                      src={`https://picsum.photos/seed/${program.id}/800/1000`} 
                      alt={program.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 mix-blend-overlay"
                    />
                    
                    <div className="relative z-10">
                      <div className="inline-block mb-4">
                        <span className="bg-[var(--color-signal)] text-[var(--color-ink)] text-[12px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                          Bootcamp
                        </span>
                      </div>
                      <h3 className="font-display italic text-[36px] lg:text-[44px] tracking-tight leading-[1] text-white uppercase drop-shadow-md">
                        {program.short_name || program.name}
                      </h3>
                    </div>
                  </div>

                  {/* TEXT BLOCK */}
                  <div className="w-full lg:w-7/12 flex flex-col p-8 lg:p-12">
                    <h2 className="text-[28px] lg:text-[36px] font-bold text-[var(--color-ink)] leading-tight mb-4 tracking-tight">
                      {program.name}
                    </h2>
                    
                    {program.description && (
                      <p className="text-[16px] text-[var(--color-muted-light)] leading-relaxed mb-8 border-l-[3px] border-[var(--color-signal)] pl-5 font-medium">
                        {program.description}
                      </p>
                    )}

                    {/* Meta info */}
                    {(sessionsCount > 0 || durationText) && (
                      <div className="flex flex-wrap items-center gap-6 mb-8 text-[14px] font-bold text-[var(--color-ink)]">
                        {sessionsCount > 0 && (
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[var(--color-bronze)]" strokeWidth={2.5} /> {sessionsCount} {t("sessions")}
                          </span>
                        )}
                        {durationText && (
                          <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[var(--color-bronze)]" strokeWidth={2.5} /> {durationText}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Features List */}
                    {featuresList.length > 0 && (
                      <div className="mb-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                          {featuresList.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-[14px] text-[var(--color-muted-light)] font-medium">
                              <div className="bg-[var(--color-signal)] p-1 rounded-full shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5 text-[var(--color-ink)]" strokeWidth={3} />
                              </div>
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="h-[1px] w-full bg-[var(--color-cream-line)] mb-8 mt-auto"></div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      {/* Price */}
                      <div className="flex flex-col">
                        {displayPrice !== null ? (
                          <>
                            <span className="font-mono text-[10px] text-[var(--color-bronze)] font-bold uppercase tracking-widest mb-1">{t("price_from")}</span>
                            <span className="text-[28px] font-black text-[var(--color-ink)] leading-none">
                              {formatRupiah(displayPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[14px] font-bold text-[var(--color-muted)] py-2">{t("price_not_available")}</span>
                        )}
                      </div>

                      {/* CTA Actions */}
                      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                        <a
                          href={getWhatsAppUrl(program.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border-2 border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] text-[var(--color-ink)] font-bold text-[14px] rounded-full hover:bg-[var(--color-paper)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]"
                        >
                          {t("consult")}
                        </a>
                        <Link
                          href={`/program/${program.slug}`}
                          className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-ink)] text-white font-bold text-[14px] rounded-full hover:bg-[var(--color-ink-2)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-2"
                        >
                          {t("view_detail")}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
