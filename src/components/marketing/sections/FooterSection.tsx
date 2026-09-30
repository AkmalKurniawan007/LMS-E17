"use client";

import React from "react";
import { programs, getWhatsAppUrl } from "../data/marketing-data";

export default function FooterSection({ dbContent = {} }: { dbContent?: any }) {
  const currentYear = new Date().getFullYear();

  const tagline = dbContent.tagline || "Platform pembelajaran interaktif dengan video materi lengkap, live class, dan instruktur profesional di berbagai bidang.";
  const email = dbContent.email || "hello@e17course.com";
  const copyrightText = dbContent.copyright || "E17 Course. Hak cipta dilindungi.";

  return (
    <footer className="bg-white border-t border-[#EFE6CC]">
      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img
                src="/assets/logo-wide.png"
                alt="E17 Course Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
            <p className="text-[#6B6355] text-[15px] leading-relaxed max-w-sm">
              {tagline}
            </p>
          </div>

          {/* Col 2: Program */}
          <div>
            <h4 className="text-[#1C1A14] font-bold mb-6 tracking-wide">
              Program
            </h4>
            <ul className="space-y-4">
              {programs.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/?program=${p.id}#pricing`}
                    className="text-[#6B6355] hover:text-[#1C1A14] text-[15px] transition-colors focus:outline-none focus:underline"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-[#1C1A14] font-bold mb-6 tracking-wide">
              Kontak
            </h4>
            <ul className="space-y-4 text-[15px]">
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B6355] hover:text-[#1C1A14] transition-colors focus:outline-none focus:underline flex items-center gap-2"
                >
                  WhatsApp Admin
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="text-[#6B6355] hover:text-[#1C1A14] transition-colors focus:outline-none focus:underline flex items-center gap-2"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#EFE6CC] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#B8AF9C] text-[14px]">
            &copy; {currentYear} {copyrightText}
          </p>
          <div className="flex items-center gap-6 text-[14px]">
            <a href="#" className="text-[#B8AF9C] hover:text-[#6B6355] transition-colors focus:outline-none focus:underline">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-[#B8AF9C] hover:text-[#6B6355] transition-colors focus:outline-none focus:underline">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
