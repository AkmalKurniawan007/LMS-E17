"use client"

import * as React from "react"
import { CheckCircle2, XCircle, ExternalLink, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPendingPortfolios, reviewPortfolio, type PendingPortfolio } from "./actions"

export default function MentorPortfolioReviewPage() {
  const [portfolios, setPortfolios] = React.useState<PendingPortfolio[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [reviewingItem, setReviewingItem] = React.useState<PendingPortfolio | null>(null)
  const [feedback, setFeedback] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const data = await getPendingPortfolios()
    setPortfolios(data)
    setIsLoading(false)
  }

  const handleOpenReview = (item: PendingPortfolio) => {
    setReviewingItem(item)
    setFeedback("")
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!reviewingItem) return
    if (action === 'reject' && !feedback.trim()) {
      alert("Harap berikan catatan/feedback untuk perbaikan karya.")
      return
    }
    
    setIsSubmitting(true)
    const res = await reviewPortfolio(reviewingItem.id, action, feedback)
    setIsSubmitting(false)
    
    if (res.success) {
      setReviewingItem(null)
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Validasi Portofolio Siswa</h1>
        <p className="text-sm text-slate-500 mt-1">Review hasil karya siswa dari kelas yang Anda ajar sebelum dipublikasikan.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Memuat antrean validasi...</div>
      ) : portfolios.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-bold text-lg">Semua portofolio telah di-review!</p>
          <p className="text-sm mt-1">Saat ini tidak ada karya siswa yang menunggu validasi Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((item) => (
            <div key={item.id} className="card-clean p-5 flex flex-col border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase shrink-0 text-xs">
                    {item.user?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-e17-dark text-sm">{item.user?.full_name}</h3>
                    <p className="text-xs text-slate-500">{item.batch?.program?.name || "Karya Mandiri"}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded">Menunggu</span>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4 flex-1">
                <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                {item.description && <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>}
                
                {item.project_url && (
                  <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded hover:bg-blue-100">
                    Buka Link Karya <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
              
              <Button onClick={() => handleOpenReview(item)} className="w-full bg-e17-navy hover:bg-blue-900 text-white font-bold h-10">
                Review & Validasi
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-e17-dark flex items-center">
                Review Karya <span className="text-slate-400 text-sm ml-2 font-normal">({reviewingItem.user?.full_name})</span>
              </h2>
              <button 
                onClick={() => setReviewingItem(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg mb-2">{reviewingItem.title}</h3>
                {reviewingItem.description && <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{reviewingItem.description}</p>}
                
                {reviewingItem.project_url && (
                  <a href={reviewingItem.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-bold transition-colors">
                    <ExternalLink className="w-4 h-4 mr-2" /> Buka Link Project
                  </a>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 mr-1.5 text-slate-400" /> Catatan / Feedback (Opsional jika Approve)
                </label>
                <textarea 
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan masukan yang membangun untuk siswa..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy resize-none shadow-sm"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start text-xs text-blue-800">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-blue-500 mt-0.5" />
                <p>Klik <b>Validasi & Setujui</b> jika karya sudah layak dipamerkan secara publik. Klik <b>Tolak & Kembalikan</b> jika butuh revisi, siswa harus mengedit karya tersebut dan mengajukannya lagi.</p>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-between gap-3 bg-white rounded-b-2xl">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleAction('reject')}
                disabled={isSubmitting || !feedback.trim()}
                className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold disabled:opacity-50"
              >
                Tolak & Kembalikan
              </Button>
              <Button 
                type="button" 
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Validasi & Setujui'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
