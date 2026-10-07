"use client"

import * as React from "react"
import { Key, Users, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { grantVideoAccess } from "../actions"
import { programs } from "@/components/marketing/data/marketing-data"

export default function ManualAccessPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = React.useState(true)
  
  const [selectedOrderStr, setSelectedOrderStr] = React.useState("")
  const [expiresAt, setExpiresAt] = React.useState("")
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" })

  React.useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('checkout_orders')
        .select(`
          id,
          user_id,
          program_id,
          program_name,
          tier_type,
          users!checkout_orders_user_id_fkey(full_name, email)
        `)
        .in('status', ['paid', 'confirmed'])
        .order('created_at', { ascending: false })
      
      if (data) {
        // Filter out those who already have access_granted? We don't have access_granted in the select, let's assume they all show up.
        setOrders(data)
      }
      setLoadingOrders(false)
    }
    fetchOrders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderStr) {
      setStatus({ type: "error", message: "Harap pilih pesanan." })
      return
    }

    const order = JSON.parse(selectedOrderStr);

    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    const result = await grantVideoAccess({
      userId: order.user_id,
      programId: order.program_id,
      tier: order.tier_type,
      orderId: order.id,
      notes: "Diberikan secara manual oleh Admin melalui form",
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    })

    if (result.success) {
      setStatus({ type: "success", message: "Akses video berhasil diberikan!" })
      setSelectedOrderStr("")
      setExpiresAt("")
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

          {/* Order Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Pilih Pesanan Lunas
            </label>
            <select
              value={selectedOrderStr}
              onChange={(e) => setSelectedOrderStr(e.target.value)}
              disabled={loadingOrders}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{loadingOrders ? "Memuat data pesanan..." : "-- Pilih Pesanan Lunas --"}</option>
              {orders.map(o => {
                // Determine user full name safely
                const userName = Array.isArray(o.users) 
                  ? o.users[0]?.full_name 
                  : (o.users?.full_name ?? 'Tanpa Nama');

                return (
                  <option key={o.id} value={JSON.stringify(o)}>
                    {userName} - {o.program_name} ({o.tier_type.toUpperCase()})
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              Hanya menampilkan pesanan yang statusnya sudah Lunas atau Dikonfirmasi.
            </p>
          </div>

          {/* Expiry Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
              Batas Waktu Akses (Opsional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Jika diisi, akses video akan otomatis ditutup setelah melewati tanggal ini. Kosongkan jika akses selamanya.
            </p>
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
