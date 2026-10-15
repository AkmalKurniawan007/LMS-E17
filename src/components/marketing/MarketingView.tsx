import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import HeroSection from "./sections/HeroSection";
import StorySection from "./sections/StorySection";
import BenefitsSection from "./sections/BenefitsSection";
import VideoGallery from "./sections/VideoGallery";
import ProjectShowcaseSection from "./sections/ProjectShowcaseSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import FAQSection from "./sections/FAQSection";
import FinalCTA from "./sections/FinalCTA";
import FooterSection from "./sections/FooterSection";
import WhatsAppFAB from "./sections/WhatsAppFAB";
import ScrollProgressBar from "./sections/ScrollProgressBar";
import MarketingHeader from "./MarketingHeader";

export default function MarketingView({ 
  dbPrograms, 
  isLoggedIn = false,
  purchasedProgramId,
  purchasedTier,
  purchasedProgramIds,
  userRole,
  hasLmsAccess = false
}: { 
  dbPrograms?: any[], 
  isLoggedIn?: boolean, 
  purchasedProgramId?: string,
  purchasedTier?: string,
  purchasedProgramIds?: string[],
  userRole?: string | null,
  hasLmsAccess?: boolean
}) {

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <ScrollProgressBar />
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={userRole} hasLmsAccess={hasLmsAccess} />
      <HeroSection dbPrograms={dbPrograms} />
      <StorySection />
      <BenefitsSection />
      <VideoGallery 
        dynamicPrograms={dbPrograms}
        isLoggedIn={isLoggedIn}
        purchasedProgramId={purchasedProgramId}
        purchasedTier={purchasedTier}
        purchasedProgramIds={purchasedProgramIds}
        userRole={userRole}
      />
      <ProjectShowcaseSection 
        dynamicPrograms={dbPrograms}
        isLoggedIn={isLoggedIn}
      />
      <HowItWorksSection />
      <FAQSection />
      <FinalCTA />
      <FooterSection dbPrograms={dbPrograms} />
      <WhatsAppFAB />
    </div>
  );
}
