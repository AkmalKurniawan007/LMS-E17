"use client"

import * as React from "react"
import {
  BookOpen, Loader2, Save, Trash2, Plus, ChevronDown, ChevronUp,
  Check, X, GripVertical, Edit2, AlertCircle, CheckCircle2, Package,
  ToggleLeft, ToggleRight, Users, Clock, Star, Video, PlayCircle
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
  getAllLmsPrograms,
  type MarketingProgram,
  type MarketingProgramTier,
  type MarketingCurriculumItem,
} from "../program-actions"

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

const TIER_LABELS: Record<string, string> = {
  junior: "Junior (Video Only)",
  expert: "Expert (Video Only)",
  complete: "Bootcamp Lengkap",
}

const TIER_COLORS: Record<string, string> = {
  junior: "bg-sky-50 border-sky-200 text-sky-700",
  expert: "bg-violet-50 border-violet-200 text-violet-700",
  complete: "bg-orange-50 border-orange-200 text-orange-700",
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
function TiersEditor({ tiers, programId, onRefresh }: { tiers: MarketingProgramTier[]; programId: string; onRefresh: () => void }) {
  const [localTiers, setLocalTiers] = React.useState(tiers)
  const [status, setStatus] = React.useState<SaveStatus>("idle")

  React.useEffect(() => {
    setLocalTiers(tiers)
  }, [tiers])

  const handleTierChange = (idx: number, field: keyof MarketingProgramTier, value: any) => {
    const newTiers = [...localTiers]
    newTiers[idx] = { ...newTiers[idx], [field]: value }
    setLocalTiers(newTiers)
  }

  const handleListChange = (tierIdx: number, field: 'features' | 'excludes', itemIdx: number, value: string) => {
    const newTiers = [...localTiers]
    const currentVal = newTiers[tierIdx][field] as any
    let arr = Array.isArray(currentVal) ? [...currentVal] : (typeof currentVal === 'string' ? currentVal.split('\n') : [])
    arr[itemIdx] = value
    newTiers[tierIdx] = { ...newTiers[tierIdx], [field]: arr }
    setLocalTiers(newTiers)
  }

  const addListItem = (tierIdx: number, field: 'features' | 'excludes') => {
    const newTiers = [...localTiers]
    const currentVal = newTiers[tierIdx][field] as any
    let arr = Array.isArray(currentVal) ? [...currentVal] : (typeof currentVal === 'string' ? currentVal.split('\n').filter(Boolean) : [])
    arr.push("")
    newTiers[tierIdx] = { ...newTiers[tierIdx], [field]: arr }
    setLocalTiers(newTiers)
  }

  const removeListItem = (tierIdx: number, field: 'features' | 'excludes', itemIdx: number) => {
    const newTiers = [...localTiers]
    const currentVal = newTiers[tierIdx][field] as any
    let arr = Array.isArray(currentVal) ? [...currentVal] : (typeof currentVal === 'string' ? currentVal.split('\n').filter(Boolean) : [])
    arr.splice(itemIdx, 1)
    newTiers[tierIdx] = { ...newTiers[tierIdx], [field]: arr }
    setLocalTiers(newTiers)
  }

  const handleSaveAll = async () => {
    setStatus("saving")
    let hasError = false
    for (const local of localTiers) {
      const res = await upsertMarketingTier({
        programId,
        tierType: local.tier_type,
        label: local.label,
        price: local.price,
        originalPrice: local.original_price,
        isPopular: local.is_popular,
        isActive: local.is_active,
        sortOrder: local.sort_order,
        features: Array.isArray(local.features) ? local.features.map(s => s.trim()).filter(Boolean) : (local.features as string).split("\n").map(s => s.trim()).filter(Boolean),
        excludes: Array.isArray(local.excludes) ? local.excludes.map(s => s.trim()).filter(Boolean) : (local.excludes as string).split("\n").map(s => s.trim()).filter(Boolean),
      })
      if (!res.success) hasError = true
    }
    
    setStatus(hasError ? "error" : "success")
    if (!hasError) {
      setTimeout(() => setStatus("idle"), 2500)
      onRefresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={status === "saving"} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs">
          {status === "saving" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          {status === "success" ? "Tersimpan" : "Simpan Semua Paket"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {localTiers.map((local, idx) => {
          const colorClass = TIER_COLORS[local.tier_type] ?? "bg-slate-50 border-slate-200 text-slate-700"
          const featuresArr = Array.isArray(local.features) ? local.features : (typeof local.features === 'string' ? (local.features as any).split('\n').filter(Boolean) : [])
          const excludesArr = Array.isArray(local.excludes) ? local.excludes : (typeof local.excludes === 'string' ? (local.excludes as any).split('\n').filter(Boolean) : [])
          
          return (
            <div key={local.tier_type} className={`border rounded-xl p-5 space-y-5 shadow-sm transition-all ${colorClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <span className="text-sm font-black uppercase tracking-wider">{local.tier_type === 'complete' ? 'bootcamp' : local.tier_type}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTierChange(idx, "is_popular", !local.is_popular)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border transition-all ${local.is_popular ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"}`}
                  >
                    {local.is_popular ? "Rekomendasi" : "Tandai Rekomendasi"}
                  </button>
                  <button
                    onClick={() => handleTierChange(idx, "is_active", !local.is_active)}
                    className={`transition-colors ${local.is_active ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}
                    title={local.is_active ? "Aktif (klik untuk nonaktifkan)" : "Nonaktif (klik untuk aktifkan)"}
                  >
                    {local.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Label Paket</label>
                  <input
                    type="text"
                    value={local.label}
                    onChange={e => handleTierChange(idx, "label", e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Harga (Rp)</label>
                    <input
                      type="number"
                      value={local.price}
                      onChange={e => handleTierChange(idx, "price", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-mono shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Harga Coret (Rp)</label>
                    <input
                      type="number"
                      value={local.original_price}
                      onChange={e => handleTierChange(idx, "original_price", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-mono shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Fitur Termasuk ({featuresArr.length})</label>
                  {featuresArr.map((feat: string, fIdx: number) => (
                    <div key={fIdx} className="flex gap-2 items-center">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0">{fIdx + 1}</div>
                      <input
                        type="text"
                        value={feat}
                        onChange={e => handleListChange(idx, "features", fIdx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition-all"
                        placeholder="Contoh: Akses Video Materi..."
                      />
                      <button onClick={() => removeListItem(idx, "features", fIdx)} className="text-slate-400 hover:text-red-500 p-1 bg-white rounded-md border border-slate-100 hover:border-red-200 transition-colors shadow-sm" title="Hapus Fitur"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => addListItem(idx, "features")} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1 hover:text-emerald-700 px-2 py-1 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"><Plus className="w-3 h-3" /> Tambah Fitur</button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-3 h-3 text-red-400" /> Tidak Termasuk ({excludesArr.length})</label>
                  {excludesArr.map((exc: string, eIdx: number) => (
                    <div key={eIdx} className="flex gap-2 items-center">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-700 shrink-0">{eIdx + 1}</div>
                      <input
                        type="text"
                        value={exc}
                        onChange={e => handleListChange(idx, "excludes", eIdx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none transition-all"
                        placeholder="Contoh: Bimbingan Mentor..."
                      />
                      <button onClick={() => removeListItem(idx, "excludes", eIdx)} className="text-slate-400 hover:text-red-500 p-1 bg-white rounded-md border border-slate-100 hover:border-red-200 transition-colors shadow-sm" title="Hapus Pengecualian"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => addListItem(idx, "excludes")} className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 hover:text-red-600 px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"><Plus className="w-3 h-3" /> Tambah Pengecualian</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ================================================================
// CURRICULUM EDITOR
// ================================================================
function CurriculumEditor({ items, programId, onRefresh }: { items: MarketingCurriculumItem[]; programId: string; onRefresh: () => void }) {
  const [adding, setAdding] = React.useState(false)
  const [newItem, setNewItem] = React.useState({ title: "", description: "", duration: "", videoUrl: "", previewVideoUrl: "", accessTiers: ["junior", "expert", "bootcamp"] })
  const [deleting, setDeleting] = React.useState<string | null>(null)
  const [addStatus, setAddStatus] = React.useState<SaveStatus>("idle")
  
  const [localItems, setLocalItems] = React.useState(items)
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle")

  React.useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleItemChange = (idx: number, field: keyof MarketingCurriculumItem, value: any) => {
    const newItems = [...localItems]
    newItems[idx] = { ...newItems[idx], [field]: value }
    setLocalItems(newItems)
  }

  const handleSaveAll = async () => {
    setSaveStatus("saving")
    try {
      await Promise.all(localItems.map(item => updateCurriculumItem(item.id, {
        title: item.title,
        description: item.description ?? undefined,
        duration: item.duration ?? undefined,
        videoUrl: item.video_url ?? undefined,
        previewVideoUrl: item.preview_video_url ?? undefined,
        accessTiers: item.access_tiers ?? undefined,
      })))
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 2500)
      onRefresh()
    } catch (e) {
      setSaveStatus("error")
    }
  }

  const handleAdd = async () => {
    if (!newItem.title.trim()) return
    setAddStatus("saving")
    const res = await addCurriculumItem({
      programId,
      title: newItem.title,
      description: newItem.description || undefined,
      duration: newItem.duration || undefined,
      videoUrl: newItem.videoUrl || undefined,
      previewVideoUrl: newItem.previewVideoUrl || undefined,
      sortOrder: items.length + 1,
      accessTiers: newItem.accessTiers,
    })
    if (res.success) {
      setNewItem({ title: "", description: "", duration: "", videoUrl: "", previewVideoUrl: "", accessTiers: ["junior", "expert", "bootcamp"] })
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kurikulum ({items.length} sesi)</h4>
        <div className="flex items-center gap-2">
          {localItems.length > 0 && (
            <Button onClick={handleSaveAll} disabled={saveStatus === "saving"} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs px-4 shadow-sm">
              {saveStatus === "saving" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              {saveStatus === "success" ? "Tersimpan" : "Simpan Semua Perubahan"}
            </Button>
          )}
          <Button onClick={() => setAdding(a => !a)} variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-300 shadow-sm">
            <Plus className="w-3 h-3" /> Tambah Sesi
          </Button>
        </div>
      </div>

      {adding && (
        <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/50 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Plus className="w-4 h-4" /></div>
            <h5 className="font-semibold text-sm text-blue-900">Sesi Baru</h5>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Judul Sesi</label>
            <input
              type="text"
              placeholder="Contoh: Pengenalan Platform..."
              value={newItem.title}
              onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Durasi</label>
              <input
                type="text"
                placeholder="Mis. 15:30"
                value={newItem.duration}
                onChange={e => setNewItem(p => ({ ...p, duration: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi Singkat</label>
              <input
                type="text"
                placeholder="Penjelasan singkat materi ini..."
                value={newItem.description}
                onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
              />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">URL Video Materi</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/..."
                  value={newItem.videoUrl}
                  onChange={e => setNewItem(p => ({ ...p, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">URL Video Preview</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/..."
                  value={newItem.previewVideoUrl}
                  onChange={e => setNewItem(p => ({ ...p, previewVideoUrl: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center">Akses Paket:</span>
            {["junior", "expert", "bootcamp"].map(tier => (
              <label key={tier} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={newItem.accessTiers.includes(tier)}
                  onChange={e => {
                    setNewItem(p => ({
                      ...p,
                      accessTiers: e.target.checked 
                        ? [...p.accessTiers, tier] 
                        : p.accessTiers.filter(t => t !== tier)
                    }))
                  }}
                  className="rounded w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="capitalize font-medium text-slate-700">{tier}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t border-blue-100">
            <Button onClick={handleAdd} disabled={addStatus === "saving" || !newItem.title.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs shadow-sm">
              {addStatus === "saving" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
              Simpan Sesi Baru
            </Button>
            <Button onClick={() => { setAdding(false); setAddStatus("idle") }} variant="outline" size="sm" className="h-8 text-xs border-slate-300">Batal</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {localItems.map((item, idx) => (
          <div key={item.id} className="flex items-start gap-4 p-5 bg-slate-50/50 border border-slate-200 rounded-xl group transition-all hover:border-blue-300 hover:shadow-md">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500 shadow-sm">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Judul Sesi</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => handleItemChange(idx, "title", e.target.value)}
                    className="w-full px-3 py-2 font-semibold text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                    placeholder="Judul sesi"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Durasi</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={item.duration || ""}
                      onChange={e => handleItemChange(idx, "duration", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      placeholder="Mis. 15:00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={item.description || ""}
                  onChange={e => handleItemChange(idx, "description", e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                  placeholder="Deskripsi sesi"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Video Full URL</label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={item.video_url || ""}
                      onChange={e => handleItemChange(idx, "video_url", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs text-blue-600 font-mono border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Preview Video URL</label>
                  <div className="relative">
                    <PlayCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={item.preview_video_url || ""}
                      onChange={e => handleItemChange(idx, "preview_video_url", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs text-emerald-600 font-mono border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Akses Paket:</span>
                <div className="flex gap-4">
                  {["junior", "expert", "bootcamp"].map(tier => {
                    const itemAccessTiers = item.access_tiers || ["junior", "expert", "bootcamp"];
                    return (
                      <label key={tier} className="flex items-center gap-1.5 text-sm cursor-pointer text-slate-700 select-none">
                        <input 
                          type="checkbox" 
                          checked={itemAccessTiers.includes(tier)}
                          onChange={(e) => {
                            const newTiers = e.target.checked 
                              ? [...itemAccessTiers, tier] 
                              : itemAccessTiers.filter(t => t !== tier);
                            handleItemChange(idx, "access_tiers", newTiers)
                          }}
                          className="rounded w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="capitalize font-medium">{tier}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deleting === item.id}
              className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus sesi"
            >
              {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ))}
        {localItems.length === 0 && !adding && (
          <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            Belum ada sesi kurikulum. Klik "Tambah Sesi" untuk mulai menambahkan materi.
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================
// PROGRAM CARD
// ================================================================
function ProgramCard({ program, lmsPrograms, onRefresh }: { program: MarketingProgram; lmsPrograms: {id: string, name: string}[]; onRefresh: () => void }) {
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
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mapping Program LMS</label>
                    <div className="relative">
                      <select
                        value={program.lms_program_id || ""}
                        onChange={async (e) => {
                          const val = e.target.value;
                          await updateMarketingProgram(program.id, { lmsProgramId: val || null });
                          onRefresh();
                        }}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">-- Belum Dipetakan (Pilih Program LMS) --</option>
                        {lmsPrograms.map((lp) => (
                          <option key={lp.id} value={lp.id}>{lp.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Pilih program LMS mana yang akan dibuka aksesnya ketika user membeli paket bootcamp.
                    </p>
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
              <TiersEditor 
                tiers={(["junior", "expert", "complete"] as const).map(tierType => {
                  const existing = program.tiers?.find(t => t.tier_type === tierType)
                  return existing ?? {
                    id: "",
                    program_id: program.id,
                    tier_type: tierType,
                    label: TIER_LABELS[tierType],
                    price: 0,
                    original_price: 0,
                    is_popular: tierType === "complete",
                    is_active: true,
                    sort_order: tierType === "junior" ? 1 : tierType === "expert" ? 2 : 3,
                    features: [],
                    excludes: [],
                  }
                })} 
                programId={program.id} 
                onRefresh={onRefresh} 
              />
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

  // Auto-generate slug and short name when typing full name (if they are empty or derived)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm(prev => {
      const updates = { ...prev, name: newName };
      // Only auto-update slug if it was empty or matched the old name's slug
      const oldSlug = prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!prev.slug || prev.slug === oldSlug) {
        updates.slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      // Only auto-update shortName if it was empty or matched the old name
      if (!prev.shortName || prev.shortName === prev.name) {
        updates.shortName = newName;
      }
      return updates;
    });
  }

  const handleSubmit = async () => {
    if (!form.slug.trim() || !form.name.trim() || !form.shortName.trim()) {
      setError("Slug, Nama Program, dan Nama Singkat wajib diisi.")
      return
    }
    
    setSaving(true)
    setError(null)
    const res = await createMarketingProgram({
      name: form.name,
      description: form.description,
      slug: form.slug,
      shortName: form.shortName,
      sessionsCount: form.sessionsCount,
      modulesCount: form.modulesCount,
      rating: form.rating,
      studentsCount: form.studentsCount,
    })
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Program Baru</h2>
            <p className="text-sm text-slate-500 mt-1">Lengkapi informasi dasar untuk membuat program.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 grow">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 flex items-start gap-3 rounded-r-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Section 1: Identitas Utama */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Identitas Program
            </h3>
            
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Nama Lengkap Program <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={handleNameChange} placeholder="mis. Fullstack Web Development Bootamp"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Nama Singkat <span className="text-red-500">*</span></label>
                <input type="text" value={form.shortName} onChange={e => setForm(p => ({ ...p, shortName: e.target.value }))} placeholder="mis. Fullstack Web"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                <p className="text-[10px] text-slate-500 mt-1.5">Untuk tampilan UI yang sempit (Tab/Tombol).</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">URL Slug <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm font-mono whitespace-nowrap">/program/</span>
                  <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="fullstack-web"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-blue-400 focus:outline-none font-mono" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Deskripsi Singkat</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                placeholder="Tuliskan 1-2 kalimat menarik tentang program ini..."
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none leading-relaxed" />
            </div>
          </div>

          {/* Section 2: Angka & Statistik */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs">2</span>
              Statistik Informasi
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {[
                { label: "Jumlah Sesi", key: "sessionsCount", step: 1 },
                { label: "Total Modul", key: "modulesCount", step: 1 },
                { label: "Rating Bintang", key: "rating", step: 0.1 },
                { label: "Total Alumni", key: "studentsCount", step: 1 },
              ].map(({ label, key, step }) => (
                <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">{label}</label>
                  <input type="number" step={step} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-lg font-extrabold text-slate-900 bg-slate-50 border-none rounded focus:ring-2 focus:ring-blue-400 text-center" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
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
  const [lmsPrograms, setLmsPrograms] = React.useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAddModal, setShowAddModal] = React.useState(false)

  const fetchPrograms = React.useCallback(async () => {
    const [data, lmsData] = await Promise.all([
      getAllMarketingPrograms(),
      getAllLmsPrograms(),
    ])
    setPrograms(data)
    setLmsPrograms(lmsData)
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
              <ProgramCard key={program.id} program={program} lmsPrograms={lmsPrograms} onRefresh={fetchPrograms} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
