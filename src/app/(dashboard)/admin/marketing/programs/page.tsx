"use client"

import * as React from "react"
import {
  BookOpen, Loader2, Save, Trash2, Plus, ChevronDown, ChevronUp,
  Check, X, GripVertical, Edit2, AlertCircle, CheckCircle2, Package,
  ToggleLeft, ToggleRight, Users, Clock, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAllMarketingPrograms,
  updateMarketingProgram,
  deleteMarketingProgram,
  upsertMarketingTier,
  addCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  createMarketingProgram,
  type MarketingProgram,
  type MarketingProgramTier,
  type MarketingCurriculumItem,
} from "../program-actions"

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

const TIER_LABELS: Record<string, string> = {
  junior: "Junior (Video Only)",
  expert: "Expert (Video Only)",
  bootcamp: "Bootcamp Lengkap",
}

const TIER_COLORS: Record<string, string> = {
  junior: "bg-sky-50 border-sky-200 text-sky-700",
  expert: "bg-violet-50 border-violet-200 text-violet-700",
  bootcamp: "bg-orange-50 border-orange-200 text-orange-700",
}

type SaveStatus = "idle" | "saving" | "success" | "error"

// ================================================================
// INLINE EDITABLE TEXT
// ================================================================
function InlineEdit({
  value,
  onSave,
  className = "",
  multiline = false,
  placeholder = "",
}: {
  value: string
  onSave: (v: string) => Promise<void>
  className?: string
  multiline?: boolean
  placeholder?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [local, setLocal] = React.useState(value)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => { setLocal(value) }, [value])

  const commit = async () => {
    if (local === value) { setEditing(false); return }
    setSaving(true)
    await onSave(local)
    setSaving(false)
    setEditing(false)
  }

  const inputClass = `w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm ${className}`

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`text-left group relative ${className}`}
        title="Klik untuk edit"
      >
        {local || <span className="text-slate-400 italic">{placeholder}</span>}
        <Edit2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-40 inline transition-opacity" />
      </button>
    )
  }

  return (
    <div className="flex items-start gap-1">
      {multiline ? (
        <textarea
          autoFocus
          value={local}
          onChange={e => setLocal(e.target.value)}
          onKeyDown={e => { if (e.key === "Escape") { setLocal(value); setEditing(false) } }}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={local}
          onChange={e => setLocal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") { setLocal(value); setEditing(false) }
          }}
          className={inputClass}
        />
      )}
      <button onClick={commit} disabled={saving} className="shrink-0 w-7 h-7 flex items-center justify-center bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
      <button onClick={() => { setLocal(value); setEditing(false) }} className="shrink-0 w-7 h-7 flex items-center justify-center bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

