import React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import VerifikasiForm from "@/components/marketing/VerifikasiForm";
import { getMarketingSession } from "@/utils/marketing-auth";
import { ShieldCheck, Award, FileSearch } from "lucide-react";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Verifikasi" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default async function VerifikasiPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Verifikasi" });
  const { isLoggedIn, purchasedProgramId, role, hasLmsAccess } = await getMarketingSession();

  const benefits = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("b1_title"),
      desc: t("b1_desc")
    },
    {
      icon: <FileSearch className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("b2_title"),
      desc: t("b2_desc")
    },
    {
      icon: <Award className="w-8 h-8 text-[var(--color-signal)]" />,
      title: t("b3_title"),
      desc: t("b3_desc")
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-sans">
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={role} hasLmsAccess={hasLmsAccess} />

      {/* Hero Section */}
      <section className="relative w-full bg-[var(--color-ink)] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden min-h-[70vh] flex items-center">
        {/* Decorative elements */}
        <div aria-hidden className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 50% 100%, var(--color-signal) 0%, transparent 60%)" }} />
        
        <div className="max-w-[1000px] mx-auto px-6 relative z-10 w-full text-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--color-bronze)] mb-6">{t("tag")}</p>
          
          <h1 className="font-display italic text-[40px] md:text-[56px] lg:text-[72px] font-black uppercase text-white tracking-tight leading-[1] mb-8 text-balance">
            {t("hero_title1")} <br />
            <span className="relative inline-block isolate text-[var(--color-signal)] mt-2">
              {t("hero_title2")}
            </span>
          </h1>
          
          <p className="text-[17px] lg:text-[20px] text-[var(--color-muted)] leading-relaxed font-medium max-w-2xl mx-auto mb-12 text-balance">
            {t("hero_desc")}
          </p>

          <VerifikasiForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-[var(--color-paper)] border-t border-[var(--color-cream-line)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((item, idx) => (
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
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
