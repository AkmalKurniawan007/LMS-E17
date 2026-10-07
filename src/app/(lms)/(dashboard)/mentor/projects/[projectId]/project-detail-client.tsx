"use client"

import * as React from "react"
import { ArrowLeft, FileText, CheckCircle2, Clock, Link as LinkIcon, Download, MessageSquare, AlertCircle, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { gradeSubmission, type SubmissionDetail } from "../actions"
import { Loader2, Edit3, ExternalLink } from "lucide-react"

interface ProjectDetailClientProps {
  submission: SubmissionDetail
}

export default function ProjectDetailClient({ submission: initialSubmission }: ProjectDetailClientProps) {
  const router = useRouter()
  const [submission, setSubmission] = React.useState<SubmissionDetail>(initialSubmission)
  const project = submission // alias for easier reading
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(project.status === 'pending')
  
  // Rubric State 
  // Rubric State (since we don't store individual rubric component values in DB, we'll initialize randomly if graded or just use total score)
  const [rubric, setRubric] = React.useState({
    reqFulfillment: project.status === 'graded' && project.score ? Math.round(project.score * 0.3) : 0, // approximation
    outputQuality: project.status === 'graded' && project.score ? Math.round(project.score * 0.3) : 0,
    problemSolving: project.status === 'graded' && project.score ? Math.round(project.score * 0.2) : 0,
    documentation: project.status === 'graded' && project.score ? Math.round(project.score * 0.2) : 0,
  })

  const [feedbackInput, setFeedbackInput] = React.useState(project.feedback || "")

  // Calculate final score
  const finalScore = React.useMemo(() => {
    const score = (rubric.reqFulfillment * 0.3) + (rubric.outputQuality * 0.3) + (rubric.problemSolving * 0.2) + (rubric.documentation * 0.2)
    return Math.round(score)
  }, [rubric])

  const handleGradeSubmit = async () => {
    if (finalScore < 0 || finalScore > 100) {
      toast.error("Nilai harus berupa angka antara 0 sampai 100")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await gradeSubmission(project.id, finalScore, feedbackInput)
      if (res.success) {
        toast.success("Penilaian proyek akhir berhasil disimpan!")
        setSubmission(prev => ({
          ...prev,
          status: 'graded',
          score: finalScore,
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

  // Handle number inputs to prevent NaN and limit to 0-100
  const handleRubricChange = (key: keyof typeof rubric, value: string) => {
    let numValue = parseInt(value)
    if (isNaN(numValue)) numValue = 0
    if (numValue > 100) numValue = 100
    if (numValue < 0) numValue = 0
    setRubric({ ...rubric, [key]: numValue })
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
        <Link href="/mentor/projects" className="text-sm font-semibold text-slate-500 hover:text-e17-navy flex items-center w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Proyek Akhir
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                project.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {project.status === 'graded' ? (
                  <><Check className="w-3 h-3 mr-1" /> Selesai Dinilai ({project.score}/100)</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Perlu Dinilai</>
                )}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" /> Dikumpulkan {project.submittedAt} ({project.time})
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-e17-dark">{project.task.title}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Oleh <span className="font-bold text-slate-700">{project.student}</span> ({project.studentEmail})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Task Detail & Student Answer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Instruksi Tugas */}
          <div className="card-clean p-6 bg-slate-50 border-slate-200">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Instruksi Proyek</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(project.task.description)}</p>
          </div>

          {/* Jawaban Siswa */}
          <div className="card-clean p-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-e17-navy" /> Jawaban & Hasil Kerja
            </h3>
            
            <div className="space-y-6">
              {/* Text Answer */}
              {project.answerText && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Catatan / Jawaban Teks</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{renderTextWithLinks(project.answerText)}</p>
                </div>
              )}

              {/* Link */}
              {project.link && project.submissionType === 'link' && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan (Link)</p>
                  <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-e17-navy hover:bg-slate-50 transition-colors group">
                    <div className="bg-slate-100 p-2 rounded-md group-hover:bg-blue-100 transition-colors mr-3">
                      <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-e17-navy" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 group-hover:underline truncate">{project.link}</span>
                  </a>
                </div>
              )}

              {/* File / Download card */}
              {project.link && project.submissionType === 'file_upload' && (
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
                               const extParts = project.link.split('.');
                               const ext = extParts.length > 1 ? `.${extParts[extParts.length - 1].split('?')[0]}` : '';
                               return `File_Proyek_${project.student.replace(/\s+/g, '_')}${ext}`;
                            })()}
                          </p>
                          <p className="text-[11px] text-slate-400">Klik untuk melihat atau mengunduh</p>
                        </div>
                      </div>
                      <a 
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-e17-navy text-slate-700 rounded-md transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Buka / Unduh
                      </a>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Grading Panel */}
        <div className="lg:col-span-1">
          <div className="card-clean p-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-e17-dark flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> Form Penilaian Rubrik
              </h3>
              {project.status === 'graded' && !isEditing && (
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
              {/* Rubric Inputs using number typed input */}
              <div className="space-y-4">
                {/* Requirement Fulfillment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kesesuaian Kebutuhan (30%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={rubric.reqFulfillment || ''}
                    onChange={(e) => handleRubricChange('reqFulfillment', e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    placeholder="0-100"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-e17-navy/50 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {/* Output Quality */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kualitas Hasil (30%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={rubric.outputQuality || ''}
                    onChange={(e) => handleRubricChange('outputQuality', e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    placeholder="0-100"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-e17-navy/50 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {/* Problem Solving / Logic */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Analisis & Logika (20%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={rubric.problemSolving || ''}
                    onChange={(e) => handleRubricChange('problemSolving', e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    placeholder="0-100"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-e17-navy/50 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {/* Documentation */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dokumentasi & Kerapian (20%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={rubric.documentation || ''}
                    onChange={(e) => handleRubricChange('documentation', e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    placeholder="0-100"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-e17-navy/50 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Final Score Display */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Nilai Akhir (Kalkulasi Otomatis)</label>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg py-4 text-4xl font-black text-center text-e17-dark">
                  {finalScore}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Umpan Balik (Feedback)
                </label>
                <textarea
                  rows={6}
                  placeholder="Berikan saran atau apresiasi terkait proyek akhir ini..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  disabled={!isEditing || isSubmitting}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 resize-none disabled:bg-slate-50 disabled:text-slate-500 leading-relaxed"
                ></textarea>
              </div>

              {project.status === 'graded' && !isEditing ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-center">
                    <p className="text-sm font-bold text-emerald-700">Proyek ini sudah dinilai.</p>
                    {project.feedbackAt && (
                      <p className="text-xs text-emerald-600 mt-1">Terakhir diperbarui: {project.feedbackAt}</p>
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
                    onClick={handleGradeSubmit}
                    disabled={isSubmitting || (finalScore === 0 && project.status !== 'graded')}
                    className="w-full bg-e17-navy hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                    ) : (
                      "Simpan Nilai & Feedback"
                    )}
                  </button>

                  {project.status === 'graded' && isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackInput(project.feedback || "")
                        // Reset rubric approximation
                        setRubric({
                          reqFulfillment: project.score ? Math.round(project.score * 0.3) : 0,
                          outputQuality: project.score ? Math.round(project.score * 0.3) : 0,
                          problemSolving: project.score ? Math.round(project.score * 0.2) : 0,
                          documentation: project.score ? Math.round(project.score * 0.2) : 0,
                        })
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
