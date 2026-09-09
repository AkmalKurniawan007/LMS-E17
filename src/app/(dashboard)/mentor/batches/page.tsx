"use client"

import * as React from "react"
import { Search, Filter, BookOpen, Users, Calendar, ArrowRight, BookCopy } from "lucide-react"
import Link from "next/link"

import { createClient } from "@/utils/supabase/client"

export default function MentorBatchesPage() {
  const supabase = createClient()
  const [batches, setBatches] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")

  const filteredBatches = React.useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            batch.program.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" || batch.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [batches, searchQuery, statusFilter])

  React.useEffect(() => {
    const fetchMyBatches = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('batch_mentors')
        .select(`
          batch:batches (
            id,
            name,
            start_date,
            end_date,
            status,
            program:programs ( name ),
            enrollments ( id ),
            sessions ( id, status )
          )
        `)
        .eq('mentor_id', user.id)

      if (data) {
        const formatted = data.map((bm: any) => {
          const b = bm.batch
          const today = new Date().toISOString().split('T')[0]
          
          let status = "Active"
          if (b.status) {
             status = b.status
          } else {
             if (b.start_date > today) status = "Starting Soon"
             else if (b.end_date && b.end_date < today) status = "Completed"
             else status = "Active"
          }
          
          const totalModules = b.sessions?.length || 0
          const completedModules = b.sessions?.filter((s: any) => s.status === 'completed').length || 0
          const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

          return {
            id: b.id,
            name: b.name,
            program: b.program?.name || "Program Tanpa Nama",
            status: status,
            startDate: b.start_date,
            endDate: b.end_date || "TBA",
            students: b.enrollments?.length || 0,
            progress: progress, 
            modules: totalModules,
            completedModules: completedModules,
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" // Placeholder
          }
        })
        setBatches(formatted)
      }
      setIsLoading(false)
    }

    fetchMyBatches()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Batch Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola dan pantau seluruh kelas yang ditugaskan kepada Anda.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-clean p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama batch atau program..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="pl-9 pr-8 py-2 w-full sm:w-auto border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy appearance-none bg-white cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Starting Soon">Akan Datang</option>
              <option value="Completed">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="card-clean p-12 flex flex-col items-center justify-center text-center">
          <div className="animate-spin h-8 w-8 border-4 border-e17-navy border-t-transparent rounded-full mb-4"></div>
          <h3 className="text-lg font-bold text-slate-700">Memuat Data...</h3>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="card-clean p-12 flex flex-col items-center justify-center text-center">
          <BookCopy className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Tidak ada batch yang ditemukan</h3>
          <p className="text-sm text-slate-500 mt-2">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBatches.map((batch) => (
            <Link href={`/mentor/batches/${batch.id}`} key={batch.id} className="group block">
              <div className="card-clean overflow-hidden h-full flex flex-col hover:border-e17-navy hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                {/* Card Image */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                  <img 
                    src={batch.image} 
                    alt={batch.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      batch.status === 'Active' ? 'bg-emerald-500 text-white' :
                      batch.status === 'Completed' ? 'bg-slate-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 group-hover:text-e17-navy transition-colors line-clamp-1">{batch.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{batch.program}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span className="font-semibold">{batch.students} Siswa</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span className="font-semibold">{batch.modules} Modul</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-600 col-span-2">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {new Date(batch.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} 
                        {' - '} 
                        {batch.endDate === "TBA" ? "TBA" : new Date(batch.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-600">Progres ({batch.completedModules}/{batch.modules})</span>
                      <span className="text-xs font-bold text-e17-navy">{batch.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                      <div className={`h-1.5 rounded-full ${
                        batch.progress === 100 ? 'bg-emerald-500' : 'bg-e17-primary'
                      }`} style={{ width: `${batch.progress}%` }}></div>
                    </div>
                    
                    <div className="w-full bg-slate-50 hover:bg-e17-navy text-slate-700 hover:text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center group/btn">
                      Kelola Kelas <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
