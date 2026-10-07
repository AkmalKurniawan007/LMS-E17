import React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { getMarketingSession } from "@/utils/marketing-auth";
import { Users, Target, Zap, Rocket } from "lucide-react";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "TentangKami" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default async function TentangKamiPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "TentangKami" });
  const { isLoggedIn, purchasedProgramId, role, hasLmsAccess } = await getMarketingSession();

  const values = [
    {
      icon: <Target className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("v1_title"),
      desc: t("v1_desc")
    },
    {
      icon: <Zap className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("v2_title"),
      desc: t("v2_desc")
    },
    {
      icon: <Users className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("v3_title"),
      desc: t("v3_desc")
    },
    {
      icon: <Rocket className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("v4_title"),
      desc: t("v4_desc")
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-sans">
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={role} hasLmsAccess={hasLmsAccess} />

      {/* Hero Section */}
      <section className="relative w-full bg-[var(--color-ink)] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div aria-hidden className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, var(--color-signal) 0%, transparent 50%)" }} />
        
        <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--color-bronze)] mb-6">{t("tag")}</p>
          
          <h1 className="font-display italic text-[44px] md:text-[64px] lg:text-[76px] font-black uppercase text-white tracking-tight leading-[1] mb-8 text-balance">
            {t("hero_title1")} <br />
            <span className="relative inline-block isolate text-[var(--color-signal)] mt-2">
              {t("hero_title2")}
            </span>
          </h1>
          
          <p className="text-[17px] lg:text-[20px] text-[var(--color-muted)] leading-relaxed font-medium max-w-3xl mx-auto mb-10 text-balance">
            {t("hero_desc")}
          </p>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-24 bg-[var(--color-paper)] border-b border-[var(--color-cream-line)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-[var(--color-signal)]/10 rounded-[32px] blur-3xl -z-10 translate-x-4 translate-y-4"></div>
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden border border-[var(--color-cream-line)] shadow-xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
                  alt="Tim E17 Course"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-display italic uppercase font-extrabold text-[36px] md:text-[48px] text-[var(--color-ink)] tracking-tight leading-[1] mb-8">
                {t("why_title")}
              </h2>
              <div className="space-y-6 text-[17px] text-[var(--color-muted-light)] leading-relaxed font-medium">
                <p>
                  {t("why_p1")}
                </p>
                <p>
                  {t("why_p2")}
                </p>
                <p>
                  {t("why_p3")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai-nilai Section */}
      <section className="py-24 bg-white border-b border-[var(--color-cream-line)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display italic uppercase font-extrabold text-[32px] md:text-[40px] text-[var(--color-ink)] tracking-tight leading-[1] mb-6">
              {t("val_title")}
            </h2>
            <p className="text-[17px] text-[var(--color-muted-light)] font-medium leading-relaxed">
              {t("val_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, idx) => (
              <div key={idx} className="bg-[var(--color-paper)] p-8 rounded-[24px] border border-[var(--color-cream-line)] shadow-sm hover:shadow-[0_8px_30px_rgba(28,26,20,0.04)] transition-all">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-[var(--color-cream-line)] mb-6 shadow-sm text-[var(--color-ink)]">
                  {item.icon}
                </div>
                <h3 className="text-[18px] font-extrabold text-[var(--color-ink)] mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[var(--color-muted-light)] leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
