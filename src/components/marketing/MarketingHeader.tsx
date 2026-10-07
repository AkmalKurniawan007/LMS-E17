"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, User as UserIcon, PlayCircle, LogOut, Globe } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import NativeLink from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketingHeader({
  isLoggedIn,
  purchasedProgramId,
  userRole,
  hasLmsAccess,
}: {
  isLoggedIn?: boolean;
  purchasedProgramId?: string;
  userRole?: string | null;
  hasLmsAccess?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProgramsPage = pathname.startsWith("/programs");
  const [userRoleState, setUserRoleState] = useState<string | null>(userRole || null);
  const [internalIsLoggedIn, setInternalIsLoggedIn] = useState(isLoggedIn || false);
  const [internalPurchasedProgramId, setInternalPurchasedProgramId] = useState(purchasedProgramId);
  const [internalHasLmsAccess, setInternalHasLmsAccess] = useState(hasLmsAccess || false);
  const router = useRouter();
  
  const t = useTranslations("Navbar");
  const locale = useLocale();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    // Update internal state if props change
    if (isLoggedIn !== undefined) setInternalIsLoggedIn(isLoggedIn);
    if (purchasedProgramId !== undefined) setInternalPurchasedProgramId(purchasedProgramId);
    if (userRole !== undefined) setUserRoleState(userRole);
  }, [isLoggedIn, purchasedProgramId, userRole]);



  const navLinks: { label: string; href: string; isRoute: boolean; italic?: boolean }[] = [
    { label: t("program"), href: "/programs", isRoute: true },
    { label: t("kurikulum"), href: "/kurikulum", isRoute: true },
    { label: t("verifikasi"), href: "/verifikasi", isRoute: true },
    { label: t("tentang_kami"), href: "/tentang-kami", isRoute: true },
  ];

  const getHref = (link: { href: string; isRoute: boolean }) => {
    if (link.isRoute) return link.href;
    return isHome ? link.href : `/${link.href}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      if (!isHome) return;

      const sections = navLinks.filter(l => !l.isRoute).map((link) => link.href.substring(1));
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const darkHeroRoutes = ["/", "/kurikulum", "/verifikasi", "/tentang-kami"];
  const isDarkHeroRoute = darkHeroRoutes.includes(pathname) || pathname.startsWith("/program/");
  const isLightHeader = !scrolled && !isDarkHeroRoute;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 flex items-center border-b w-full ${
          scrolled
            ? "h-16 bg-[var(--color-ink)]/90 backdrop-blur-lg border-[var(--color-ink-2)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
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
              const isActive = (isHome && activeSection === link.href.substring(1)) || (link.isRoute && isProgramsPage && link.href === "/programs");
              return (
                <Link
                  key={link.label}
                  href={getHref(link)}
                  className={`text-sm transition-all duration-200 py-2 border-b-[3px] ${
                    isActive
                      ? `${isLightHeader ? "text-[var(--color-ink)]" : "text-white"} border-[var(--color-signal)]`
                      : `${isLightHeader ? "text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]" : "text-[var(--color-line-strong)] hover:text-white"} border-transparent`
                  } ${link.italic ? "font-bold italic" : "font-bold"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {internalIsLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    if (internalPurchasedProgramId) {
                      router.push(`/kelas/${internalPurchasedProgramId}`);
                    } else {
                      router.push('/kelas');
                    }
                  }}
                  className="hidden lg:flex items-center justify-center bg-[var(--color-signal)]/10 hover:bg-[var(--color-signal)]/20 text-[var(--color-signal)] text-sm font-bold px-4 py-2 rounded-full transition-colors border border-[var(--color-signal)]/30"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Lanjutkan Belajar
                </button>
                
                {userRoleState && internalHasLmsAccess && (
                  <NativeLink
                    href={`/${userRoleState}`}
                    className={`hidden sm:flex items-center justify-center bg-transparent text-sm font-semibold px-4 py-2 rounded-full transition-colors border ${
                      isLightHeader
                        ? "text-[var(--color-ink)]/70 hover:bg-[var(--color-ink)]/5 border-[var(--color-ink)]/20"
                        : "text-[var(--color-line-strong)] hover:bg-white/10 border-white/20"
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Panel {userRoleState === "admin" ? "Admin" : userRoleState === "mentor" ? "Mentor" : "Siswa"}
                  </NativeLink>
                )}
                <button
                  onClick={handleLogout}
                  className={`hidden sm:flex items-center justify-center bg-transparent text-sm font-semibold p-2 rounded-full transition-colors ${
                    isLightHeader ? "text-[var(--color-ink)]/70 hover:bg-[var(--color-ink)]/5" : "text-[var(--color-line-strong)] hover:bg-white/10"
                  }`}
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/pembeli/login"
                  className={`hidden sm:block text-sm font-bold transition-colors ${
                    isLightHeader ? "text-[var(--color-ink)] hover:text-[var(--color-ink)]/70" : "text-[var(--color-line-strong)] hover:text-white"
                  }`}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/pembeli/register"
                  className="hidden sm:flex items-center justify-center bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] text-sm font-bold px-6 py-2.5 rounded-full transition-transform shadow-[var(--shadow-btn)] focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
                >
                  Daftar Bootcamp
                </Link>
              </>
            )}

            <Link
              href={pathname}
              locale={locale === "id" ? "en" : "id"}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                isLightHeader ? "text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5" : "text-white hover:bg-white/10"
              }`}
              title="Toggle Language"
            >
              <Globe className="w-5 h-5 mr-1" />
              <span className="text-xs font-bold uppercase">{locale === "id" ? "EN" : "ID"}</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                isLightHeader ? "text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5" : "text-white hover:bg-white/10"
              }`}
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
            className="fixed inset-0 z-40 bg-[var(--color-bg)] pt-20 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-1 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={getHref(link)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-4 text-lg text-[var(--color-ink)] hover:text-[var(--color-signal)] border-b border-[var(--color-cream-line)] transition-colors ${link.italic ? 'font-medium italic' : 'font-medium'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              {internalIsLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (internalPurchasedProgramId) {
                        router.push(`/kelas/${internalPurchasedProgramId}`);
                      } else {
                        router.push('/kelas');
                      }
                    }}
                    className="w-full py-3.5 rounded-lg text-center bg-[var(--color-signal)]/10 text-[var(--color-signal-hover)] font-bold flex items-center justify-center gap-2 border border-[var(--color-signal)]/30"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Lanjutkan Belajar
                  </button>

                  {userRoleState && internalHasLmsAccess && (
                    <NativeLink
                      href={`/${userRoleState}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 rounded-lg text-center bg-[var(--color-ink)] text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      Panel {userRoleState === "admin" ? "Admin" : userRoleState === "mentor" ? "Mentor" : "Siswa"}
                    </NativeLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 rounded-lg text-center bg-[var(--color-paper)] text-[var(--color-muted)] font-semibold mt-2 border border-[var(--color-cream-line)]"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/pembeli/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 rounded-lg text-center text-[var(--color-ink)] border border-[var(--color-line-strong)] font-medium"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/pembeli/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 rounded-lg text-center bg-[var(--color-signal)] text-[var(--color-ink)] font-bold"
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
