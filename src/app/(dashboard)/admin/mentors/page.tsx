"use client"

import * as React from "react"
import { Plus, Search, Users, BookOpen, BarChart3, Edit2, Trash2, X, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { createClient } from "@/utils/supabase/client"
import { createMentorAccount, assignBatchesToMentor, removeMentor } from "./actions"
import Link from "next/link"

type Mentor = {
  id: string
  full_name: string
  email: string
  created_at: string
  batches: any[]
  total_students: number
  avg_student_rating?: number
  is_active: boolean
}

export default function AdminMentorsPage() {
  const supabase = createClient()
  const [mentors, setMentors] = React.useState<Mentor[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)
  const [selectedMentor, setSelectedMentor] = React.useState<Mentor | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [availableBatches, setAvailableBatches] = React.useState<any[]>([])

  // Form states
  const [formData, setFormData] = React.useState({ name: "", email: "" })
  const [selectedBatches, setSelectedBatches] = React.useState<string[]>([])

  React.useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    setIsLoading(true)
    try {
      // Fetch mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('users')
        .select('id, full_name, email, created_at')
        .eq('role', 'mentor')
        .order('created_at', { ascending: false })

      if (mentorsError) throw mentorsError

      // For each mentor, fetch their batches and student count
      const enrichedMentors = await Promise.all(
        (mentorsData || []).map(async (mentor) => {
          const { data: batchMentors } = await supabase
            .from('batch_mentors')
            .select(`
              batches (
                id,
                name,
                programs (name),
                enrollments (id)
              )
            `)
            .eq('mentor_id', mentor.id)

          let totalStudents = 0
          const batches = (batchMentors || []).map((bm: any) => {
            const studentCount = bm.batches?.enrollments?.length || 0
            totalStudents += studentCount
            return {
              id: bm.batches?.id,
              name: bm.batches?.name,
              program: bm.batches?.programs?.name,
              students: studentCount
            }
          })

          return {
            ...mentor,
            batches,
            total_students: totalStudents,
            is_active: true
          }
        })
      )

      setMentors(enrichedMentors)
    } catch (error) {
      console.error('Error fetching mentors:', error)
    }
    setIsLoading(false)
  }

  const fetchAvailableBatches = async () => {
    const { data } = await supabase
      .from('batches')
      .select('id, name, programs(name)')
      .eq('status', 'berjalan')
    if (data) setAvailableBatches(data)
  }

  const handleOpenAssignModal = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setSelectedBatches(mentor.batches.map(b => b.id))
    fetchAvailableBatches()
    setIsAssignModalOpen(true)
  }

  const handleAddMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('full_name', formData.get('name') || '')
    formData.set('email', formData.get('email') || '')

    const result = await createMentorAccount(formData)
    
    if (result.success) {
      alert(result.message)
      setIsAddModalOpen(false)
      setFormData({ name: "", email: "" })
      fetchMentors()
    } else {
      alert(result.message)
    }
    
    setIsSubmitting(false)
  }

  const handleAssignBatches = async () => {
    if (!selectedMentor) return
    setIsSubmitting(true)

    const result = await assignBatchesToMentor(selectedMentor.id, selectedBatches)
    
    if (result.success) {
      alert(result.message)
      setIsAssignModalOpen(false)
      fetchMentors()
    } else {
      alert(result.message)
    }
    
    setIsSubmitting(false)
  }

  const handleRemoveMentor = async (mentor: Mentor) => {
    if (!confirm(`Hapus mentor ${mentor.full_name}? Akun akan di-suspend dan tidak dapat login lagi.`)) return
    
    setIsSubmitting(true)
    const result = await removeMentor(mentor.id)
    
    if (result.success) {
      alert(result.message)
      fetchMentors()
    } else {
      alert(result.message)
    }
    
    setIsSubmitting(false)
  }

  const filteredMentors = mentors.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedMentors = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredMentors.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredMentors, currentPage, itemsPerPage])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Manajemen Mentor</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola mentor, assign batch, dan pantau performa pengajaran.</p>
        </div>
        <div className="flex-shrink-0">
          <Button variant="orange" className="font-bold shadow-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Mentor
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-clean p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Cari nama atau email mentor..."
            className="pl-10 pr-4 py-2 w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Mentor Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300 mr-3" />
          <p className="text-slate-500">Memuat data mentor...</p>
        </div>
      ) : paginatedMentors.length === 0 ? (
        <div className="card-clean p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak ada mentor ditemukan</h3>
          <p className="text-sm text-slate-500">Mulai dengan menambah mentor baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMentors.map((mentor) => (
            <div key={mentor.id} className="card-clean overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-e17-navy to-blue-700 p-4 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{mentor.full_name}</h3>
                    <p className="text-xs text-blue-200 truncate">{mentor.email}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    {mentor.full_name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="h-4 w-4 text-e17-navy" />
                    <span className="text-sm font-medium">Batch:</span>
                  </div>
                  <span className="text-lg font-bold text-e17-navy">{mentor.batches.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Siswa:</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{mentor.total_students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Rating:</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    {mentor.avg_student_rating?.toFixed(1) || '—'}
                  </span>
                </div>
              </div>

              {/* Batches List */}
              <div className="p-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Batch yang Di-Assign:</p>
                {mentor.batches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada batch di-assign</p>
                ) : (
                  <div className="space-y-1">
                    {mentor.batches.slice(0, 3).map((batch) => (
                      <div key={batch.id} className="text-xs bg-slate-50 p-2 rounded flex items-center justify-between">
                        <span className="font-medium text-slate-700">{batch.name}</span>
                        <span className="text-slate-500">{batch.students} siswa</span>
                      </div>
                    ))}
                    {mentor.batches.length > 3 && (
                      <p className="text-xs text-slate-500 italic pt-1">+{mentor.batches.length - 3} batch lainnya</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 flex gap-2">
                <Link href={`/admin/mentors/${mentor.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-sm font-bold">
                    <BarChart3 className="h-4 w-4 mr-1" /> Detail & Stats
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm font-bold"
                  onClick={() => handleOpenAssignModal(mentor)}
                >
                  <LinkIcon className="h-4 w-4 mr-1" /> Assign Batch
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleRemoveMentor(mentor)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredMentors.length > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredMentors.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Mentor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-e17-dark">Tambah Mentor Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMentor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <Input
                  name="name"
                  placeholder="Cth: Ahmad Rizal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Cth: ahmad@e17course.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <p className="text-xs text-blue-800">
                  <strong>Catatan:</strong> Mentor akan dibuat dengan sandi default: <code className="bg-blue-100 px-1 rounded">password123</code>. Mentor dapat mengubahnya setelah login pertama.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" variant="orange" className="font-bold shadow-md" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Tambah Mentor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Batch Modal */}
      {isAssignModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-e17-dark">Assign Batch ke {selectedMentor.full_name}</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm font-bold text-slate-700 mb-3">Pilih batch yang akan di-assign:</p>

              <div className="space-y-2">
                {availableBatches.map((batch) => (
                  <label key={batch.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(batch.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBatches([...selectedBatches, batch.id])
                        } else {
                          setSelectedBatches(selectedBatches.filter(id => id !== batch.id))
                        }
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{batch.name}</p>
                      <p className="text-xs text-slate-500">{batch.programs?.name}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="orange" className="font-bold shadow-md" disabled={isSubmitting} onClick={handleAssignBatches}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
