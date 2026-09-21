"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import HeroSection from "./sections/HeroSection";
import VideoGallery from "./sections/VideoGallery";
import ValueProposition from "./sections/ValueProposition";
import PromoSection from "./sections/PromoSection";
import CurriculumSection from "./sections/CurriculumSection";
import PricingSection from "./sections/PricingSection";
import FAQSection from "./sections/FAQSection";
import FooterSection from "./sections/FooterSection";
import WhatsAppFAB from "./sections/WhatsAppFAB";
import ScrollProgressBar from "./sections/ScrollProgressBar";
import { User as UserIcon } from "lucide-react";

// Testimonials section disabled: all data is still dummy.
// Re-enable once real testimonials are collected.

function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Program", href: "#programs" },
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
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-400 flex items-center border-b border-white/5 ${
          scrolled
            ? "h-16 bg-[#0B1120]/90 backdrop-blur-lg shadow-lg"
            : "h-20 bg-[#0B1120]"
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
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/siswa"
                className="hidden sm:flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-slate-700/50"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Dashboard Saya
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Daftar Bootcamp
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MarketingView() {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FAFAF8] font-sans text-slate-900 selection:bg-orange-100 selection:text-slate-900">
      <ScrollProgressBar />
      {/* MOCKUP: Menandakan user sudah login. Jika ingin lihat versi logout, ubah isLoggedIn={false} */}
      <Navbar isLoggedIn={true} />
      <HeroSection />
      <VideoGallery />
      <ValueProposition />
      <PromoSection />
      <CurriculumSection />
      <PricingSection isLoggedIn={true} />
      <FAQSection />
      <FinalCTA />
      <FooterSection />
      <WhatsAppFAB />
    </div>
  );
}