// ================================================================
// TIER EDITOR
// ================================================================
function TierEditor({ tier, programId, onRefresh }: { tier: MarketingProgramTier; programId: string; onRefresh: () => void }) {
  const [local, setLocal] = React.useState(tier)
  const [status, setStatus] = React.useState<SaveStatus>("idle")
  const [featuresText, setFeaturesText] = React.useState((tier.features || []).join("\n"))
  const [excludesText, setExcludesText] = React.useState((tier.excludes || []).join("\n"))

  React.useEffect(() => {
    setLocal(tier)
    setFeaturesText((tier.features || []).join("\n"))
    setExcludesText((tier.excludes || []).join("\n"))
  }, [tier])

  const handleSave = async () => {
    setStatus("saving")
    const res = await upsertMarketingTier({
      programId,
      tierType: local.tier_type,
      label: local.label,
      price: local.price,
      originalPrice: local.original_price,
      isPopular: local.is_popular,
      isActive: local.is_active,
      sortOrder: local.sort_order,
      features: featuresText.split("\n").map(s => s.trim()).filter(Boolean),
      excludes: excludesText.split("\n").map(s => s.trim()).filter(Boolean),
    })
    setStatus(res.success ? "success" : "error")
    if (res.success) { setTimeout(() => setStatus("idle"), 2500); onRefresh() }
  }

  const colorClass = TIER_COLORS[local.tier_type] ?? "bg-slate-50 border-slate-200 text-slate-700"

  return (
    <div className={`border rounded-xl p-4 space-y-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">{local.tier_type}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocal(p => ({ ...p, is_popular: !p.is_popular }))}
            className={`text-xs px-2 py-1 rounded-full font-semibold border transition-colors ${local.is_popular ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-500 border-slate-300"}`}
          >
            {local.is_popular ? "Rekomendasi" : "Tandai Rekomendasi"}
          </button>
          <button
            onClick={() => setLocal(p => ({ ...p, is_active: !p.is_active }))}
            className={`transition-colors ${local.is_active ? "text-emerald-600" : "text-slate-400"}`}
            title={local.is_active ? "Aktif (klik untuk nonaktifkan)" : "Nonaktif (klik untuk aktifkan)"}
          >
            {local.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Label Paket</label>
          <input
            type="text"
            value={local.label}
            onChange={e => setLocal(p => ({ ...p, label: e.target.value }))}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Harga (Rp)</label>
            <input
              type="number"
              value={local.price}
              onChange={e => setLocal(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-white font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Harga Coret</label>
            <input
              type="number"
              value={local.original_price}
              onChange={e => setLocal(p => ({ ...p, original_price: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-white font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Fitur (satu per baris)</label>
          <textarea
            value={featuresText}
            onChange={e => setFeaturesText(e.target.value)}
            rows={5}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            placeholder="Akses Video Materi&#10;Sertifikat Digital&#10;..."
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tidak Termasuk (satu per baris)</label>
          <textarea
            value={excludesText}
            onChange={e => setExcludesText(e.target.value)}
            rows={5}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            placeholder="Tanpa Mentor&#10;Tanpa Career&#10;..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="text-sm font-bold text-slate-700">
          {formatPrice(local.price)}
          {local.original_price > local.price && (
            <span className="ml-2 text-xs text-slate-400 line-through">{formatPrice(local.original_price)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === "success" && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
          {status === "error" && <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Gagal</span>}
          <Button onClick={handleSave} disabled={status === "saving"} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs">
            {status === "saving" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// CURRICULUM EDITOR
// ================================================================
function CurriculumEditor({ items, programId, onRefresh }: { items: MarketingCurriculumItem[]; programId: string; onRefresh: () => void }) {
  const [adding, setAdding] = React.useState(false)
  const [newItem, setNewItem] = React.useState({ title: "", description: "", duration: "" })
  const [deleting, setDeleting] = React.useState<string | null>(null)
  const [addStatus, setAddStatus] = React.useState<SaveStatus>("idle")

  const handleAdd = async () => {
    if (!newItem.title.trim()) return
    setAddStatus("saving")
    const res = await addCurriculumItem({
      programId,
      title: newItem.title,
      description: newItem.description || undefined,
      duration: newItem.duration || undefined,
      sortOrder: items.length + 1,
    })
    if (res.success) {
      setNewItem({ title: "", description: "", duration: "" })
      setAdding(false)
      setAddStatus("idle")
      onRefresh()
    } else {
      setAddStatus("error")
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deleteCurriculumItem(id)
    setDeleting(null)
    onRefresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kurikulum ({items.length} sesi)</h4>
        <Button onClick={() => setAdding(a => !a)} variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" /> Tambah Sesi
        </Button>
      </div>

      {adding && (
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <input
            type="text"
            placeholder="Judul sesi"
            value={newItem.title}
            onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Durasi (mis. 15:30)"
              value={newItem.duration}
              onChange={e => setNewItem(p => ({ ...p, duration: e.target.value }))}
              className="col-span-1 px-2 py-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Deskripsi singkat"
              value={newItem.description}
              onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
              className="col-span-2 px-2 py-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleAdd} disabled={addStatus === "saving" || !newItem.title.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs">
              {addStatus === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
            </Button>
            <Button onClick={() => { setAdding(false); setAddStatus("idle") }} variant="ghost" size="sm" className="h-7 text-xs">Batal</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg group hover:border-slate-200 transition-colors">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500 mt-0.5">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <InlineEdit
                value={item.title}
                onSave={async (v) => { await updateCurriculumItem(item.id, { title: v }); onRefresh() }}
                className="font-semibold text-sm text-slate-800 w-full"
                placeholder="Judul sesi"
              />
              {item.description && (
                <InlineEdit
                  value={item.description}
                  onSave={async (v) => { await updateCurriculumItem(item.id, { description: v }); onRefresh() }}
                  className="text-xs text-slate-500 w-full mt-0.5"
                  placeholder="Deskripsi"
                  multiline
                />
              )}
              {item.duration && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                  <Clock className="w-2.5 h-2.5" /> {item.duration}
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deleting === item.id}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
            >
              {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ))}
        {items.length === 0 && !adding && (
          <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
            Belum ada sesi. Klik "Tambah Sesi" untuk mulai.
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================
// PROGRAM CARD
// ================================================================
function ProgramCard({ program, onRefresh }: { program: MarketingProgram; onRefresh: () => void }) {
  const [expanded, setExpanded] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"info" | "tiers" | "curriculum">("info")
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus program "${program.name}"? Semua paket dan kurikulum akan ikut terhapus.`)) return
    setDeleting(true)
    await deleteMarketingProgram(program.id)
    onRefresh()
  }

  const handleToggleActive = async () => {
    await updateMarketingProgram(program.id, { isActive: !program.is_active })
    onRefresh()
  }

  const tierCount = program.tiers?.length ?? 0
  const curriculumCount = program.curriculum?.length ?? 0

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${program.is_active ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <InlineEdit
              value={program.name}
              onSave={async (v) => { await updateMarketingProgram(program.id, { name: v }); onRefresh() }}
              className="font-bold text-slate-900 text-base"
            />
            {!program.is_active && (
              <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Nonaktif</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.students_count.toLocaleString("id-ID")} alumni</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {program.rating}</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {tierCount} paket</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {curriculumCount} sesi</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleActive}
            className={`p-1.5 rounded-lg transition-colors ${program.is_active ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
            title={program.is_active ? "Nonaktifkan program" : "Aktifkan program"}
          >
            {program.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div>
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-white">
            {(["info", "tiers", "curriculum"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "info" ? "Info Program" : tab === "tiers" ? `Paket Harga (${tierCount})` : `Kurikulum (${curriculumCount})`}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nama Singkat</label>
                    <InlineEdit
                      value={program.short_name}
                      onSave={async (v) => { await updateMarketingProgram(program.id, { shortName: v }); onRefresh() }}
                      className="text-sm text-slate-800 font-medium"
                      placeholder="Contoh: UI/UX Design"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi</label>
                    <InlineEdit
                      value={program.description ?? ""}
                      onSave={async (v) => { await updateMarketingProgram(program.id, { description: v }); onRefresh() }}
                      className="text-sm text-slate-600"
                      multiline
                      placeholder="Deskripsi program..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Jumlah Sesi", key: "sessions_count", field: "sessionsCount" },
                    { label: "Jumlah Modul", key: "modules_count", field: "modulesCount" },
                    { label: "Rating", key: "rating", field: "rating" },
                    { label: "Jumlah Alumni", key: "students_count", field: "studentsCount" },
                  ].map(({ label, key, field }) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                      <InlineEdit
                        value={String((program as any)[key] ?? "")}
                        onSave={async (v) => {
                          await updateMarketingProgram(program.id, { [field]: parseFloat(v) || 0 } as any)
                          onRefresh()
                        }}
                        className="text-sm text-slate-800 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tiers Tab */}
            {activeTab === "tiers" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {(["junior", "expert", "bootcamp"] as const).map(tierType => {
                  const existing = program.tiers?.find(t => t.tier_type === tierType)
                  const tier: MarketingProgramTier = existing ?? {
                    id: "",
                    program_id: program.id,
                    tier_type: tierType,
                    label: TIER_LABELS[tierType],
                    price: 0,
                    original_price: 0,
                    is_popular: tierType === "bootcamp",
                    is_active: true,
                    sort_order: tierType === "junior" ? 1 : tierType === "expert" ? 2 : 3,
                    features: [],
                    excludes: [],
                  }
                  return <TierEditor key={tierType} tier={tier} programId={program.id} onRefresh={onRefresh} />
                })}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <CurriculumEditor items={program.curriculum ?? []} programId={program.id} onRefresh={onRefresh} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================================
// ADD PROGRAM MODAL
// ================================================================
function AddProgramModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    slug: "", name: "", shortName: "", description: "",
    sessionsCount: 0, modulesCount: 0, rating: 5.0, studentsCount: 0,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSubmit = async () => {
    if (!form.slug.trim() || !form.name.trim() || !form.shortName.trim()) {
      setError("Slug, Nama, dan Nama Singkat wajib diisi.")
      return
    }
    setSaving(true)
    setError(null)
    const res = await createMarketingProgram(form)
    if (res.success) {
      onCreated()
      onClose()
    } else {
      setError(res.error ?? "Gagal menyimpan.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Program Baru</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Slug (unik, tanpa spasi)", key: "slug", placeholder: "mis. ui-ux" },
              { label: "Nama Singkat", key: "shortName", placeholder: "mis. UI/UX Design" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                <input type="text" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nama Lengkap Program</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="mis. UI/UX Research & Design"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              placeholder="Deskripsi singkat program..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Sesi", key: "sessionsCount" },
              { label: "Modul", key: "modulesCount" },
              { label: "Rating", key: "rating" },
              { label: "Alumni", key: "studentsCount" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                <input type="number" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" className="text-slate-600">Batal</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Buat Program"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function MarketingProgramsPage() {
  const [programs, setPrograms] = React.useState<MarketingProgram[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAddModal, setShowAddModal] = React.useState(false)

  const fetchPrograms = React.useCallback(async () => {
    const data = await getAllMarketingPrograms()
    setPrograms(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => { fetchPrograms() }, [fetchPrograms])

  return (
    <>
      {showAddModal && (
        <AddProgramModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchPrograms}
        />
      )}
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Program & Paket Harga</h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola program, paket harga (junior/expert/bootcamp), dan kurikulum yang tampil di halaman publik.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Program Baru
          </Button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <div>
            <strong>Tips:</strong> Klik teks untuk mengedit langsung. Perubahan disimpan per bagian.
            Klik chevron di kanan untuk membuka detail program, lalu pilih tab Info, Paket Harga, atau Kurikulum.
          </div>
        </div>

        {/* Program List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600 mb-1">Belum ada program</p>
            <p className="text-sm text-slate-400 mb-4">Buat program pertama untuk mulai mengisi halaman marketing.</p>
            <Button onClick={() => setShowAddModal(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Buat Program
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map(program => (
              <ProgramCard key={program.id} program={program} onRefresh={fetchPrograms} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
