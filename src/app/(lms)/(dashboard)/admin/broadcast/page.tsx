"use client"

import * as React from "react"
import { Megaphone, Send, Users, History, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBatches, getBroadcastHistory, sendBroadcast } from "./actions"

export type BroadcastHistory = { id: string, subject: string, target: string, created_at: string };

export default function BroadcastPage() {
  const [isSending, setIsSending] = React.useState(false)
  const [batches, setBatches] = React.useState<{id: string, name: string}[]>([])
  const [history, setHistory] = React.useState<BroadcastHistory[]>([])
  
  const [formData, setFormData] = React.useState({
    target: "all",
    subject: "",
    message: ""
  })

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [bData, hData] = await Promise.all([
      getBatches(),
      getBroadcastHistory()
    ])
    setBatches(bData)
    setHistory(hData)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.message) {
      alert("Harap isi subjek dan pesan pengumuman.")
      return
    }

    setIsSending(true)
    const res = await sendBroadcast(formData)
    setIsSending(false)

    if (res.success) {
      setFormData({ ...formData, subject: "", message: "" })
      alert("Pengumuman berhasil dikirimkan!")
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr)
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark flex items-center">
            <Megaphone className="w-6 h-6 mr-2 text-e17-navy" />
            Pusat Pengumuman (Broadcast)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kirimkan notifikasi massal ke email dan dashboard pengguna E17 Course.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-e17-dark text-sm flex items-center">
                <Send className="w-4 h-4 mr-2 text-e17-primary" />
                Tulis Pengumuman Baru
              </h2>
            </div>
            
            <form onSubmit={handleSend} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Penerima</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Semua Siswa & Mentor</option>
                    <option value="students">Hanya Semua Siswa</option>
                    <option value="mentors">Hanya Semua Mentor</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>Khusus {b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subjek Pengumuman</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pemeliharaan Sistem, Libur Nasional, dll."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pesan</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ketik isi pengumuman Anda di sini..."
                ></textarea>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                  Pesan akan dikirim sebagai notifikasi in-app. Pengiriman via email belum diaktifkan di tahap ini.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button 
                  type="submit" 
                  variant="orange" 
                  className="font-bold shadow-sm"
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Kirim Pengumuman
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-e17-dark text-sm flex items-center">
                <History className="w-4 h-4 mr-2 text-slate-500" />
                Riwayat Pengiriman
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Belum ada riwayat pengumuman.
                </div>
              ) : history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide truncate max-w-[150px]" title={item.target}>
                      {item.target}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">{formatDate(item.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mt-2">{item.subject}</h3>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                    Terkirim
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
