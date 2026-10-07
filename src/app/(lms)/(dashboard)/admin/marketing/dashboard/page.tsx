"use client"

import * as React from "react"
import { TrendingUp, Clock, CheckCircle2, XCircle, ShoppingCart, Globe } from "lucide-react"
import { getOrderStats } from "../actions"
import Link from "next/link"

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

function StatCard({ label, value, icon, color, subtext }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; subtext?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        {subtext && <div className="mt-1 text-[10px] font-medium text-slate-400">{subtext}</div>}
      </div>
    </div>
  )
}

export default function MarketingDashboardPage() {
  const [stats, setStats] = React.useState({ pending: 0, confirmed: 0, paid: 0, cancelled: 0, totalRevenue: 0, pageViews: 0, guestViews: 0, loggedInViews: 0 })
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    getOrderStats().then((data) => {
      setStats(data as any)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Marketing</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ringkasan performa penjualan dan konversi dari web marketing E17 Course.
        </p>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-slate-500 text-sm font-medium">
          Memuat data statistik...
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              label="Pengunjung Web" 
              value={stats.pageViews} 
              icon={<Globe className="w-5 h-5" />} 
              color="bg-indigo-50 text-indigo-600" 
              subtext={<span className="flex items-center gap-1.5"><span className="text-indigo-500 font-bold">{stats.loggedInViews}</span> Login &bull; <span className="text-slate-500 font-bold">{stats.guestViews}</span> Guest</span>}
            />
            <StatCard label="Menunggu Bayar" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
            <StatCard label="Dikonfirmasi" value={stats.confirmed} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
            <StatCard label="Lunas (Berhasil)" value={stats.paid} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Dibatalkan" value={stats.cancelled} icon={<XCircle className="w-5 h-5" />} color="bg-red-50 text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-32 h-32 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 mb-6">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white tracking-wide uppercase">Total Pendapatan</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                  {formatPrice(stats.totalRevenue)}
                </h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  Akumulasi dari seluruh order pendaftaran kelas yang telah berstatus Lunas.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Aksi Cepat</h3>
              
              <div className="flex flex-col gap-3 flex-1">
                <Link href="/admin/marketing/orders" className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-e17-primary hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Kelola Order</p>
                      <p className="text-xs text-slate-500">Lihat & konfirmasi order</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/admin/marketing" className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-e17-primary hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Edit Web Marketing</p>
                      <p className="text-xs text-slate-500">Ubah teks halaman depan</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
