"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getWhatsAppUrl } from "../data/marketing-data";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function MobileFooterAccordion({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left font-bold text-white focus:outline-none"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-[var(--color-signal)]" : "text-[var(--color-muted)]"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FooterSection({ dbPrograms = [] }: { dbPrograms?: any[] }) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("Footer");

  const tagline = t("tagline");
  const email = "hello@e17course.com";
  const copyrightText = t("copyright");
  
  const displayPrograms = dbPrograms?.length ? dbPrograms : [];

  return (
    <footer className="bg-[var(--color-ink)] border-t border-white/5 pt-16 pb-24 md:pb-12 lg:pt-24 lg:pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 md:pr-12">
            <div className="mb-6 flex items-center">
              <img src="/assets/logo-wide.png" alt="E17 Course" className="h-8 md:h-10 object-contain" />
            </div>
            <p className="text-[var(--color-muted)] text-[15px] leading-relaxed max-w-sm mb-6 md:mb-0">
              {tagline}
            </p>
          </div>

          {/* Col 2 & 3 Mobile Accordions */}
          <MobileFooterAccordion title={t("program_title")}>
            <ul className="space-y-3">
              {displayPrograms.map((p: any) => (
                <li key={p.id}>
                  <Link href={`/program/${p.id}`} className="text-[var(--color-muted)] hover:text-white text-[15px] transition-colors inline-block">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileFooterAccordion>

          <MobileFooterAccordion title={t("contact_title")}>
            <ul className="space-y-3">
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)] hover:text-white text-[15px] transition-colors inline-block">
                  WhatsApp Admin
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-[var(--color-muted)] hover:text-white text-[15px] transition-colors inline-block">
                  {email}
                </a>
              </li>
            </ul>
          </MobileFooterAccordion>

          {/* Col 2: Program (Desktop) */}
          <div className="hidden md:block">
            <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-[var(--color-bronze)] mb-6">
              {t("program_title")}
            </h4>
            <ul className="space-y-4">
              {displayPrograms.map((p: any) => (
                <li key={p.id}>
                  <Link href={`/program/${p.id}`} className="text-white/60 hover:text-white text-[15px] transition-colors">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact (Desktop) */}
          <div className="hidden md:block">
            <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-[var(--color-bronze)] mb-6">
              {t("contact_title")}
            </h4>
            <ul className="space-y-4">
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-[15px] transition-colors">
                  WhatsApp Admin
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-white/60 hover:text-white text-[15px] transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 md:mt-20 pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <p className="text-[var(--color-muted-light)] text-[13px] font-medium">
            &copy; {currentYear} {copyrightText}
          </p>
          <div className="flex items-center gap-6 text-[13px] font-medium">
            <a href="#" className="text-[var(--color-muted-light)] hover:text-white transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-[var(--color-muted-light)] hover:text-white transition-colors">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
