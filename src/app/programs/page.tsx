import { getActiveMarketingPrograms } from "@/app/(dashboard)/admin/marketing/program-actions";
import { getWhatsAppUrl } from "@/components/marketing/data/marketing-data";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

export const metadata = {
  title: "Katalog Program | LMS E17",
  description: "Jelajahi semua program belajar yang tersedia di E17 Course.",
};

export default async function ProgramsPage() {
  const programs = await getActiveMarketingPrograms();

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1A14] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#EFE6CC] py-4 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[20px] text-[#1C1A14] flex items-center gap-2 hover:text-[#FF7A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD400] rounded">
            <span className="bg-[#FFD400] text-[#2A2100] px-2 py-0.5 rounded-[6px]">E17</span> COURSE
          </Link>
          <Link href="/" className="text-[#6B6355] hover:text-[#1C1A14] font-bold text-[14px] flex items-center gap-1.5 transition-colors bg-[#FAFAF8] hover:bg-[#EFE6CC] px-4 py-2 rounded-[8px] border border-[#EFE6CC] focus:outline-none focus:ring-2 focus:ring-[#FFD400]">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
        <div className="mb-16 text-center lg:text-left max-w-2xl">
          <h1 className="text-[32px] lg:text-[48px] font-extrabold text-[#1C1A14] tracking-tight mb-4">
            Katalog Program
          </h1>
          <p className="text-[#6B6355] text-[16px] lg:text-[18px] leading-relaxed">
            Pilih jalur belajar Anda dan bangun portofolio tech yang terstruktur.
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="bg-white border border-[#EFE6CC] rounded-[16px] p-12 text-center shadow-sm">
            <h2 className="text-[20px] font-bold text-[#1C1A14] mb-2">Belum Ada Program Aktif</h2>
            <p className="text-[#6B6355]">Saat ini belum ada program yang tersedia. Silakan periksa kembali nanti.</p>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-24">
            {programs.map((program) => {
              // Kalkulasi Sesi dan Durasi
              const outline = Array.isArray(program.curriculum) ? program.curriculum : [];
              const sessionsCount = outline.length;
              
              let totalSeconds = 0;
              outline.forEach((mat: any) => {
                if (mat.duration) {
                  const parts = mat.duration.split(":");
                  if (parts.length === 2) {
                    totalSeconds += (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                  } else if (parts.length === 3) {
                    totalSeconds += (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
                  }
                }
              });

              let durationText = "";
              if (totalSeconds > 0) {
                const mins = Math.round(totalSeconds / 60);
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                durationText = h > 0 ? `${h} jam ${m} mnt` : `${m} mnt`;
              }

              // Kalkulasi Harga Termurah (Mulai Dari)
              const completeTier = program.tiers?.find(t => t.tier_type === "complete");
              const lowestTier = program.tiers?.find(t => t.tier_type === "junior");
              const displayPrice = lowestTier?.price ?? completeTier?.price ?? 0;

              return (
                <div 
                  key={program.id} 
                  className="flex flex-col md:flex-row md:even:flex-row-reverse gap-8 lg:gap-16 items-center"
                >
                  {/* VISUAL BLOCK */}
                  <div className="w-full md:w-1/2 aspect-[4/3] lg:aspect-auto lg:h-[400px] bg-white border border-[#EFE6CC] rounded-[16px] shadow-sm flex flex-col items-center justify-center p-8 text-center shrink-0">
                    {sessionsCount > 0 || durationText ? (
                      <div className="space-y-6">
                        {sessionsCount > 0 && (
                          <div>
                            <span className="block text-[48px] lg:text-[64px] font-extrabold text-[#1C1A14] leading-none tracking-tight">
                              {sessionsCount}
                            </span>
                            <span className="block text-[14px] lg:text-[16px] font-bold text-[#6B6355] uppercase tracking-widest mt-2">
                              Sesi Pembelajaran
                            </span>
                          </div>
                        )}
                        
                        {sessionsCount > 0 && durationText && (
                          <div className="w-12 h-[1px] bg-[#EFE6CC] mx-auto"></div>
                        )}

                        {durationText && (
                          <div>
                            <span className="block text-[32px] lg:text-[40px] font-extrabold text-[#1C1A14] leading-none tracking-tight">
                              {durationText}
                            </span>
                            <span className="block text-[14px] lg:text-[16px] font-bold text-[#6B6355] uppercase tracking-widest mt-2">
                              Total Durasi
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[24px] font-bold text-[#A39C8F] px-4 text-balance">
                        {program.name}
                      </div>
                    )}
                  </div>

                  {/* TEXT BLOCK */}
                  <div className="w-full md:w-1/2 flex flex-col">
                    <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1C1A14] leading-tight mb-4">
                      {program.name}
                    </h2>
                    
                    {program.description && (
                      <p className="text-[16px] lg:text-[18px] text-[#6B6355] leading-relaxed mb-8">
                        {program.description}
                      </p>
                    )}

                    <ul className="space-y-4 mb-8">
                      {displayPrice > 0 ? (
                        <li className="flex flex-col">
                          <span className="text-[12px] text-[#A39C8F] font-bold uppercase tracking-widest mb-1">Mulai Dari</span>
                          <span className="text-[24px] lg:text-[28px] font-extrabold text-[#1C1A14]">
                            {formatRupiah(displayPrice)}
                          </span>
                        </li>
                      ) : (
                        <li className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#A39C8F]">Harga belum tersedia</span>
                        </li>
                      )}
                      
                      {(sessionsCount > 0 || durationText) && (
                        <li className="flex items-center gap-4 text-[15px] font-medium text-[#1C1A14]">
                          {sessionsCount > 0 && (
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#6B6355]" /> {sessionsCount} Sesi
                            </span>
                          )}
                          {durationText && (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#6B6355]" /> {durationText}
                            </span>
                          )}
                        </li>
                      )}
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                      <Link
                        href={`/program/${program.slug}`}
                        className="text-center px-6 py-3.5 bg-[#FFD400] text-[#1C1A14] font-bold rounded-[8px] hover:bg-[#FFB800] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:ring-offset-2"
                      >
                        Lihat Detail
                      </Link>
                      
                      <a
                        href={getWhatsAppUrl(program.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center px-6 py-3.5 bg-white border-2 border-[#1C1A14] text-[#1C1A14] font-bold rounded-[8px] hover:bg-[#FAFAF8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1A14] focus:ring-offset-2"
                      >
                        Tanya via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
