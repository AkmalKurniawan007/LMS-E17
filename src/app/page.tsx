import MarketingView from "@/components/marketing/MarketingView"
import { getAllMarketingContent } from "@/app/(dashboard)/admin/marketing/actions"
import { getActiveMarketingPrograms } from "@/app/(dashboard)/admin/marketing/program-actions"

export const revalidate = 0;

export default async function Home() {
  const [rawMarketingData, dbPrograms] = await Promise.all([
    getAllMarketingContent(),
    getActiveMarketingPrograms(),
  ])

  const marketingData = rawMarketingData.reduce((acc, curr) => {
    acc[curr.section_key] = curr.data;
    return acc;
  }, {} as Record<string, any>);

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
      videoUrl: "",
    })) ?? [],
  }))

  return <MarketingView dbContent={marketingData} dbPrograms={programs} />
}

