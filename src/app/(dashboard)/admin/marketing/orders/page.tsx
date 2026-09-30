"use client"

import * as React from "react"
import {
  ShoppingCart, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
  Loader2, ChevronDown, Filter, Search, Edit2, Video, Key, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  grantVideoAccess,
  getPaymentProofUrl,
  type CheckoutOrder,
} from "../actions"
import { programs } from "@/components/marketing/data/marketing-data"

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Menunggu",       color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: "Dikonfirmasi",   color: "bg-blue-50 text-blue-700 border-blue-200",      icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  paid:      { label: "Lunas",          color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: "Dibatalkan",     color: "bg-red-50 text-red-700 border-red-200",         icon: <XCircle className="w-3.5 h-3.5" /> },
  refunded:  { label: "Refund",         color: "bg-slate-50 text-slate-600 border-slate-200",   icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

const TIER_BADGE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  junior:    { label: "Junior (Video)",    color: "bg-sky-50 text-sky-700 border-sky-200",       icon: <Video className="w-3 h-3" /> },
  expert:    { label: "Expert (Video)",    color: "bg-violet-50 text-violet-700 border-violet-200", icon: <Video className="w-3 h-3" /> },
  bootcamp:  { label: "Bootcamp Lengkap", color: "bg-orange-50 text-orange-700 border-orange-200", icon: <Users className="w-3 h-3" /> },
}

