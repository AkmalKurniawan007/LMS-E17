"use client"

import * as React from "react"
import { FileText, Folder, Link as LinkIcon, Plus, ExternalLink, Edit, Trash2, CheckCircle2, Clock, XCircle, Share2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getStudentPortfolios, createPortfolio, updatePortfolio, deletePortfolio, requestValidation, getStudentBatches, type PortfolioProject } from "./actions"

export default function SiswaPortfolioPage() {
  const [portfolios, setPortfolios] = React.useState<PortfolioProject[]>([])
  const [batches, setBatches] = React.useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    project_url: "",
    batch_id: ""
  })

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const [ports, bts] = await Promise.all([
      getStudentPortfolios(),
      getStudentBatches()
    ])
    setPortfolios(ports)
    setBatches(bts)
    setIsLoading(false)
  }

  const handleOpenModal = (portfolio?: PortfolioProject) => {
    if (portfolio) {
      setEditingId(portfolio.id)
      setFormData({
        title: portfolio.title,
        description: portfolio.description || "",
        project_url: portfolio.project_url || "",
        batch_id: portfolio.batch_id || ""
      })
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        description: "",
        project_url: "",
        batch_id: ""
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    setIsSubmitting(true)
    
    let res
    if (editingId) {
      res = await updatePortfolio(editingId, formData)
    } else {
      res = await createPortfolio(formData)
    }

    setIsSubmitting(false)
    
    if (res.success) {
      handleCloseModal()
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karya ini?")) return
    const res = await deletePortfolio(id)
    if (res.success) {
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const handleRequestValidation = async (id: string) => {
    if (!confirm("Ajukan karya ini untuk diverifikasi oleh Mentor? Karya tidak bisa diedit saat sedang direview.")) return
    const res = await requestValidation(id)
    if (res.success) {
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'validated':
        return <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1"/> Divalidasi</div>
      case 'pending':
        return <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center shadow-sm"><Clock className="w-3 h-3 mr-1"/> Menunggu Review</div>
      case 'rejected':
        return <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center shadow-sm"><XCircle className="w-3 h-3 mr-1"/> Revisi</div>
      default:
        return <div className="absolute top-3 left-3 bg-slate-700/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center shadow-sm">Draft</div>
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Portofolio Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Kumpulkan dan pamerkan hasil karya dari berbagai program.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => handleOpenModal()} variant="orange" className="font-bold shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Tambah Karya
          </Button>
        </div>
      </div>

      <div className="card-clean p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm text-e17-navy">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-e17-dark">Etalase Publik Portofolio Anda</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tampilkan karya yang sudah divalidasi ke perusahaan.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="bg-white whitespace-nowrap text-e17-navy border-blue-200 hover:bg-blue-50">
          Lihat Halaman Publik
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Memuat data portofolio...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {portfolios.map((item) => (
            <div key={item.id} className="card-clean overflow-hidden flex flex-col hover:border-slate-300 transition-all group">
              {/* Thumbnail Placeholder */}
              <div className="h-48 bg-slate-800 flex items-center justify-center border-b border-slate-200 relative overflow-hidden">
                {getStatusBadge(item.status)}
                
                <span className="text-4xl font-black text-white drop-shadow-md opacity-30 tracking-widest uppercase">
                  {item.title.substring(0, 3)}
                </span>
                
                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(item.status === 'draft' || item.status === 'rejected') && (
                    <>
                      <Button onClick={() => handleOpenModal(item)} variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm text-slate-700 shadow-sm"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm text-red-500 shadow-sm"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-e17-dark line-clamp-1 mb-1" title={item.title}>{item.title}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                  {item.batch?.program?.name || "Karya Mandiri"}
                </p>
                
                {item.status === 'rejected' && item.feedback && (
                  <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-2.5 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">Catatan Mentor:</span>
                      {item.feedback}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mt-auto">
                  {(item.status === 'draft' || item.status === 'rejected') && (
                    <Button 
                      onClick={() => handleRequestValidation(item.id)}
                      variant="outline" 
                      className="w-full text-xs h-8 font-bold border-blue-200 text-e17-navy hover:bg-blue-50"
                    >
                      Ajukan Validasi Mentor
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center rounded-b-xl">
                <span className="text-xs text-slate-500">Ditambahkan: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                {item.project_url && (
                  <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="text-e17-navy hover:bg-slate-200 -mr-2 h-8 px-2">
                      Lihat <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div onClick={() => handleOpenModal()} className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-6 min-h-[320px] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-e17-dark mb-1">Tambah Karya Baru</h3>
            <p className="text-sm text-slate-500">Upload screenshot, tautan repo, atau link presentasi.</p>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-lg text-e17-dark">
                {editingId ? "Edit Karya" : "Tambah Karya Baru"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Judul Karya *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: UI/UX Redesign E-Commerce"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Terkait Program (Opsional)</label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy bg-white"
                  >
                    <option value="">-- Karya Mandiri (Tidak Terkait Program) --</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Pilih program jika karya ini adalah tugas akhir dari kelas Anda.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Link Karya / Repositori / Figma</label>
                  <input 
                    type="url" 
                    value={formData.project_url}
                    onChange={(e) => setFormData({...formData, project_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ceritakan tentang karya ini..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <Button type="button" variant="outline" onClick={handleCloseModal}>Batal</Button>
              <Button type="submit" form="portfolio-form" variant="default" className="bg-e17-navy hover:bg-e17-navy/90" disabled={isSubmitting || !formData.title}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Karya'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
