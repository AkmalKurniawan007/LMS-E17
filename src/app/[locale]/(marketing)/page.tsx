import MarketingView from "@/components/marketing/MarketingView"
import { getActiveMarketingPrograms } from "@/app/(lms)/(dashboard)/admin/marketing/program-actions"
import { getMarketingSession } from "@/utils/marketing-auth"

export const revalidate = 0;

export default async function Home() {
  const dbPrograms = await getActiveMarketingPrograms();

  // Transform DB programs to shape expected by marketing components
  const programs = dbPrograms.map(p => ({
    id: p.slug,                  // komponen pakai slug sebagai id (ui-ux, fullstack-web, dll)
    name: p.name,
    shortName: p.short_name,
    description: p.description ?? "",
    sessions: p.sessions_count,
    modules: p.modules_count,
    price: p.tiers?.find(t => t.tier_type === "complete")?.price ?? 0,
    originalPrice: p.tiers?.find(t => t.tier_type === "complete")?.original_price ?? 0,
    rating: p.rating,
    students: p.students_count,
    videoUrl: "",
    thumbnailText: p.thumbnail_text ?? p.short_name,
    features: p.tiers?.find(t => t.tier_type === "complete")?.features ?? [],
    tiers: p.tiers?.map(t => ({
      type: t.tier_type,
      label: t.label,
      price: t.price,
      originalPrice: t.original_price,
      popular: t.is_popular,
      features: t.features,
      excludes: t.excludes,
    })) ?? [],
    curriculum: p.curriculum?.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      duration: c.duration ?? "",
      video_url: c.video_url,
      preview_video_url: c.preview_video_url,
      access_tiers: c.access_tiers,
    })) ?? [],
  }))

  const { isLoggedIn, purchasedProgramId, purchasedTier, role, hasLmsAccess } = await getMarketingSession()

  return (
    <MarketingView 
      dbPrograms={programs} 
      isLoggedIn={isLoggedIn}
      purchasedProgramId={purchasedProgramId}
      purchasedTier={purchasedTier}
      userRole={role}
      hasLmsAccess={hasLmsAccess}
    />
  )
}