// ================================================================
// ORDER DETAIL + GRANT ACCESS MODAL
// ================================================================
function OrderModal({
  order,
  onClose,
  onRefresh,
}: {
  order: CheckoutOrder
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const [status, setStatus] = React.useState(order.status)
  const [adminNotes, setAdminNotes] = React.useState(order.admin_notes ?? "")
  const [isSaving, setIsSaving] = React.useState(false)
  const [isGranting, setIsGranting] = React.useState(false)
  const [grantError, setGrantError] = React.useState<string | null>(null)
  const [grantSuccess, setGrantSuccess] = React.useState(false)
  const [proofUrl, setProofUrl] = React.useState<string | null>(null)
  const [loadingProof, setLoadingProof] = React.useState(false)

  const isVideoTier = order.tier_type === "junior" || order.tier_type === "expert"
  const isBootcamp  = order.tier_type === "bootcamp"
  const tierMeta    = TIER_BADGE[order.tier_type] ?? TIER_BADGE.bootcamp
  const isAlreadyGranted = (order as any).access_granted === true

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  React.useEffect(() => {
    if (order.payment_proof_path) {
      setLoadingProof(true)
      getPaymentProofUrl(order.payment_proof_path)
        .then(url => setProofUrl(url))
        .finally(() => setLoadingProof(false))
    }
  }, [order.payment_proof_path])

  const handleSaveStatus = async () => {
    setIsSaving(true)
    await updateOrderStatus(order.id, status, adminNotes)
    await onRefresh()
    setIsSaving(false)
    onClose()
  }

  const handleGrantVideoAccess = async () => {
    if (!order.user_id) {
      setGrantError("User ID tidak ditemukan pada order ini.")
      return
    }
    setIsGranting(true)
    setGrantError(null)
    const result = await grantVideoAccess({
      userId: order.user_id,
      programId: order.program_id,
      tier: order.tier_type as "junior" | "expert",
      orderId: order.id,
      notes: `Dikonfirmasi dari order ${order.id}`,
    })
    if (result.success) {
      setGrantSuccess(true)
      await onRefresh()
    } else {
      setGrantError(result.error ?? "Gagal memberikan akses.")
    }
    setIsGranting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">Order ID</p>
            <p className="text-white font-bold text-sm truncate max-w-[340px]">{order.id}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tierMeta.color} shrink-0 ml-3`}>
            {tierMeta.icon} {tierMeta.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Pemesan */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pemesan</p>
            <p className="font-semibold text-slate-900">{order.users?.full_name ?? "Tidak diketahui"}</p>
            <p className="text-sm text-slate-500">{order.users?.email ?? "-"}</p>
          </div>

          {/* Program */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Detail Pembelian</p>
            <p className="font-bold text-slate-900">{order.program_name}</p>
            <p className="text-sm text-slate-600 mt-0.5">Paket: {order.tier_label}</p>
            <p className="text-sm text-slate-500 mt-0.5">Metode: {order.payment_method}</p>
            <p className="text-xl font-extrabold text-slate-900 mt-3">{formatPrice(order.amount)}</p>
          </div>

          {/* PAYMENT PROOF — if uploaded */}
          {order.payment_proof_path && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Bukti Pembayaran</p>
              {loadingProof ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : proofUrl ? (
                <div className="space-y-2">
                  <img src={proofUrl} alt="Bukti Pembayaran" className="w-full rounded-lg border border-slate-200" />
                  <p className="text-xs text-slate-500">
                    Diunggah: {order.payment_proof_uploaded_at ? new Date(order.payment_proof_uploaded_at).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-600">Gagal memuat bukti pembayaran.</p>
              )}
            </div>
          )}

          {/* GRANT VIDEO ACCESS — Junior / Expert */}
          {isVideoTier && (
            <div className={`rounded-xl p-4 border-2 ${isAlreadyGranted || grantSuccess ? "border-emerald-200 bg-emerald-50" : "border-sky-200 bg-sky-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Key className={`w-4 h-4 ${isAlreadyGranted || grantSuccess ? "text-emerald-600" : "text-sky-600"}`} />
                <p className="text-sm font-bold text-slate-900">Akses Video</p>
              </div>

              {isAlreadyGranted || grantSuccess ? (
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Akses video sudah diberikan
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 mb-3">
                    Klik tombol di bawah untuk memberikan akses video {order.tier_label} program{" "}
                    <strong>{order.program_name}</strong> ke user ini.
                    Status order akan otomatis berubah menjadi <strong>Lunas</strong>.
                  </p>
                  {grantError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                      {grantError}
                    </p>
                  )}
                  <Button
                    onClick={handleGrantVideoAccess}
                    disabled={isGranting}
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold w-full"
                  >
                    {isGranting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Berikan Akses Video Sekarang
                  </Button>
                </>
              )}
            </div>
          )}

          {/* BOOTCAMP INFO */}
          {isBootcamp && (
            <div className="rounded-xl p-4 border-2 border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-bold text-slate-900">Akses Bootcamp + LMS</p>
              </div>
              <p className="text-xs text-slate-600">
                Setelah konfirmasi pembayaran, tambahkan siswa ini ke <strong>Batch</strong> yang sesuai
                melalui menu <strong>Manajemen Batch</strong> agar mereka bisa masuk LMS penuh.
              </p>
            </div>
          )}

          {/* Status Update */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Ubah Status Order
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Catatan Admin
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="Catatan internal..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>Batal</Button>
          <Button
            size="sm"
            onClick={handleSaveStatus}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Simpan Status
          </Button>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// STAT CARD
// ================================================================
function StatCard({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<CheckoutOrder[]>([])
  const [stats, setStats] = React.useState({ pending: 0, confirmed: 0, paid: 0, cancelled: 0, totalRevenue: 0 })
  const [isLoading, setIsLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState("")
  const [filterTier, setFilterTier] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [selectedOrder, setSelectedOrder] = React.useState<CheckoutOrder | null>(null)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const [ordersData, statsData] = await Promise.all([
      getAllOrders(filterStatus ? { status: filterStatus } : undefined),
      getOrderStats(),
    ])
    setOrders(ordersData)
    setStats(statsData)
    setIsLoading(false)
  }, [filterStatus])

  React.useEffect(() => { loadData() }, [loadData])

  const filteredOrders = orders.filter((o) => {
    const matchTier = !filterTier || o.tier_type === filterTier
    if (!matchTier) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.program_name.toLowerCase().includes(q) ||
      o.users?.full_name?.toLowerCase().includes(q) ||
      o.users?.email?.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Pendaftaran</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola order masuk. Untuk tier <strong>Junior/Expert</strong>: konfirmasi lalu klik "Berikan Akses Video".
          Untuk <strong>Bootcamp</strong>: konfirmasi lalu enroll ke batch di menu Manajemen Batch.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Menunggu" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
        <StatCard label="Dikonfirmasi" value={stats.confirmed} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Lunas" value={stats.paid} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Dibatalkan" value={stats.cancelled} icon={<XCircle className="w-5 h-5" />} color="bg-red-50 text-red-600" />
        <div className="col-span-2 lg:col-span-1 bg-slate-900 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-white">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Pendapatan</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-40 pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="w-full sm:w-44 px-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Semua Tier</option>
            <option value="junior">Junior (Video)</option>
            <option value="expert">Expert (Video)</option>
            <option value="bootcamp">Bootcamp</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm font-medium">Belum ada order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Pemesan</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Program</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Akses</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusMeta = STATUS_MAP[order.status] ?? STATUS_MAP.pending
                  const tierMeta = TIER_BADGE[order.tier_type] ?? TIER_BADGE.bootcamp
                  const isVideoTier = order.tier_type === "junior" || order.tier_type === "expert"
                  const isGranted = (order as any).access_granted === true

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{order.users?.full_name ?? "Tamu"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{order.users?.email ?? "-"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{order.program_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tierMeta.color}`}>
                          {tierMeta.icon} {tierMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">{formatPrice(order.amount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                          {statusMeta.icon} {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isVideoTier ? (
                          isGranted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <Clock className="w-3.5 h-3.5" /> Belum
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">Via Batch</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat & Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}
