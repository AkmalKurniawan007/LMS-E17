"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

import HeroSection from "./sections/HeroSection";
import TrustBar from "./sections/TrustBar";
import StorySection from "./sections/StorySection";
import VideoGallery from "./sections/VideoGallery";
import PricingSection from "./sections/PricingSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FAQSection from "./sections/FAQSection";
import FinalCTA from "./sections/FinalCTA";
import FooterSection from "./sections/FooterSection";
import WhatsAppFAB from "./sections/WhatsAppFAB";
import ScrollProgressBar from "./sections/ScrollProgressBar";
import { User as UserIcon } from "lucide-react";

function Navbar({ isLoggedIn, purchasedProgramId }: { isLoggedIn?: boolean, purchasedProgramId?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      
      const sections = navLinks.map(link => link.href.substring(1));
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= (element.offsetTop - 100)) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Program", href: "/programs" },
    { label: "Kurikulum", href: "#curriculum" },
    { label: "Harga", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-400 flex items-center border-b ${
          scrolled
            ? "h-16 bg-white/90 backdrop-blur-lg border-[#EFE6CC] shadow-[0_4px_24px_rgba(28,26,20,0.08)]"
            : "h-20 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo-wide.png"
              alt="E17 Course"
              className="h-7 md:h-8 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-bold transition-all duration-200 py-2 border-b-[3px] ${
                    isActive 
                      ? "text-[var(--color-ink)] border-[var(--color-primary)]" 
                      : "text-[#6B6355] border-transparent hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {purchasedProgramId && (
                  <Link
                    href={`/kelas/${purchasedProgramId}`}
                    className="hidden lg:flex items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-bold px-4 py-2 rounded-lg transition-colors border border-orange-200"
                  >
                    Materi Kelas
                  </Link>
                )}
                <Link
                  href="/siswa"
                  className="hidden sm:flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-slate-700/50"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-bold text-[#6B6355] hover:text-[#1C1A14] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center justify-center bg-gradient-to-r from-[#FF7A1A] to-[#FF3D68] hover:scale-105 shadow-md text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-transform focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]"
                >
                  Daftar Bootcamp
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#1C1A14] hover:bg-[#EFE6CC] rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-1 mt-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 text-lg font-medium text-slate-800 hover:text-slate-900 border-b border-slate-100 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              {isLoggedIn ? (
                <Link
                  href="/siswa"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-lg text-center bg-slate-900 text-white font-semibold"
                >
                  Ke Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 rounded-lg text-center text-slate-700 border border-slate-200 font-medium"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 rounded-lg text-center bg-slate-900 text-white font-semibold"
                  >
                    Daftar Bootcamp
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MarketingView({ dbContent = {}, dbPrograms }: { dbContent?: Record<string, any>, dbPrograms?: any[] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [purchasedProgramId, setPurchasedProgramId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);

      // Cek apakah user punya enrollment aktif untuk tampilkan tombol "Materi Kelas"
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("batches(program_id, programs(id))")
        .eq("user_id", user.id)
        .eq("status", "aktif")
        .limit(1)
        .single();

      if (enrollment) {
        const batch = (enrollment as any).batches;
        const program = batch?.programs;
        if (program?.id) {
          const { data: programData } = await supabase
            .from("programs")
            .select("name")
            .eq("id", program.id)
            .single();
          if (programData) {
            setPurchasedProgramId(program.id);
          }
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (!session?.user) setPurchasedProgramId(undefined);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FAFAF8] font-sans text-slate-900 selection:bg-orange-100 selection:text-slate-900">
      <ScrollProgressBar />
      <Navbar isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} />
      <HeroSection dbContent={dbContent.hero} dbPrograms={dbPrograms?.length ? dbPrograms : dbContent.programs?.items} />
      {/* <TrustBar dbContent={dbContent.trust_bar} /> */}
      <StorySection />
      <VideoGallery 
        dynamicPrograms={dbPrograms?.length ? dbPrograms : dbContent.programs?.items}
        isLoggedIn={isLoggedIn}
        purchasedProgramId={purchasedProgramId}
      />
      <PricingSection isLoggedIn={isLoggedIn} dynamicPrograms={dbPrograms?.length ? dbPrograms : dbContent.programs?.items} />
      {/* <TestimonialsSection dbContent={dbContent.testimonials} /> */}
      <FAQSection dbContent={dbContent.faq} />
      <FinalCTA dbContent={dbContent.final_cta} whatsappDb={dbContent.whatsapp} />
      <FooterSection dbContent={dbContent.footer} />
      <WhatsAppFAB dbContent={dbContent.whatsapp} />
    </div>
  );
}
