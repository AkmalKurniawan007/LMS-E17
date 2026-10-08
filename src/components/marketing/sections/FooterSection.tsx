"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Phone, Clock, Mail } from "lucide-react";
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

  const email = "hello@e17course.com";
  const copyrightText = "PT Edukasi Tujuh Belas. All rights reserved.";
  
  const displayPrograms = dbPrograms?.length ? dbPrograms : [];

  return (
    <footer className="bg-[var(--color-ink)] pt-16 pb-12 lg:pt-24 lg:pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        
        {/* Main Footer Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 lg:p-12 mb-8">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Col 1: Brand & Socials (3 cols) */}
            <div className="md:col-span-12 lg:col-span-3">
              <div className="mb-8 flex items-center">
                <img src="/assets/logo-wide.png" alt="E17 Course" className="h-9 md:h-10 object-contain" />
              </div>
              <h4 className="font-mono text-[11px] tracking-widest uppercase font-bold text-white mb-4">
                SOSIAL MEDIA KAMI
              </h4>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-signal)] text-white hover:text-[var(--color-ink)] flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-signal)] text-white hover:text-[var(--color-ink)] flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-signal)] text-white hover:text-[var(--color-ink)] flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-signal)] text-white hover:text-[var(--color-ink)] flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              </div>
            </div>

            {/* Col 2: PT Details (4 cols) */}
            <div className="md:col-span-6 lg:col-span-4 lg:pl-8">
              <h4 className="font-bold text-white mb-6 text-lg">
                PT Edukasi Tujuh Belas
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--color-signal)] shrink-0 mt-0.5" />
                  <span className="text-[var(--color-muted)] text-[14px] leading-relaxed">
                    Jl. Basoka Raya No.8, Joglo, Kembangan, Kota Jakarta Barat, DKI Jakarta 11640
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[var(--color-signal)] shrink-0" />
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">
                    0813-9927-1717
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--color-signal)] shrink-0" />
                  <span className="text-[var(--color-muted)] text-[14px] bg-white/5 px-3 py-1 rounded-full">
                    Buka · Tutup Jam 18:00 WIB
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-signal)] shrink-0" />
                  <a href={`mailto:${email}`} className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">
                    {email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Navigation (2 cols) */}
            <div className="md:col-span-3 lg:col-span-2">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">
                E17 COURSE
              </h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Beranda</Link></li>
                <li><Link href="/" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Program</Link></li>
                <li><a href="#" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Publikasi</a></li>
                <li><a href="#" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Artikel</a></li>
                <li><a href="#" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Tentang Kami</a></li>
              </ul>
            </div>

            {/* Col 4: Programs (3 cols) */}
            <div className="md:col-span-3 lg:col-span-3">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">
                PROGRAM UNGGULAN
              </h4>
              <ul className="space-y-4">
                {displayPrograms.length > 0 ? (
                  displayPrograms.map((p: any) => (
                    <li key={p.id}>
                      <Link href={`/program/${p.id}`} className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors block truncate pr-4">
                        {p.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link href="/" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Bootcamp</Link></li>
                    <li><a href="#" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Sertifikasi</a></li>
                    <li><a href="#" className="text-[var(--color-muted)] hover:text-white text-[14px] transition-colors">Corporate Training</a></li>
                  </>
                )}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="px-2 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <p className="text-[var(--color-muted-light)] text-[13px] font-medium">
            &copy; {currentYear} {copyrightText}
          </p>
          <div className="flex items-center gap-6 text-[13px] font-medium">
            <a href="#" className="text-[var(--color-muted-light)] hover:text-white transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-[var(--color-muted-light)] hover:text-white transition-colors">
              Syarat & Ketentuan
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
