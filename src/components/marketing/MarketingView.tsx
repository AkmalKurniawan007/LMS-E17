import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import HeroSection from "./sections/HeroSection";
import TrustBar from "./sections/TrustBar";
import StorySection from "./sections/StorySection";
import BenefitsSection from "./sections/BenefitsSection";
import VideoGallery from "./sections/VideoGallery";
import HowItWorksSection from "./sections/HowItWorksSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FAQSection from "./sections/FAQSection";
import FinalCTA from "./sections/FinalCTA";
import FooterSection from "./sections/FooterSection";
import WhatsAppFAB from "./sections/WhatsAppFAB";
import ScrollProgressBar from "./sections/ScrollProgressBar";
import { User as UserIcon } from "lucide-react";
import MarketingHeader from "./MarketingHeader";



export default function MarketingView({ 
  dbPrograms,
  isLoggedIn = false,
  purchasedProgramId,
  purchasedTier,
  userRole,
  hasLmsAccess = false
}: { 
  dbPrograms?: any[],
  isLoggedIn?: boolean,
  purchasedProgramId?: string,
  purchasedTier?: string,
  userRole?: string | null,
  hasLmsAccess?: boolean
}) {

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <ScrollProgressBar />
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={userRole} hasLmsAccess={hasLmsAccess} />
      <HeroSection dbPrograms={dbPrograms} />
      {/* <TrustBar /> */}
      <StorySection />
      <BenefitsSection />
      <VideoGallery 
        dynamicPrograms={dbPrograms}
        isLoggedIn={isLoggedIn}
        purchasedProgramId={purchasedProgramId}
        purchasedTier={purchasedTier}
      />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <FooterSection dbPrograms={dbPrograms} />
      <WhatsAppFAB />
    </div>
  );
}
