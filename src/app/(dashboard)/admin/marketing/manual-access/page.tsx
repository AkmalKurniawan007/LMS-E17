"use client"

import * as React from "react"
import { Key, Users, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { grantVideoAccess } from "../actions"
import { programs } from "@/components/marketing/data/marketing-data"

export default function ManualAccessPage() {
  const [users, setUsers] = React.useState<{ id: string; full_name: string; email: string }[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(true)
  
  const [selectedUser, setSelectedUser] = React.useState("")
  const [selectedProgram, setSelectedProgram] = React.useState("")
  const [selectedTier, setSelectedTier] = React.useState<"junior" | "expert">("junior")
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" })

  React.useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })
      
      if (data) setUsers(data)
      setLoadingUsers(false)
    }
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !selectedProgram || !selectedTier) {
      setStatus({ type: "error", message: "Harap lengkapi semua field." })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    const result = await grantVideoAccess({
      userId: selectedUser,
      programId: selectedProgram,
      tier: selectedTier,
      notes: "Diberikan secara manual oleh Admin",
    })

    if (result.success) {
      setStatus({ type: "success", message: "Akses video berhasil diberikan!" })
      setSelectedUser("")
      setSelectedProgram("")
    } else {
      setStatus({ type: "error", message: result.error || "Gagal memberikan akses." })
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Akses Manual Video</h1>
        <p className="text-slate-500 text-sm mt-1">
          Berikan akses video materi (Junior/Expert) secara manual kepada siswa tanpa melalui proses checkout/pembayaran.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Form Pemberian Akses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pilih siswa dan program yang akan diberikan akses</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Message */}
          {status.type === "success" && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-800">Berhasil!</h3>
                <p className="text-xs text-emerald-700 mt-1">{status.message}</p>
              </div>
            </div>
          )}
          {status.type === "error" && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Gagal!</h3>
                <p className="text-xs text-red-700 mt-1">{status.message}</p>
              </div>
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Pilih Siswa
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loadingUsers}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{loadingUsers ? "Memuat data siswa..." : "-- Pilih Siswa --"}</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
              <Video className="w-3.5 h-3.5" /> Program Marketing
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">-- Pilih Program --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Tier / Level Akses
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTier("junior")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTier === "junior" 
                    ? "bg-sky-50 border-sky-300 ring-2 ring-sky-500/20 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-bold ${selectedTier === "junior" ? "text-sky-900" : "text-slate-700"}`}>Junior Tier</p>
                  {selectedTier === "junior" && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Akses ke materi video dasar (basic). Tidak termasuk video expert.</p>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedTier("expert")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTier === "expert" 
                    ? "bg-violet-50 border-violet-300 ring-2 ring-violet-500/20 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-bold ${selectedTier === "expert" ? "text-violet-900" : "text-slate-700"}`}>Expert Tier</p>
                  {selectedTier === "expert" && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Akses ke seluruh materi video dasar dan tingkat mahir (expert).</p>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white min-w-[150px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Memproses..." : "Berikan Akses"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
