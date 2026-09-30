import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Check, Sparkles, Clock, BookOpen, ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('marketing_programs')
    .select('name, description')
    .eq('slug', params.slug)
    .single();
  
  if (!data) return { title: 'Program Tidak Ditemukan' };
  
  return {
    title: `${data.name} | LMS E17`,
    description: data.description
  };
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  
  // 1. Fetch Program Data
  const { data: program } = await supabase
    .from('marketing_programs')
    .select('id, name, slug, description, full_description, is_active, curriculum')
    .eq('slug', params.slug)
    .single();

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
  outline.forEach((mat: any) => {
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

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const descriptionParagraphs = program.full_description 
    ? program.full_description.split('\n\n').filter((p: string) => p.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[var(--color-ink)]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-medium transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        
        {/* 1. Hero Section */}
        <section className="mb-16 lg:mb-24">
          <h1 className="text-[36px] lg:text-[48px] font-extrabold leading-tight tracking-tight mb-6 text-[#1C1A14]">
            {program.name}
          </h1>
          <p className="text-[18px] lg:text-[20px] text-[#6B6355] leading-relaxed max-w-3xl mb-8">
            {program.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-[10px] border border-[#EFE6CC] shadow-sm">
              <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-bold">{outline.length} Sesi Pembelajaran</span>
            </div>
            {totalDurationFormatted && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-[10px] border border-[#EFE6CC] shadow-sm">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="font-bold">Total Durasi: {totalDurationFormatted}</span>
              </div>
            )}
          </div>
        </section>

        {/* 2. Deskripsi Lengkap */}
        {descriptionParagraphs.length > 0 && (
          <section className="mb-16 lg:mb-24">
            <h2 className="text-[24px] lg:text-[32px] font-extrabold mb-8 text-[#1C1A14]">Tentang Program Ini</h2>
            <div className="bg-white rounded-[16px] p-8 lg:p-12 border border-[#EFE6CC] shadow-sm space-y-6">
              {descriptionParagraphs.map((para: string, idx: number) => (
                <p key={idx} className="text-[#6B6355] text-[16px] lg:text-[18px] leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 3. Daftar Sesi / Outline */}
        <section className="mb-16 lg:mb-24">
          <h2 className="text-[24px] lg:text-[32px] font-extrabold mb-8 text-[#1C1A14]">Kurikulum & Materi</h2>
          {outline.length > 0 ? (
            <div className="bg-white rounded-[16px] border border-[#EFE6CC] shadow-sm overflow-hidden flex flex-col">
              {outline.map((mat: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 px-6 border-b border-[#EFE6CC] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFFBEF] text-[#FF7A1A] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-[16px] text-[#1C1A14] leading-snug pt-1">{mat.title}</span>
                  </div>
                  {mat.duration && (
                    <div className="flex items-center gap-1.5 text-[#6B6355] text-[14px] font-medium sm:ml-auto pl-12 sm:pl-0 shrink-0">
                      <Clock className="w-4 h-4" />
                      <span>{mat.duration}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[16px] p-12 border border-[#EFE6CC] shadow-sm text-center">
              <p className="text-[#6B6355] text-[16px] font-medium">Materi sedang disiapkan.</p>
            </div>
          )}
        </section>

        {/* 4. Harga / Tiers */}
        <section className="mb-24">
          <h2 className="text-[24px] lg:text-[32px] font-extrabold mb-8 text-[#1C1A14]">Pilih Paket Belajar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {tiers?.map((tier) => {
              const isComplete = tier.tier_type === 'complete' || tier.tier_type === 'bootcamp';
              return (
                <div 
                  key={tier.tier_type} 
                  className={`relative rounded-[16px] flex flex-col bg-white h-full transition-all duration-300 hover:shadow-lg ${
                    isComplete 
                      ? "z-10 shadow-[0_16px_48px_rgba(28,26,20,0.12)] border-2 border-[#FFD400]" 
                      : "z-0 shadow-[0_8px_24px_rgba(28,26,20,0.06)] border border-[#EFE6CC]"
                  }`}
                >
                  <div className="flex-1 p-6 lg:p-8 flex flex-col h-full relative">
                    {isComplete && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className="flex items-center gap-1.5 bg-[#FFD400] text-[#2A2100] text-[12px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                          <Sparkles className="w-3.5 h-3.5" /> Rekomendasi
                        </span>
                      </div>
                    )}

                    <h3 className="font-extrabold text-[20px] lg:text-[24px] text-[#1C1A14] mb-6 text-center">
                      {tier.label}
                    </h3>

                    <div className="mb-8 text-center">
                      <p className="text-[28px] lg:text-[36px] font-extrabold tracking-tight text-[#1C1A14] whitespace-nowrap">
                        {formatRupiah(tier.price)}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1 border-t border-[#EFE6CC] pt-6">
                      {Array.isArray(tier.features) && tier.features.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isComplete ? "bg-[#FFFBEF]" : "bg-[#FAFAF8]"}`}>
                            <Check className={`w-3.5 h-3.5 ${isComplete ? "text-[#FF7A1A]" : "text-[#1C1A14]"}`} />
                          </div>
                          <span className="text-[15px] font-medium text-[#1C1A14] leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-center mt-auto">
                      <Link
                        href={`/checkout?program=${program.slug}&tier=${tier.tier_type}`}
                        className={`w-full py-3.5 rounded-[10px] text-center text-[16px] font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1C1A14] ${
                          isComplete
                            ? "bg-gradient-to-br from-[#FF7A1A] to-[#FF3D68] text-white shadow-md hover:-translate-y-0.5"
                            : "bg-white text-[#1C1A14] border border-[#EFE6CC] shadow-sm hover:border-[#FFD400]"
                        }`}
                      >
                        {isComplete ? "Pilih Paket" : "Pilih Paket"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
