"use client"

import * as React from "react"
import Link from "next/link"
import {
  PlayCircle, Lock, CheckCircle2, Clock, ChevronRight, Video,
  Star, ArrowLeft, Loader2, AlertCircle, BookOpen, Crown
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { programs, type ProgramData, type CurriculumVideo } from "@/components/marketing/data/marketing-data"
import { getMyVideoAccess, type VideoAccess } from "@/app/(dashboard)/admin/marketing/actions"

// ================================================================
// HELPERS
// ================================================================
const TIER_LEVEL: Record<string, number> = { junior: 1, expert: 2 }

function canWatchVideo(videoIndex: number, tier: "junior" | "expert"): boolean {
  if (tier === "expert") return true
  // Junior hanya bisa nonton setengah pertama kurikulum (video "basic")
  return videoIndex < 2
}

// ================================================================
// VIDEO PLAYER PLACEHOLDER
// ================================================================
function VideoPlayer({ video, canWatch }: { video: CurriculumVideo; canWatch: boolean }) {
  if (!canWatch) {
    return (
      <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-white font-bold text-lg">Materi Expert</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Video ini tersedia untuk paket <strong className="text-white">Expert</strong> dan <strong className="text-white">Bootcamp</strong>.
            Upgrade paket Anda untuk mengakses materi ini.
          </p>
          <Link
            href="/#pricing"
            className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade Paket
          </Link>
        </div>
      </div>
    )
  }

  if (!video.videoUrl) {
    return (
      <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
          <PlayCircle className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-400 text-sm">Video segera hadir</p>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe
        src={video.videoUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowFullScreen
        title={video.title}
      />
    </div>
  )
}

// ================================================================
// CURRICULUM LIST ITEM
// ================================================================
function CurriculumItem({
  video,
  index,
  isActive,
  canWatch,
  onClick,
}: {
  video: CurriculumVideo
  index: number
  isActive: boolean
  canWatch: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!canWatch}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl transition-all ${
        isActive
          ? "bg-slate-900 text-white"
          : canWatch
          ? "hover:bg-slate-100 text-slate-800"
          : "opacity-50 cursor-not-allowed text-slate-400"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isActive ? "bg-white/10 text-white" : canWatch ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
        }`}
      >
        {canWatch ? (isActive ? <PlayCircle className="w-4 h-4" /> : index + 1) : <Lock className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-tight ${isActive ? "text-white" : ""}`}>{video.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className={`w-3 h-3 ${isActive ? "text-slate-400" : "text-slate-400"}`} />
          <span className="text-xs text-slate-400">{video.duration}</span>
          {!canWatch && (
            <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
              Expert
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ================================================================
// PENDING ACCESS STATE
// ================================================================
function PendingAccessView({ programId }: { programId: string }) {
  const program = programs.find((p) => p.id === programId)
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Sedang Diproses</h2>
      <p className="text-slate-500 max-w-md mb-6">
        Pembayaran Anda untuk <strong>{program?.name}</strong> sedang diverifikasi oleh tim E17 Course.
        Akses video akan aktif setelah dikonfirmasi (biasanya dalam 1×24 jam).
      </p>
      <Link
        href="/siswa"
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>
    </div>
  )
}

// ================================================================
// NO ACCESS STATE
// ================================================================
function NoAccessView() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-5">
        <Video className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Belum Ada Akses Video</h2>
      <p className="text-slate-500 max-w-md mb-6">
        Anda belum memiliki akses ke video materi. Beli paket Junior atau Expert dari halaman utama.
      </p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Lihat Paket
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// ================================================================
// MULTI-PROGRAM SELECTOR (jika punya akses > 1 program)
// ================================================================
function ProgramSelector({
  accesses,
  selectedProgramId,
  onSelect,
  dbPrograms
}: {
  accesses: VideoAccess[]
  selectedProgramId: string
  onSelect: (id: string) => void
  dbPrograms: any[]
}) {
  if (accesses.length <= 1) return null
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {accesses.map((access) => {
        const prog = dbPrograms.find((p) => p.id === access.program_id)
        if (!prog) return null
        return (
          <button
            key={access.program_id}
            onClick={() => onSelect(access.program_id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedProgramId === access.program_id
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {prog.shortName || prog.name}
          </button>
        )
      })}
    </div>
  )
}

// ================================================================
// MAIN VIDEO PORTAL
// ================================================================
export default function VideoPortalPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [accesses, setAccesses] = React.useState<VideoAccess[]>([])
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(null)
  const [activeVideoIndex, setActiveVideoIndex] = React.useState(0)
  const [dbPrograms, setDbPrograms] = React.useState<any[]>(programs)

  React.useEffect(() => {
    Promise.all([
      getMyVideoAccess(),
      import("@/app/(dashboard)/admin/marketing/actions").then(m => m.getAllMarketingContent())
    ]).then(([accessData, contentData]) => {
      setAccesses(accessData)
      if (accessData.length > 0) setSelectedProgramId(accessData[0].program_id)
      
      const progSection = contentData.find(s => s.section_key === 'programs')
      if (progSection && progSection.data && Array.isArray(progSection.data.items)) {
        setDbPrograms(progSection.data.items)
      }
      
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (accesses.length === 0) return <NoAccessView />

  const currentAccess = accesses.find((a) => a.program_id === selectedProgramId) ?? accesses[0]
  const currentProgram = dbPrograms.find((p) => p.id === currentAccess.program_id)

  if (!currentProgram) return <NoAccessView />

  const curriculum = currentProgram.curriculum ?? []
  const userTier = currentAccess.tier
  const activeVideo = curriculum[activeVideoIndex]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/siswa" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-semibold">Video Materi</span>
      </div>

      {/* Program Selector (multiple programs) */}
      <ProgramSelector
        accesses={accesses}
        selectedProgramId={selectedProgramId ?? currentAccess.program_id}
        dbPrograms={dbPrograms}
        onSelect={(id) => {
          setSelectedProgramId(id)
          setActiveVideoIndex(0)
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{currentProgram.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                userTier === "expert"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-sky-50 text-sky-700 border-sky-200"
              }`}
            >
              {userTier === "expert" ? <Crown className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              Paket {userTier === "expert" ? "Expert" : "Junior"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              {curriculum.length} video
            </span>
          </div>
        </div>

        {userTier === "junior" && (
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade ke Expert
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="xl:col-span-2 space-y-4">
          {activeVideo && (
            <VideoPlayer
              video={activeVideo}
              canWatch={canWatchVideo(activeVideoIndex, userTier)}
            />
          )}

          {/* Video Info */}
          {activeVideo && canWatchVideo(activeVideoIndex, userTier) && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-bold text-slate-900 text-lg">{activeVideo.title}</h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{activeVideo.description}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {activeVideo.duration}
              </div>
            </div>
          )}
        </div>

        {/* Curriculum Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Daftar Materi</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {userTier === "junior"
                  ? `${Math.min(2, curriculum.length)} dari ${curriculum.length} video tersedia`
                  : `${curriculum.length} video tersedia`}
              </p>
            </div>
            <div className="p-3 space-y-1 max-h-[480px] overflow-y-auto">
              {curriculum.map((video: any, idx: number) => {
                const canWatch = canWatchVideo(idx, userTier)
                return (
                  <CurriculumItem
                    key={video.id}
                    video={video}
                    index={idx}
                    isActive={idx === activeVideoIndex}
                    canWatch={canWatch}
                    onClick={() => { if (canWatch) setActiveVideoIndex(idx) }}
                  />
                )
              })}
            </div>
          </div>

          {/* Progress (simple) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.round(((activeVideoIndex + 1) / curriculum.length) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">
                {activeVideoIndex + 1}/{curriculum.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
