"use client"

import { FileText, Folder, Link as LinkIcon, Plus, ExternalLink, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SiswaPortfolioPage() {
  const portfolios = [
    { 
      id: 1, 
      title: "UI/UX Redesign E-Commerce App", 
      program: "UI/UX Design Masterclass", 
      type: "Figma Link",
      url: "https://figma.com/file/...",
      thumbnail: "UI",
      createdAt: "10 Agu 2026"
    },
    { 
      id: 2, 
      title: "Personal Portfolio Website", 
      program: "Frontend Web Development Basic", 
      type: "GitHub Repo & Vercel",
      url: "https://github.com/...",
      thumbnail: "Web",
      createdAt: "15 Des 2025"
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Portofolio Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Kumpulkan dan pamerkan hasil karya / tugas akhir dari berbagai program.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="orange" className="font-bold shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Tambah Portofolio
          </Button>
        </div>
      </div>

      {/* Public Profile Link (Mock) */}
      <div className="card-clean p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mr-4 shrink-0 border border-slate-200">
            <LinkIcon className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-e17-dark">Tautan Publik Portofolio Anda</h3>
            <p className="text-xs text-slate-500 mt-0.5">e17course.com/p/budi-santoso</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="bg-white whitespace-nowrap">
          Salin Tautan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {portfolios.map((item) => (
          <div key={item.id} className="card-clean overflow-hidden flex flex-col hover:border-slate-300 transition-all group">
            {/* Thumbnail Placeholder */}
            <div className="h-48 bg-slate-800 flex items-center justify-center border-b border-slate-200 relative">
              <span className="text-4xl font-black text-white drop-shadow-md opacity-30 tracking-widest uppercase">
                {item.thumbnail}
              </span>
              
              {/* Overlay Actions */}
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm text-slate-700 shadow-sm"><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm text-red-500 shadow-sm"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-e17-dark line-clamp-1 mb-1" title={item.title}>{item.title}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-1">{item.program}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 w-fit">
                  <Folder className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {item.type}
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center rounded-b-xl">
              <span className="text-xs text-slate-500">Ditambahkan: {item.createdAt}</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-e17-navy hover:bg-slate-200 -mr-2">
                  Lihat Karya <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-6 min-h-[320px] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
            <Plus className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-e17-dark mb-1">Tambah Karya Baru</h3>
          <p className="text-sm text-slate-500">Upload screenshot, tautan repo, atau link presentasi.</p>
        </div>
      </div>
    </div>
  )
}
