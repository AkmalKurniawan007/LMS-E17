"use client"

import * as React from "react"
import { ArrowLeft, FileText, CheckCircle2, Clock, Link as LinkIcon, Download, MessageSquare, AlertCircle, Check, Loader2, Edit3, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { gradeSubmission, type SubmissionDetail } from "../actions"

interface AssignmentDetailClientProps {
  submission: SubmissionDetail
}

export default function AssignmentDetailClient({ submission: initialSubmission }: AssignmentDetailClientProps) {
  const router = useRouter()
  const [submission, setSubmission] = React.useState<SubmissionDetail>(initialSubmission)
  const [gradeInput, setGradeInput] = React.useState(submission.score !== null ? submission.score.toString() : "")
  const [feedbackInput, setFeedbackInput] = React.useState(submission.feedback || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(submission.status === 'pending')

  const isLinkUrl = React.useMemo(() => {
    return Boolean(submission.link && (submission.link.startsWith("http://") || submission.link.startsWith("https://")))
  }, [submission.link])

  const fileName = React.useMemo(() => {
    if (!submission.link) return "Lampiran Tugas"
    try {
      const parsed = new URL(submission.link)
      const parts = parsed.pathname.split("/").filter(Boolean)
      if (parts.length > 0) {
        return decodeURIComponent(parts[parts.length - 1])
      }
    } catch {
      // not a URL
    }
    return "Berkas Tugas"
  }, [submission.link])

  const handleGradeSubmit = async () => {
    const numScore = parseFloat(gradeInput)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error("Nilai harus berupa angka antara 0 sampai 100")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await gradeSubmission(submission.id, numScore, feedbackInput)
      if (res.success) {
        toast.success("Nilai dan umpan balik berhasil disimpan!")
        setSubmission(prev => ({
          ...prev,
          status: 'graded',
          score: numScore,
          feedback: feedbackInput,
          feedbackAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        setIsEditing(false)
        router.refresh()
      } else {
        toast.error(res.error || "Gagal menyimpan penilaian")
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan saat menyimpan penilaian")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderTextWithLinks = (text: string) => {
    if (!text) return "Tidak ada deskripsi.";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{part}</a>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/mentor/assignments" 
          className="text-sm font-semibold text-slate-500 hover:text-e17-navy flex items-center w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Tugas
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                submission.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {submission.status === 'graded' ? (
                  <><Check className="w-3 h-3 mr-1" /> Selesai Dinilai ({submission.score}/100)</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Perlu Dinilai</>
                )}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-slate-400" /> Dikumpulkan {submission.submittedAt} ({submission.time})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-e17-dark">{submission.task.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm font-medium text-slate-500">
              <span>Oleh <strong className="text-slate-800">{submission.student}</strong></span>
              <span>•</span>
              <span className="text-slate-600">{submission.studentEmail}</span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                {submission.task.batch}
              </span>
              {submission.task.program && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                  {submission.task.program}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Task Detail & Student Answer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Instruksi Tugas */}
          <div className="card-clean p-6 bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Instruksi Tugas</h3>
              {submission.task.dueDate && (
                <span className="text-xs font-semibold text-slate-500">
                  Tenggat: <span className="text-slate-700">{submission.task.dueDate}</span>
                </span>
              )}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {submission.task.description ? renderTextWithLinks(submission.task.description) : "Tidak ada rincian instruksi khusus untuk tugas ini."}
            </p>
          </div>

          {/* Jawaban Siswa */}
          <div className="card-clean p-6 space-y-6">
            <h3 className="font-bold text-lg text-e17-dark border-b border-slate-100 pb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-e17-navy" /> Jawaban & Hasil Kerja Siswa
            </h3>
            
            {/* Text Answer */}
            {submission.answerText && (
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Catatan / Jawaban Teks</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(submission.answerText)}</p>
              </div>
            )}

            {/* Lampiran */}
            {submission.link ? (
              <div className="space-y-4">
                {submission.submissionType === 'link' && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan Tugas / Berkas</p>
                    {isLinkUrl ? (
                      <a 
                        href={submission.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-e17-navy hover:bg-slate-50 transition-colors group"
                    >
                      <div className="bg-slate-100 p-2 rounded-md group-hover:bg-blue-100 transition-colors mr-3 shrink-0">
                        <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-e17-navy" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-blue-600 group-hover:underline truncate block">
                          {submission.link}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          Buka di tab baru <ExternalLink className="w-3 h-3 ml-1" />
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono break-all">
                      {submission.link}
                    </div>
                  )}
                </div>
                )}

                {/* File / Download card */}
                {submission.submissionType === 'file_upload' && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lampiran File</p>
                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg bg-white group hover:border-e17-navy transition-colors">
                      <div className="flex items-center min-w-0 mr-3">
                        <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-blue-50">
                          <FileText className="w-5 h-5 text-slate-500 group-hover:text-e17-navy" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {(() => {
                               const extParts = submission.link.split('.');
                               const ext = extParts.length > 1 ? `.${extParts[extParts.length - 1].split('?')[0]}` : '';
                               return `File_Tugas_${submission.student.replace(/\s+/g, '_')}${ext}`;
                            })()}
                          </p>
                          <p className="text-[11px] text-slate-400">Klik untuk melihat atau mengunduh</p>
                        </div>
                      </div>
                      <a 
                        href={submission.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-e17-navy text-slate-700 rounded-md transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : !submission.answerText ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 text-center">
                Tidak ada berkas atau tautan yang dilampirkan oleh siswa.
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Grading Panel */}
        <div className="lg:col-span-1">
          <div className="card-clean p-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-e17-dark flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> Form Penilaian
              </h3>
              {submission.status === 'graded' && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-e17-navy hover:underline flex items-center"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Ubah
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nilai Akhir (0-100)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Contoh: 85"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-2xl font-black text-center focus:outline-none focus:border-e17-navy focus:ring-4 focus:ring-e17-navy/10 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Umpan Balik (Feedback)
                </label>
                <textarea
                  rows={5}
                  placeholder="Berikan saran, masukan perbaikan, atau apresiasi terkait hasil kerja siswa..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  disabled={!isEditing || isSubmitting}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 resize-none disabled:bg-slate-50 disabled:text-slate-500 leading-relaxed"
                />
              </div>

              {submission.status === 'graded' && !isEditing ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-center">
                    <p className="text-sm font-bold text-emerald-700">Tugas ini sudah dinilai</p>
                    {submission.feedbackAt && (
                      <p className="text-xs text-emerald-600 mt-1">Terakhir diperbarui: {submission.feedbackAt}</p>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Perbarui Nilai & Umpan Balik
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    type="button"
                    onClick={handleGradeSubmit}
                    disabled={isSubmitting || !gradeInput}
                    className="w-full bg-e17-navy hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      "Simpan Nilai & Feedback"
                    )}
                  </button>

                  {submission.status === 'graded' && isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setGradeInput(submission.score?.toString() || "")
                        setFeedbackInput(submission.feedback || "")
                        setIsEditing(false)
                      }}
                      disabled={isSubmitting}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
