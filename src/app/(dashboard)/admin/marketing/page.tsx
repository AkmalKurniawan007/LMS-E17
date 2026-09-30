"use client"

import * as React from "react"
import {
  Globe, Save, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  MessageSquare, Star, FileText, Phone, Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAllMarketingContent,
  updateMarketingSection,
  type MarketingSection,
} from "./actions"

// ================================================================
// SECTION ICON MAP
// ================================================================
const SECTION_ICONS: Record<string, React.ReactNode> = {
  hero: <Layout className="w-4 h-4" />,
  promo: <Star className="w-4 h-4" />,
  whatsapp: <Phone className="w-4 h-4" />,
  footer: <FileText className="w-4 h-4" />,
  trust_bar: <Globe className="w-4 h-4" />,
  use_cases: <MessageSquare className="w-4 h-4" />,
  feature_showcase: <CheckCircle2 className="w-4 h-4" />,
  testimonials: <MessageSquare className="w-4 h-4" />,
  faq: <MessageSquare className="w-4 h-4" />,
  final_cta: <AlertCircle className="w-4 h-4" />,
}

const SECTION_COLOR: Record<string, string> = {
  hero: "bg-blue-50 border-blue-200 text-blue-700",
  promo: "bg-orange-50 border-orange-200 text-orange-700",
  whatsapp: "bg-green-50 border-green-200 text-green-700",
  footer: "bg-slate-50 border-slate-200 text-slate-700",
}

// ================================================================
// FIELD LABEL MAP: section_key -> field_key -> label
// ================================================================
const FIELD_LABELS: Record<string, Record<string, string>> = {
  hero: {
    badge: "Badge / Eyebrow",
    headline_line1: "Headline Baris 1",
    headline_line2: "Headline Baris 2",
    headline_line3: "Headline Baris 3",
    subheadline: "Sub-headline",
    cta_primary: "Teks CTA Utama",
    cta_secondary: "Teks CTA Sekunder",
    stats_students: "Statistik: Alumni",
    stats_rating: "Statistik: Rating",
    stats_sessions: "Statistik: Live Mentoring",
  },
  promo: {
    is_active: "Promo Aktif?",
    badge_text: "Badge Promo",
    title: "Judul Promo",
    description: "Deskripsi Promo",
    deadline_label: "Label Deadline",
    deadline_date: "Tanggal Deadline (ISO, kosongkan jika tidak ada)",
    cta_text: "Teks Tombol",
  },
  whatsapp: {
    number: "Nomor WhatsApp (format: 628xxx)",
    greeting: "Pesan Awal (tanpa program spesifik)",
  },
  footer: {
    tagline: "Tagline",
    email: "Email Kontak",
    instagram: "URL Instagram",
    linkedin: "URL LinkedIn",
    copyright: "Teks Copyright",
  },
  trust_bar: {
    headline: "Headline Teks",
  },
  use_cases: {
    headline: "Headline",
    subheadline: "Sub-headline",
  },
  feature_showcase: {
    headline: "Headline",
    subheadline: "Sub-headline",
  },
  testimonials: {
    headline: "Headline",
    subheadline: "Sub-headline",
  },
  faq: {
    headline: "Headline",
    subheadline: "Sub-headline",
  },
  final_cta: {
    headline: "Headline",
    subheadline: "Sub-headline",
    cta_primary_text: "Teks Tombol Utama",
    cta_secondary_text: "Teks Tombol Sekunder",
  }
}

type SaveStatus = "idle" | "saving" | "success" | "error"

// ================================================================
// FIELD EDITOR
// ================================================================
function FieldEditor({
  fieldKey,
  value,
  label,
  onChange,
}: {
  fieldKey: string
  value: unknown
  label: string
  onChange: (key: string, val: unknown) => void
}) {
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => onChange(fieldKey, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    )
  }

  const isLong =
    fieldKey.includes("description") ||
    fieldKey.includes("subheadline") ||
    fieldKey.includes("greeting") ||
    fieldKey.includes("tagline")

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {isLong ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-colors"
        />
      )}
    </div>
  )
}

// ================================================================
// SECTION FORM (Right Content)
// ================================================================
function SectionForm({ section }: { section: MarketingSection }) {
  const [localData, setLocalData] = React.useState<Record<string, unknown>>(
    section.data as Record<string, unknown>
  )
  const [status, setStatus] = React.useState<SaveStatus>("idle")

  // Update local state when section changes (e.g. switching tabs)
  React.useEffect(() => {
    setLocalData(section.data as Record<string, unknown>)
    setStatus("idle")
  }, [section])

  const labels = FIELD_LABELS[section.section_key] ?? {}
  const colorClass = SECTION_COLOR[section.section_key] ?? "bg-slate-50 border-slate-200 text-slate-700"
  const icon = SECTION_ICONS[section.section_key] ?? <Globe className="w-4 h-4" />

  const handleFieldChange = (key: string, val: unknown) => {
    setLocalData((prev) => ({ ...prev, [key]: val }))
    if (status !== "idle") setStatus("idle")
  }

  const handleSave = async () => {
    setStatus("saving")
    const result = await updateMarketingSection(section.section_key, localData)
    setStatus(result.success ? "success" : "error")
    if (result.success) {
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const formattedDate = section.updated_at
    ? new Date(section.updated_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-bold shadow-sm ${colorClass}`}>
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{section.label}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Terakhir diubah: {formattedDate}
            </p>
          </div>
        </div>
        
        {status === "success" && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-full">
            <CheckCircle2 className="w-4 h-4" /> Tersimpan
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-xs font-semibold text-red-600 border border-red-200 rounded-full">
            <AlertCircle className="w-4 h-4" /> Gagal Disimpan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {Object.entries(localData).map(([key, val]) => (
          <FieldEditor
            key={`${section.section_key}-${key}`}
            fieldKey={key}
            value={val}
            label={labels[key] ?? key}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold min-w-[160px]"
        >
          {status === "saving" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {status === "saving" ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function AdminMarketingPage() {
  const [sections, setSections] = React.useState<MarketingSection[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null)

  React.useEffect(() => {
    getAllMarketingContent().then((data) => {
      setSections(data)
      if (data.length > 0) {
        setActiveSectionId(data[0].id)
      }
      setIsLoading(false)
    })
  }, [])

  const activeSection = sections.find(s => s.id === activeSectionId)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Konten Halaman Marketing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Edit teks dan konten yang tampil di halaman utama situs publik E17 Course.
          Pilih bagian di sebelah kiri lalu ubah isinya.
        </p>
      </div>

      {isLoading ? (
        <div className="flex gap-6 h-[500px]">
          <div className="w-64 shrink-0 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl animate-pulse" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-sm">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-30 text-slate-400" />
          <p className="text-base font-medium text-slate-600">
            Belum ada data konten marketing.
          </p>
          <p className="text-sm mt-1">Jalankan SQL migration terlebih dahulu.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* LEFT SIDEBAR (Tabs) */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            {sections.map((section) => {
              const isActive = section.id === activeSectionId
              const icon = SECTION_ICONS[section.section_key] ?? <Globe className="w-4 h-4" />
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <span className={isActive ? "text-white opacity-80" : "text-slate-400"}>
                    {icon}
                  </span>
                  {section.label}
                </button>
              )
            })}
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-500 mb-2" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Perubahan yang Anda simpan akan langsung diterapkan secara <strong>real-time</strong> pada landing page pengunjung.
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT (Form) */}
          <div className="flex-1 min-w-0 w-full">
            {activeSection && (
              <SectionForm key={activeSection.id} section={activeSection} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
