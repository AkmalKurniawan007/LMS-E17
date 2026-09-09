"use client"

import * as React from "react"
import { Trophy, Search, ChevronDown, User, Award, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

type StudentGrade = {
  id: string
  name: string
  email: string
  attendance: number // percentage 0-100
  quiz: number // 0-100
  task: number // 0-100
  finalProject: number // 0-100
  total: number // calculated 0-100
}

export default function AdminGradesPage() {
  const supabase = createClient()
  const [batches, setBatches] = React.useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>("")
  const [students, setStudents] = React.useState<StudentGrade[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchBatches()
  }, [])

  React.useEffect(() => {
    if (selectedBatchId) {
      fetchGradesForBatch(selectedBatchId)
    } else {
      setStudents([])
    }
  }, [selectedBatchId])

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select('id, name').order('created_at', { ascending: false })
    if (data) {
      setBatches(data)
      if (data.length > 0) setSelectedBatchId(data[0].id)
    }
    setIsLoading(false)
  }

  const fetchGradesForBatch = async (batchId: string) => {
    setIsLoading(true)
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('id, user_id, final_grade, attendance_percentage, users(full_name, email)')
      .eq('batch_id', batchId)

    if (!enrolls || enrolls.length === 0) {
      setStudents([])
      setIsLoading(false)
      return
    }

    const grades: StudentGrade[] = enrolls.map((enr: any) => {
      const finalGrade = typeof enr.final_grade === 'number' ? enr.final_grade : 0
      const attendance = typeof enr.attendance_percentage === 'number' ? enr.attendance_percentage : 0

      return {
        id: enr.id,
        name: enr.users?.full_name || 'Siswa',
        email: enr.users?.email || '-',
        attendance: attendance,
        quiz: 0, // Belum ada tabel detail kuis
        task: 0, // Belum ada tabel detail tugas
        finalProject: 0, // Belum ada tabel detail proyek
        total: finalGrade
      }
    })

    // Urutkan dari nilai tertinggi ke terendah
    grades.sort((a, b) => b.total - a.total)
    
    setStudents(grades)
    setIsLoading(false)
  }

  const top3 = students.slice(0, 3)
  const restStudents = students.slice(3)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Nilai & Peringkat Kelas</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau performa akademik siswa secara transparan (Hanya Baca).</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-slate-600">Pilih Batch:</label>
          <div className="relative">
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-e17-navy cursor-pointer shadow-sm"
            >
              {batches.length === 0 && <option value="">Tidak ada batch</option>}
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 animate-pulse">Memuat data nilai...</div>
      ) : students.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          Belum ada siswa yang terdaftar di batch ini.
        </div>
      ) : (
        <>
          {/* Top 3 Ranking Podium */}
          <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden shadow-xl mb-8">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Trophy className="w-64 h-64 text-white" />
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-wide flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-3 text-amber-400" /> TOP 3 PERINGKAT TERBAIK
              </h2>
              <p className="text-blue-200 mt-2 text-sm">Berdasarkan Total Nilai (30% Kuis + 30% Tugas + 40% Proyek Akhir)</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-12 relative z-10 max-w-4xl mx-auto mt-12 md:mt-16">
              {/* Rank 2 - Silver */}
              {top3[1] && (
                <div className="flex flex-col items-center order-2 md:order-1 w-full md:w-1/3">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center border-4 border-slate-800 shadow-[0_0_15px_rgba(203,213,225,0.3)]">
                      <User className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-xs font-black px-2 py-0.5 rounded-full border-2 border-slate-800">#2</div>
                  </div>
                  <h3 className="text-white font-bold text-center text-lg leading-tight mb-1">{top3[1].name}</h3>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 mt-3 text-center border border-slate-700/50 w-full">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Nilai Akhir</p>
                    <p className="text-2xl font-black text-white">{top3[1].total}</p>
                  </div>
                </div>
              )}

              {/* Rank 1 - Gold */}
              {top3[0] && (
                <div className="flex flex-col items-center order-1 md:order-2 w-full md:w-1/3 transform md:-translate-y-8">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center border-4 border-slate-800 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                      <Award className="w-12 h-12 text-amber-900" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-sm font-black px-3 py-0.5 rounded-full border-2 border-slate-800">#1</div>
                  </div>
                  <h3 className="text-amber-400 font-bold text-center text-xl leading-tight mb-1">{top3[0].name}</h3>
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl px-5 py-3 mt-3 text-center border border-amber-500/30 w-full shadow-lg">
                    <p className="text-amber-200/60 text-xs uppercase font-bold tracking-wider mb-0.5">Nilai Akhir</p>
                    <p className="text-4xl font-black text-amber-400">{top3[0].total}</p>
                  </div>
                </div>
              )}

              {/* Rank 3 - Bronze */}
              {top3[2] && (
                <div className="flex flex-col items-center order-3 md:order-3 w-full md:w-1/3">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center border-4 border-slate-800 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                      <User className="w-8 h-8 text-amber-100" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-xs font-black px-2 py-0.5 rounded-full border-2 border-slate-800">#3</div>
                  </div>
                  <h3 className="text-white font-bold text-center text-lg leading-tight mb-1">{top3[2].name}</h3>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 mt-3 text-center border border-slate-700/50 w-full">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Nilai Akhir</p>
                    <p className="text-2xl font-black text-white">{top3[2].total}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Table */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-e17-dark">Semua Nilai Siswa (Read-only)</h3>
              <div className="text-xs text-slate-500 font-medium">
                Admin tidak memiliki hak ubah. Nilai diatur oleh Mentor.
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 bg-white border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Peringkat</th>
                    <th className="px-6 py-4 font-bold">Nama Siswa</th>
                    <th className="px-6 py-4 font-bold text-center">Kehadiran</th>
                    <th className="px-6 py-4 font-bold text-center">Kuis (30%)</th>
                    <th className="px-6 py-4 font-bold text-center">Tugas (30%)</th>
                    <th className="px-6 py-4 font-bold text-center">Final Project (40%)</th>
                    <th className="px-6 py-4 font-bold text-center bg-blue-50/50">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' : 
                          idx === 1 ? 'bg-slate-200 text-slate-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="font-medium text-slate-600">{student.attendance}%</span>
                      </td>
                      <td className="px-6 py-3 text-center font-medium text-slate-600">
                        {student.quiz}
                      </td>
                      <td className="px-6 py-3 text-center font-medium text-slate-600">
                        {student.task}
                      </td>
                      <td className="px-6 py-3 text-center font-medium text-slate-600">
                        {student.finalProject}
                      </td>
                      <td className="px-6 py-3 text-center bg-blue-50/30">
                        <span className="font-black text-e17-navy text-lg">{student.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
