"use client";

import React from "react";
import { programs, getWhatsAppUrl } from "../data/marketing-data";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1120] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {/* Col 1: Brand */}
          <div>
            <div className="mb-5">
              <img
                src="/assets/logo-wide.png"
                alt="E17 Course"
                className="h-8 md:h-9 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bootcamp intensif untuk pelatihan profesional teknologi.
              Live mentoring, project nyata, career support.
            </p>
          </div>

          {/* Col 2: Program */}
          <div>
            <p className="text-white text-sm font-semibold mb-5">
              Program
            </p>
            <ul className="space-y-3">
              {programs.map((p) => (
                <li key={p.id}>
                  <a
                    href="#programs"
                    className="text-slate-400 text-sm hover:text-white transition-colors duration-200"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <p className="text-white text-sm font-semibold mb-5">
              Kontak
            </p>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  WhatsApp: +62 812-3456-7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@e17course.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  info@e17course.com
                </a>
              </li>
              <li>
                <a
                  href="/verify"
                  className="hover:text-white transition-colors duration-200"
                >
                  Verifikasi Sertifikat
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} E17 Course
          </p>
          <p className="text-slate-600 text-xs">
            Jakarta, Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
