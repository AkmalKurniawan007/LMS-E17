"use client"

import * as React from "react"
import { Search, Filter, CheckCircle2, Clock, FileText, X, Check, BookOpen, AlertCircle } from "lucide-react"

import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

import { fetchQuizAttemptsByQuizIds } from "./actions"

export default function MentorQuizzesPage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [quizzesData, setQuizzesData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const mentorId = userData.user.id

    // 1. Get batches assigned to this mentor
    const { data: mentorBatches } = await supabase
      .from('batch_mentors')
      .select('batch_id')
      .eq('mentor_id', mentorId)

    if (!mentorBatches || mentorBatches.length === 0) {
      setQuizzesData([])
      setIsLoading(false)
      return
    }

    const batchIds = mentorBatches.map(b => b.batch_id)

    // 2. Get sessions for these batches
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, batch_id, batches(name)')
      .in('batch_id', batchIds)

    if (!sessionsData || sessionsData.length === 0) {
      setQuizzesData([])
      setIsLoading(false)
      return
    }

    const sessionIds = sessionsData.map(s => s.id)
    const sessionBatchMap = sessionsData.reduce((acc, curr) => {
       acc[curr.id] = (curr.batches as any)?.name || 'Batch'
       return acc
    }, {} as any)

    // 3. Get quizzes for these sessions
    const { data: quizzesDataRaw } = await supabase
      .from('quizzes')
      .select('id, title, session_id')
      .in('session_id', sessionIds)

    if (!quizzesDataRaw || quizzesDataRaw.length === 0) {
      setQuizzesData([])
      setIsLoading(false)
      return
    }

    const quizIds = quizzesDataRaw.map(q => q.id)
    const quizMap = quizzesDataRaw.reduce((acc, curr) => {
       acc[curr.id] = { title: curr.title, session_id: curr.session_id }
       return acc
    }, {} as any)

    // 4. Fetch all quiz attempts related to these quizzes via Server Action (bypasses RLS)
    const { data: attemptsData, error: attemptError } = await fetchQuizAttemptsByQuizIds(quizIds)

    if (attemptError) {
      console.error("Error fetching attempts:", attemptError)
    }

    if (attemptsData) {
      const formattedData = attemptsData.map((attempt: any) => {
        const qInfo = quizMap[attempt.quiz_id]
        const q = qInfo
        const batchName = qInfo ? sessionBatchMap[qInfo.session_id] : 'Batch'
        
        return {
          id: attempt.id,
          student: attempt.users?.full_name || 'Siswa',
          quiz: qInfo?.title || 'Kuis',
          batch: batchName,
          batchName: Array.isArray(q?.sessions?.batches) ? q.sessions.batches[0]?.name : q?.sessions?.batches?.name || batchName,
          programName: Array.isArray(q?.sessions?.batches?.programs) 
            ? q.sessions.batches.programs[0]?.name 
            : q?.sessions?.batches?.programs?.name,
          status: attempt.is_passed ? 'completed' : 'failed',
          time: formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true, locale: id }),
          score: attempt.score
        }
      })
      setQuizzesData(formattedData)
    }

    setIsLoading(false)
  }

  const filteredQuizzes = React.useMemo(() => {
    return quizzesData.filter(sub => {
      const matchesSearch = sub.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.quiz.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, quizzesData])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Penilaian Kuis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat rekapitulasi nilai kuis pilihan ganda yang dinilai otomatis oleh sistem.
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
            placeholder="Cari nama siswa atau kuis..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua Kuis
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lulus KKM
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'failed' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Remedial (Gagal)
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card-clean overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="animate-spin h-8 w-8 border-4 border-e17-navy border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm text-slate-500">Memuat data kuis...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada riwayat kuis</h3>
            <p className="text-sm text-slate-500 mt-2">Tidak ditemukan data yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Judul Kuis</th>
                  <th className="px-6 py-4 font-semibold">Siswa & Kelas</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengerjaan</th>
                  <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-slate-800">{quiz.quiz}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{quiz.student}</p>
                      <p className="text-xs text-slate-500">{quiz.batch}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">
                      {quiz.time}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-black ${
                        quiz.score >= 60 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {quiz.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        quiz.score >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {quiz.score >= 60 ? (
                          <><Check className="w-3 h-3 mr-1" /> Lulus</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Remedial</>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
