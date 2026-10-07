import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { getMarketingSession } from "@/utils/marketing-auth";

export default async function KelasDashboardPage() {
  const { isLoggedIn, purchasedProgramId, role, hasLmsAccess } = await getMarketingSession();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <MarketingHeader 
        isLoggedIn={isLoggedIn}
        purchasedProgramId={purchasedProgramId}
        userRole={role}
        hasLmsAccess={hasLmsAccess}
      />
      <main className="flex-1 flex flex-col items-center justify-center py-32 px-6">
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto mt-20">
          <BookOpen className="w-16 h-16 text-[var(--color-muted-light)] mb-6" />
          <h2 className="text-2xl font-extrabold text-[var(--color-ink)] mb-3">Belum Ada Program</h2>
          <p className="text-[var(--color-muted)] text-lg mb-8">
            Anda belum memiliki akses atau belum membeli program apapun.
          </p>
          <Link 
            href="/#pricing" 
            className="bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-2"
          >
            Lihat Program Kami
          </Link>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
