"use client"

import * as React from "react"
import { Award, FileText, CheckCircle2, XCircle, Clock, ExternalLink, AlertCircle, Loader2, Filter, UserCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TIER_LABELS } from "@/lib/access-tier"
import { 
  BnspBatchOption, 
  BnspStudentDetail, 
  getBnspStudentsForBatch, 
  assessBnspStudent 
} from "@/app/(lms)/(dashboard)/admin/bnsp/actions"

interface BnspAssessmentManagerProps {
  initialBatches: BnspBatchOption[]
  role: 'admin' | 'mentor'
}

export function BnspAssessmentManager({ initialBatches, role }: BnspAssessmentManagerProps) {
  const [batches] = React.useState<BnspBatchOption[]>(initialBatches)
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>(
    initialBatches.length > 0 ? initialBatches[0].id : ""
  )
  const [students, setStudents] = React.useState<BnspStudentDetail[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  // State Modal Penilaian
  const [selectedStudent, setSelectedStudent] = React.useState<BnspStudentDetail | null>(null)
  const [portfolioStatus, setPortfolioStatus] = React.useState<'under_review' | 'revision_needed' | 'accepted'>('under_review')
  const [assessorStatus, setAssessorStatus] = React.useState<'kompeten' | 'belum_kompeten'>('kompeten')
  const [assessorNotes, setAssessorNotes] = React.useState<string>('')
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  // Filter internal tabel
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const fetchStudents = React.useCallback(async (batchId: string) => {
    if (!batchId) {
      setStudents([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getBnspStudentsForBatch(batchId)
      setStudents(data)
    } catch (err) {
      console.error("Gagal memuat siswa BNSP:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (selectedBatchId) {
      fetchStudents(selectedBatchId)
    }
  }, [selectedBatchId, fetchStudents])

  const handleOpenAssessmentModal = (student: BnspStudentDetail) => {
    setSelectedStudent(student)
    const validPortStatus = (['under_review', 'revision_needed', 'accepted'].includes(student.portfolioStatus))
      ? (student.portfolioStatus as 'under_review' | 'revision_needed' | 'accepted')
      : 'under_review'
    const validAssessorStatus = (['kompeten', 'belum_kompeten'].includes(student.assessorStatus))
      ? (student.assessorStatus as 'kompeten' | 'belum_kompeten')
      : 'kompeten'

    setPortfolioStatus(validPortStatus)
    setAssessorStatus(validAssessorStatus)
    setAssessorNotes(student.assessorNotes || '')
  }

  const handleSaveAssessment = async () => {
    if (!selectedStudent) return
    setIsSubmitting(true)
    try {
      const res = await assessBnspStudent({
        enrollmentId: selectedStudent.enrollmentId,
        portfolioStatus,
        assessorStatus,
        assessorNotes,
      })

      if (!res.success) {
        alert(res.error || "Gagal menyimpan penilaian.")
      } else {
        alert(`Penilaian BNSP untuk ${selectedStudent.name} berhasil disimpan!`)
        setSelectedStudent(null)
        await fetchStudents(selectedBatchId)
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStudents = React.useMemo(() => {
    if (statusFilter === 'all') return students
    if (statusFilter === 'kompeten') return students.filter(s => s.assessorStatus === 'kompeten')
    if (statusFilter === 'belum_kompeten') return students.filter(s => s.assessorStatus === 'belum_kompeten')
    if (statusFilter === 'pending') return students.filter(s => s.assessorStatus === 'pending')
    return students
  }, [students, statusFilter])

  // Ringkasan statistik
  const stats = React.useMemo(() => {
    const total = students.length
    const kompeten = students.filter(s => s.assessorStatus === 'kompeten').length
    const belumKompeten = students.filter(s => s.assessorStatus === 'belum_kompeten').length
    const pending = students.filter(s => s.assessorStatus === 'pending').length
    return { total, kompeten, belumKompeten, pending }
  }, [students])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Penilaian Sertifikasi BNSP</h1>
          </div>
          <p className="text-sm text-slate-500">
            {role === 'admin' 
              ? 'Evaluasi kelayakan sertifikasi BNSP untuk siswa tier Pro Bootcamp dan Bootcamp pada seluruh batch.'
              : 'Evaluasi kelayakan sertifikasi BNSP untuk siswa pada batch yang Anda bimbing.'}
          </p>
        </div>

        {/* Batch Selector */}
        {batches.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 shrink-0">Pilih Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="h-10 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-e17-navy"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="card-clean p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Tidak Ada Batch Tersedia</h3>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'mentor' 
              ? 'Anda belum ditugaskan ke batch manapun sebagai mentor.' 
              : 'Belum ada batch yang dibuat di sistem.'}
          </p>
        </div>
      ) : (
        <>
          {/* Ringkasan Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-clean p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Total Siswa BNSP</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
              <span className="text-[11px] text-slate-400">Tier Complete & Bootcamp</span>
            </div>
            <div className="card-clean p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="text-xs font-semibold text-emerald-700">Kompeten</span>
              <div className="text-2xl font-black text-emerald-800 mt-1">{stats.kompeten}</div>
              <span className="text-[11px] text-emerald-600">Direkomendasikan Lulus</span>
            </div>
            <div className="card-clean p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-xs font-semibold text-amber-700">Menunggu Asesmen</span>
              <div className="text-2xl font-black text-amber-800 mt-1">{stats.pending}</div>
              <span className="text-[11px] text-amber-600">Belum diputuskan asesor</span>
            </div>
            <div className="card-clean p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <span className="text-xs font-semibold text-rose-700">Belum Kompeten</span>
              <div className="text-2xl font-black text-rose-800 mt-1">{stats.belumKompeten}</div>
              <span className="text-[11px] text-rose-600">Perlu tindak lanjut</span>
            </div>
          </div>

          {/* Tabel Penilaian */}
          <div className="card-clean overflow-hidden rounded-2xl bg-white border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-e17-navy" />
                <h2 className="font-bold text-slate-800 text-base">Daftar Peserta BNSP</h2>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {students.length} Siswa
                </span>
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Status Asesor:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-e17-navy"
                >
                  <option value="all">Semua Keputusan</option>
                  <option value="kompeten">Kompeten</option>
                  <option value="belum_kompeten">Belum Kompeten</option>
                  <option value="pending">Menunggu / Pending</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-3" />
                <p className="text-sm font-medium">Memuat data siswa BNSP...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">Tidak ada siswa yang ditemukan.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Pastikan batch memiliki siswa dengan tier Pro Bootcamp (BNSP) atau Bootcamp.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                      <th className="px-6 py-4 font-semibold">Tier Paket</th>
                      <th className="px-6 py-4 font-semibold">Ujian Teori</th>
                      <th className="px-6 py-4 font-semibold">Portofolio</th>
                      <th className="px-6 py-4 font-semibold">Status Asesor</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.enrollmentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            student.tier === 'complete'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {TIER_LABELS[student.tier] || student.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {student.theoryStatus === 'passed' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : student.theoryStatus === 'failed' ? (
                              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-slate-800">
                                {student.theoryScore !== null ? `${student.theoryScore} Pts` : '-'}
                              </span>
                              <span className="block text-[11px] text-slate-400 capitalize">
                                {student.theoryStatus === 'passed' ? 'Lulus' : student.theoryStatus === 'failed' ? 'Tidak Lulus' : 'Belum Ujian'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            student.portfolioStatus === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : student.portfolioStatus === 'revision_needed'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : student.portfolioStatus === 'under_review'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {student.portfolioStatus === 'accepted' ? 'Diterima' :
                             student.portfolioStatus === 'revision_needed' ? 'Perlu Revisi' :
                             student.portfolioStatus === 'under_review' ? 'Sedang Ditinjau' : 'Belum Submit'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            student.assessorStatus === 'kompeten'
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.assessorStatus === 'belum_kompeten'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {student.assessorStatus === 'kompeten' ? 'KOMPETEN' :
                             student.assessorStatus === 'belum_kompeten' ? 'BELUM KOMPETEN' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold border-slate-300 hover:bg-slate-100 text-slate-800"
                            onClick={() => handleOpenAssessmentModal(student)}
                          >
                            Evaluasi
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Penilaian Asesor */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Penilaian Asesor BNSP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStudent.name} ({selectedStudent.email}) • {TIER_LABELS[selectedStudent.tier]}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Seksi 1: Hasil Ujian Teori */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1. Hasil Ujian Teori BNSP
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      Skor Teori: {selectedStudent.theoryScore !== null ? `${selectedStudent.theoryScore} / 100` : 'Belum Ada Nilai'}
                    </span>
                    <span className="block text-xs text-slate-500 capitalize">
                      Status: {selectedStudent.theoryStatus}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    selectedStudent.theoryStatus === 'passed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedStudent.theoryStatus === 'failed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedStudent.theoryStatus === 'passed' ? 'Lulus Teori' : selectedStudent.theoryStatus === 'failed' ? 'Gagal Teori' : 'Belum Dikerjakan'}
                  </span>
                </div>
              </div>

              {/* Seksi 2: Berkas Tugas Portofolio BNSP */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  2. Dokumen & Portofolio BNSP (is_bnsp = true)
                </span>
                {selectedStudent.submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada tugas BNSP yang dibuat pada batch ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedStudent.submissions.map((task) => (
                      <div key={task.taskId} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/80">
                        <div>
                          <div className="font-semibold text-xs text-slate-800">{task.taskTitle}</div>
                          <div className="text-[11px] text-slate-400">
                            {task.submittedAt ? `Diserahkan: ${task.submittedAt}` : 'Belum diserahkan'}
                          </div>
                        </div>

                        {task.fileUrl ? (
                          <a
                            href={task.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-e17-navy hover:text-slate-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Buka Berkas
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">
                            Tidak ada berkas
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seksi 3: Form Penilaian Asesor */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  3. Keputusan & Evaluasi Asesor
                </span>

                {/* Status Portofolio */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Status Portofolio:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'under_review' as const, label: 'Under Review' },
                      { value: 'revision_needed' as const, label: 'Revision Needed' },
                      { value: 'accepted' as const, label: 'Accepted (Lolos)' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setPortfolioStatus(opt.value)}
                        className={`p-2.5 text-xs font-bold rounded-lg border text-center transition-all ${
                          portfolioStatus === opt.value
                            ? 'border-e17-navy bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Keputusan Asesor */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Keputusan Asesor:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAssessorStatus('kompeten')}
                      className={`p-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        assessorStatus === 'kompeten'
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                          : 'border-emerald-200 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      KOMPETEN
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssessorStatus('belum_kompeten')}
                      className={`p-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        assessorStatus === 'belum_kompeten'
                          ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                          : 'border-rose-200 bg-rose-50/40 text-rose-800 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      BELUM KOMPETEN
                    </button>
                  </div>
                </div>

                {/* Catatan Asesor */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Catatan Asesor (Umpan Balik / Alasan Penilaian):
                  </label>
                  <textarea
                    rows={3}
                    value={assessorNotes}
                    onChange={(e) => setAssessorNotes(e.target.value)}
                    placeholder="Tuliskan umpan balik untuk portofolio atau instruksi revisi..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  />
                </div>

                {selectedStudent.assessedAt && (
                  <div className="text-[11px] text-slate-400 italic">
                    Terakhir dinilai pada: {selectedStudent.assessedAt}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => setSelectedStudent(null)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className="bg-e17-navy hover:bg-slate-800 text-white font-bold"
                onClick={handleSaveAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Penilaian
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
