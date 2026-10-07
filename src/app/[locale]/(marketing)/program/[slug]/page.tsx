import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import ProgramContentView from "@/components/marketing/sections/ProgramContentView";
import { type MarketingCurriculumItem } from "@/app/(lms)/(dashboard)/admin/marketing/program-actions";
import { getMarketingSession } from "@/utils/marketing-auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('marketing_programs')
    .select('name, description')
    .eq('slug', resolvedParams.slug)
    .single();
  
  if (!data) return { title: 'Program Tidak Ditemukan' };
  
  return {
    title: `${data.name} | LMS E17`,
    description: data.description
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { isLoggedIn, purchasedProgramId, role, hasLmsAccess } = await getMarketingSession();
  
  // 1. Fetch Program Data
  const { data: program, error: programError } = await supabase
    .from('marketing_programs')
    .select('*, curriculum: marketing_program_curriculum(*)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (programError) {
    console.error("Supabase Error fetching program:", programError);
  }

  if (!program || !program.is_active) {
    notFound();
  }

  // 2. Fetch Tiers
  const { data: tiers } = await supabase
    .from('marketing_program_tiers')
    .select('tier_type, label, price, features, sort_order')
    .eq('program_id', program.id)
    .order('sort_order', { ascending: true });

  // 3. Process Curriculum for outline
  const outline = Array.isArray(program.curriculum) ? program.curriculum : [];
  
  // Calculate total sessions and duration
  let totalSeconds = 0;
  outline.forEach((mat: MarketingCurriculumItem) => {
    if (mat.duration) {
      const parts = mat.duration.split(':');
      if (parts.length === 2) {
        totalSeconds += (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      } else if (parts.length === 3) {
        totalSeconds += (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
      }
    }
  });
  
  let totalDurationFormatted = "";
  if (totalSeconds > 0) {
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    totalDurationFormatted = hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;
  }

  const descriptionParagraphs = program.full_description 
    ? program.full_description.split('\n\n').filter((p: string) => p.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-sans relative">
      <MarketingHeader isLoggedIn={isLoggedIn} purchasedProgramId={purchasedProgramId} userRole={role} hasLmsAccess={hasLmsAccess} />

      <ProgramContentView 
        program={program}
        tiers={tiers || []}
        outline={outline}
        totalDurationFormatted={totalDurationFormatted}
        descriptionParagraphs={descriptionParagraphs}
      />
      
      <FooterSection />
    </div>
  );
}
