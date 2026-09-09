"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, BookOpen, Users, FileText, CheckSquare, Plus, MoreVertical, Edit, Trash2, Calendar, Layout, Search, GripVertical, FileVideo, FileCode2, Link as LinkIcon, AlertCircle, Video } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { createClient } from "@/utils/supabase/client"



export default function MentorBatchDetailPage() {
  const params = useParams()
  const batchId = params.batchId as string
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = React.useState('siswa')
  const [materials, setMaterials] = React.useState<any[]>([])

  const [batchInfo, setBatchInfo] = React.useState<any>(null)
  const [students, setStudents] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      
      // Fetch batch info
      const { data: batchData } = await supabase
        .from('batches')
        .select(`
          id, name, start_date, end_date, status,
          programs ( name, description )
        `)
        .eq('id', batchId)
        .single()

      if (batchData) {
        setBatchInfo({
          id: batchData.id,
          name: batchData.name,
          program: batchData.programs?.name || "Program Tanpa Nama",
          status: batchData.status || "Active",
          startDate: batchData.start_date,
          endDate: batchData.end_date,
          description: batchData.programs?.description || "Deskripsi program belum tersedia."
        })
      }

      // Fetch students (enrollments)
      const { data: studentsData } = await supabase
        .from('enrollments')
        .select(`
          id, status,
          users ( id, full_name, email )
        `)
        .eq('batch_id', batchId)

      if (studentsData) {
        setStudents(studentsData.map(e => ({
          id: e.users?.id,
          enrollmentId: e.id,
          name: e.users?.full_name,
          email: e.users?.email,
          progress: 0, 
          tasksDone: 0, 
          tasksTotal: 0, 
          attendance: 'hadir', 
          privateNote: '' 
        })))
      }

      // Fetch sessions & materials
      const { data: sessionsData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id, title, order_number,
          materials ( id, title, type, order_number, content_url )
        `)
        .eq('batch_id', batchId)
        .order('order_number', { ascending: true })

      if (sessionError) {
        console.error("Error fetching sessions:", sessionError)
      }

      if (sessionsData) {
        const mappedMaterials = sessionsData.map((session, index) => {
          // sort materials by order_number
          const sortedMaterials = (session.materials || []).sort((a: any, b: any) => (a.order_number || 0) - (b.order_number || 0))
          
          return {
            id: session.id,
            title: session.title || `Sesi ${session.order_number || index + 1}`,
            order: session.order_number || index + 1,
            isExpanded: index === 0, // expand first session by default
            contents: sortedMaterials.map((mat: any) => ({
              id: mat.id,
              type: mat.type || 'document',
              title: mat.title || 'Materi',
              url: mat.content_url || '#'
            }))
          }
        })
        setMaterials(mappedMaterials)
      }

      setIsLoading(false)
    }

    if (batchId) {
      fetchData()
    }
  }, [batchId])

  const tabs = [
    { id: 'siswa', label: 'Siswa & Catatan', icon: Users },
    { id: 'sesi', label: 'Sesi Pembelajaran', icon: Calendar },
    { id: 'pengumuman', label: 'Broadcast', icon: FileText },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <Link href="/mentor/batches" className="text-sm font-semibold text-slate-500 hover:text-e17-navy flex items-center w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Batch Saya
        </Link>
        {isLoading ? (
          <div className="h-16 flex items-center">
             <div className="animate-spin h-6 w-6 border-2 border-e17-navy border-t-transparent rounded-full mr-3"></div>
             <span className="text-slate-500 font-medium">Memuat data batch...</span>
          </div>
        ) : batchInfo ? (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-e17-dark">{batchInfo.name}</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center">
                {batchInfo.program} <span className="mx-2">•</span> 
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700`}>
                  {batchInfo.status}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-red-500 font-bold">Data batch tidak ditemukan.</div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center transition-colors
                ${activeTab === tab.id
                  ? 'border-e17-primary text-e17-navy'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-e17-primary' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* TAB: SISWA */}
        {activeTab === 'siswa' && (
          <div className="card-clean animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50"
                />
              </div>
              <button className="text-sm font-bold text-e17-navy bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                Unduh Rekap Nilai
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Progres Belajar</th>
                    <th className="px-6 py-4 font-semibold text-center">Tugas Diselesaikan</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                     <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500">Memuat data siswa...</td>
                     </tr>
                  ) : students.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500">Belum ada siswa yang terdaftar di batch ini.</td>
                     </tr>
                  ) : students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                      <td className="px-6 py-4 text-slate-500">{student.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-700">{student.tasksDone}</span> / {student.tasksTotal}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                            title="Catatan Pribadi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Beri Tugas Remedial"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Jadwal 1-on-1"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                          <button className="text-e17-navy hover:bg-blue-50 px-2 py-1 ml-2 rounded text-xs font-bold transition-colors border border-slate-200 hover:border-blue-200">
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Modals Mock Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0 text-amber-700"><Edit className="w-4 h-4"/></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Catatan Pribadi</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Menyimpan catatan spesifik siswa (tersembunyi dari publik).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="bg-rose-100 p-2 rounded-lg flex-shrink-0 text-rose-700"><AlertCircle className="w-4 h-4"/></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Tugas Remedial</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Kirim penugasan ulang otomatis bagi siswa berisiko.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0 text-blue-700"><Video className="w-4 h-4"/></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Konsultasi 1-on-1</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Jadwalkan sesi Zoom khusus untuk *mentoring* personal.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SESI & ABSENSI */}
        {activeTab === 'sesi' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="card-clean overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h4 className="font-bold text-slate-700 text-sm">Daftar Sesi Pembelajaran</h4>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {materials.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm font-medium">Belum ada sesi pada batch ini.</p>
                  </div>
                ) : materials.map((session, idx) => (
                  <div key={session.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex flex-col items-center justify-center shrink-0 border border-blue-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sesi</span>
                        <span className="text-sm font-black">{session.order}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-base">{session.title}</h5>
                        <p className="text-xs text-slate-500 mt-1">
                          {session.contents.length} Materi/Tugas
                        </p>
                      </div>
                    </div>
                    
                    <Link href={`/mentor/batches/${batchId}/sessions/${session.id}`}>
                      <button className="w-full md:w-auto bg-e17-navy hover:bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center">
                        Kelola Sesi <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* TAB: PENGUMUMAN / BROADCAST */}
        {activeTab === 'pengumuman' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card-clean overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Pengumuman Kelas (Broadcast)</h3>
                  <p className="text-sm text-slate-500 mt-1">Kirim pesan massal, pengingat tugas, atau info jadwal ke seluruh siswa di kelas ini.</p>
                </div>
              </div>
              <div className="p-6 bg-white space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Judul Pengumuman</label>
                  <input type="text" placeholder="Contoh: Pengingat Batas Pengumpulan Proyek Akhir" className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Isi Pesan</label>
                  <textarea rows={5} placeholder="Tuliskan pesan Anda di sini..." className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy resize-none"></textarea>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button className="bg-e17-primary hover:bg-yellow-400 text-e17-navy px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                    Kirim Sekarang
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-e17-navy rounded border-slate-300 focus:ring-e17-navy"/>
                    <span className="text-sm text-slate-600 font-medium">Kirim ke Email Siswa</span>
                  </label>
                </div>
              </div>

              {/* Riwayat Broadcast */}
              <div className="bg-slate-50 p-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm mb-4">Riwayat Pengumuman Terakhir</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-e17-navy/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-e17-navy text-sm">Selamat Datang di Batch 3!</h5>
                      <span className="text-xs text-slate-400">12 Agt 2026, 09:00</span>
                    </div>
                    <p className="text-sm text-slate-600">Halo semua, perkenalkan saya Budi selaku mentor kalian...</p>
                  </div>
                </div>
              </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
