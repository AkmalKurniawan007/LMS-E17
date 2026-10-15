import * as React from "react"
import { CheckCircle2, Lock, Sparkles, ArrowUpRight, Radio, BookOpen, Award } from "lucide-react"
import { Tier, TIER_LABELS, Capability, getCapabilityAccess, isLocked } from "@/lib/access-tier"
import { UPGRADE_URL } from "@/components/bnsp/BnspLockedBanner"

export interface TierStatusSummary {
  liveAttendance?: {
    attended: number
    total: number
  }
  materials?: {
    completed: number
    total: number
  }
  bnsp?: {
    theoryStatus: string
    theoryScore?: number | null
    portfolioStatus: string
    assessorStatus: string
  }
}

interface TierStatusCardProps {
  tier: Tier
  enrollmentStatus?: string
  summary?: TierStatusSummary
  className?: string
}

export function TierStatusCard({
  tier,
  enrollmentStatus = "Aktif",
  summary,
  className = "",
}: TierStatusCardProps) {
  const featureItems: { name: string; cap: Capability }[] = [
    { name: "Video Materi", cap: "video_materi" },
    { name: "Live Sesi 1-4 (Zoom + absen)", cap: "live_session" },
    { name: "Ujian & Sertifikat BNSP", cap: "bnsp_exam" },
  ]

  // Filter out features that are 'hidden'
  const visibleFeatures = featureItems.filter((f) => {
    const access = getCapabilityAccess(tier, f.cap)
    return access !== "hidden"
  })

  return (
    <div className={`card-clean p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-e17-navy text-white flex items-center justify-center font-black text-sm shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Paket Saya
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-lg font-black text-e17-dark">
                {TIER_LABELS[tier] || "Paket Belajar"}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                {enrollmentStatus}
              </span>
            </div>
          </div>
        </div>

        {isLocked(tier, "bnsp_exam") && (
          <a
            href={UPGRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Upgrade Paket
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Daftar Fitur dan Status Hak Akses */}
      <div className="mt-4 space-y-2.5">
        {visibleFeatures.map((item) => {
          const itemLocked = isLocked(tier, item.cap)

          return (
            <div
              key={item.cap}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                itemLocked
                  ? "bg-amber-50/70 border border-amber-200/80"
                  : "bg-slate-50/70 border border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {itemLocked ? (
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className={`text-xs font-semibold ${itemLocked ? "text-amber-950" : "text-slate-800"}`}>
                  {item.name}
                </span>
              </div>

              <div>
                {itemLocked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-800">
                      Terkunci
                    </span>
                    <a
                      href={UPGRADE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-extrabold text-orange-600 hover:text-orange-700 underline"
                    >
                      Upgrade
                    </a>
                  </div>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    Aktif
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* T10: Ringkasan Progres Paket */}
      {summary && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ringkasan Progres Paket
            </span>
          </div>

          {/* 1. Kehadiran Live (Hanya jika kapabilitas live_session granted) */}
          {getCapabilityAccess(tier, "live_session") === "granted" && summary.liveAttendance && (
            <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-500" /> Kehadiran Live Class
                </span>
                <span className="font-bold text-slate-800">
                  {summary.liveAttendance.attended} / {summary.liveAttendance.total} Sesi Online
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${summary.liveAttendance.total > 0 
                      ? Math.min(100, Math.round((summary.liveAttendance.attended / summary.liveAttendance.total) * 100)) 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* 2. Materi Pembelajaran Selesai */}
          {summary.materials && (
            <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Materi Pembelajaran
                </span>
                <span className="font-bold text-slate-800">
                  {summary.materials.completed} / {summary.materials.total} Selesai
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${summary.materials.total > 0 
                      ? Math.min(100, Math.round((summary.materials.completed / summary.materials.total) * 100)) 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. Status BNSP (Hanya jika kapabilitas bnsp_exam granted) */}
          {getCapabilityAccess(tier, "bnsp_exam") === "granted" && summary.bnsp && (
            <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Sertifikasi BNSP
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  summary.bnsp.assessorStatus === 'kompeten'
                    ? 'bg-emerald-100 text-emerald-800'
                    : summary.bnsp.assessorStatus === 'belum_kompeten'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {summary.bnsp.assessorStatus === 'kompeten' ? 'KOMPETEN' :
                   summary.bnsp.assessorStatus === 'belum_kompeten' ? 'BELUM KOMPETEN' : 'MENUNGGU ASESMEN'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Ujian Teori</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {summary.bnsp.theoryScore !== null && summary.bnsp.theoryScore !== undefined
                      ? `${summary.bnsp.theoryScore} Pts`
                      : summary.bnsp.theoryStatus === 'passed' ? 'Lulus' : 'Belum Ujian'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Portofolio APL</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {summary.bnsp.portfolioStatus === 'accepted' ? 'Diterima' :
                     summary.bnsp.portfolioStatus === 'revision_needed' ? 'Perlu Revisi' :
                     summary.bnsp.portfolioStatus === 'under_review' ? 'Ditinjau' : 'Belum Submit'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
