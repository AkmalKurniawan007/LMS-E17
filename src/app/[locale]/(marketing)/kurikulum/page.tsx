import React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import CurriculumTabsSection from "@/components/marketing/sections/CurriculumTabsSection";
import { getActiveMarketingPrograms } from "@/app/(lms)/(dashboard)/admin/marketing/program-actions";
import { Target, Lightbulb, TrendingUp, CheckCircle2 } from "lucide-react";
import { getMarketingSession } from "@/utils/marketing-auth";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Kurikulum" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default async function KurikulumPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Kurikulum" });
  const [dbPrograms, { isLoggedIn, purchasedProgramId, role, hasLmsAccess }] = await Promise.all([
    getActiveMarketingPrograms(),
    getMarketingSession()
  ]);

  // Transform DB programs to match the format expected by CurriculumTabsSection
  const programs = dbPrograms.map(p => ({
    id: p.slug,
    name: p.name,
    shortName: p.short_name,
    description: p.description ?? "",
    features: p.tiers?.find((t: any) => t.tier_type === "complete")?.features ?? [],
    curriculum: p.curriculum?.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      duration: c.duration ?? "",
    })) ?? [],
  }));

  const reasons = [
    {
      icon: <Target className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("r1_title"),
      desc: t("r1_desc")
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("r2_title"),
      desc: t("r2_desc")
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("r3_title"),
      desc: t("r3_desc")
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-sans">
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={role} hasLmsAccess={hasLmsAccess} />

      {/* Hero Section */}
      <section className="relative w-full bg-[var(--color-ink)] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div aria-hidden className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 85% 80%, var(--color-signal) 0%, transparent 45%)" }} />
        
        <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--color-bronze)] mb-6">{t("tag")}</p>
          
          <h1 className="font-display italic text-[44px] md:text-[64px] lg:text-[76px] font-black uppercase text-white tracking-tight leading-[1] mb-8 text-balance">
            {t("hero_title1")} <br />
            <span className="relative inline-block isolate text-[var(--color-signal)]">
              {t("hero_title2")}
            </span>
          </h1>
          
          <p className="text-[17px] lg:text-[20px] text-[var(--color-muted)] leading-relaxed font-medium max-w-3xl mx-auto mb-10 text-balance">
            {t("hero_desc")}
          </p>
        </div>
      </section>

      {/* Why Our Curriculum Section */}
      <section className="py-24 bg-[var(--color-paper)] border-b border-[var(--color-cream-line)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] lg:text-[56px] text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
              {t("why_title")}
            </h2>
            <p className="text-[17px] text-[var(--color-muted-light)] font-medium leading-relaxed">
              {t("why_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((item, idx) => (
              <div key={idx} className="bg-white p-8 lg:p-10 rounded-[24px] border border-[var(--color-cream-line)] shadow-sm hover:shadow-[0_8px_30px_rgba(28,26,20,0.04)] transition-all">
                <div className="w-16 h-16 bg-[var(--color-paper)] rounded-2xl flex items-center justify-center border border-[var(--color-cream-line)] mb-6 shadow-inner text-[var(--color-ink)]">
                  {item.icon}
                </div>
                <h3 className="text-[20px] lg:text-[22px] font-extrabold text-[var(--color-ink)] mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[var(--color-muted-light)] leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-[var(--color-ink)] rounded-[32px] p-8 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16 shadow-xl relative overflow-hidden">
            <div aria-hidden className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-signal)]/5 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="max-w-2xl relative z-10">
              <h3 className="font-display italic uppercase text-[32px] lg:text-[40px] font-black text-white mb-6 leading-tight">
                Validasi dari Praktisi Industri
              </h3>
              <p className="text-[var(--color-muted)] text-[16px] lg:text-[18px] leading-relaxed font-medium mb-8">
                Setiap batch, silabus kami direview oleh panel profesional dari perusahaan teknologi terkemuka untuk memastikan tidak ada materi yang kadaluarsa.
              </p>
              <ul className="space-y-4">
                {[
                  "Fokus pada best-practice penulisan kode",
                  "Mengajarkan kolaborasi tim (Git, Agile)",
                  "Persiapan teknikal interview yang mendalam"
                ].map((point, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[var(--color-signal)] shrink-0" strokeWidth={2.5} />
                    <span className="text-white/90 font-bold text-[15px] lg:text-[16px]">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="w-full md:w-[40%] relative z-10 shrink-0">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Validasi Industri"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Tabs Section */}
      <CurriculumTabsSection programs={programs} />

      <FooterSection />
    </div>
  );
}
