"use client"

import * as React from "react"
import { ArrowLeft, FileText, CheckCircle2, Clock, Link as LinkIcon, Download, MessageSquare, AlertCircle, Check } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock Data
type Attachment = { name: string; size: string; type: string };
type Submission = {
  id: string;
  student: string;
  studentEmail: string;
  task: {
    title: string;
    description: string;
    dueDate: string;
    batch: string;
  };
  status: string;
  time: string;
  submittedAt: string;
  link: string;
  answerText: string;
  attachments: Attachment[];
  score: number | null;
  feedback: string | null;
}

const MOCK_SUBMISSIONS: Record<string, Submission> = {
  's1': {
    id: 's1', 
    student: 'Budi Santoso', 
    studentEmail: 'budi.santoso@example.com',
    task: {
      title: 'Tugas Modul 1: React Basic',
      description: 'Buatlah sebuah aplikasi counter sederhana menggunakan React hooks (useState).',
      dueDate: '2026-09-08 23:59',
      batch: 'Fullstack JS - Batch 3'
    },
    status: 'pending',
    time: '10 menit yang lalu', 
    submittedAt: '2026-09-07 09:40',
    link: 'https://github.com/budisantoso/react-basic', 
    answerText: 'Halo Kak, ini tugas saya.',
    attachments: [],
    score: null,
    feedback: null
  }
}

export default function MentorAssignmentDetailPage() {
  const params = useParams()
  
  // In real app, fetch data based on params.assignmentId
  const submissionId = typeof params.assignmentId === 'string' ? params.assignmentId : 's1'
  const submission = MOCK_SUBMISSIONS[submissionId as keyof typeof MOCK_SUBMISSIONS] || MOCK_SUBMISSIONS['s1']
  
  // Standard Grade State
  const [gradeInput, setGradeInput] = React.useState(submission.score?.toString() || "")
  const [feedbackInput, setFeedbackInput] = React.useState(submission.feedback || "")

  const handleGradeSubmit = () => {
    alert(`Tugas ${submission.student} dinilai ${gradeInput} dengan feedback: ${feedbackInput}`)
    // redirect or update state in real app
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <Link href="/mentor/assignments" className="text-sm font-semibold text-slate-500 hover:text-e17-navy flex items-center w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Tugas
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                submission.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {submission.status === 'graded' ? (
                  <><Check className="w-3 h-3 mr-1" /> Selesai Dinilai</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Perlu Dinilai</>
                )}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" /> Dikumpulkan {submission.submittedAt} ({submission.time})
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-e17-dark">{submission.task.title}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Oleh <span className="font-bold text-slate-700">{submission.student}</span> ({submission.studentEmail})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Task Detail & Student Answer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Instruksi Tugas */}
          <div className="card-clean p-6 bg-slate-50 border-slate-200">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Instruksi Tugas</h3>
            <p className="text-slate-700 text-sm leading-relaxed">{submission.task.description}</p>
          </div>

          {/* Jawaban Siswa */}
          <div className="card-clean p-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-e17-navy" /> Jawaban & Hasil Kerja
            </h3>
            
            <div className="space-y-6">
              {/* Text Answer */}
              {submission.answerText && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Catatan/Jawaban Teks</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.answerText}</p>
                </div>
              )}

              {/* Link */}
              {submission.link && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan (Link)</p>
                  <a href={submission.link} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-e17-navy hover:bg-slate-50 transition-colors group">
                    <div className="bg-slate-100 p-2 rounded-md group-hover:bg-blue-100 transition-colors mr-3">
                      <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-e17-navy" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 group-hover:underline truncate">{submission.link}</span>
                  </a>
                </div>
              )}

              {/* Attachments */}
              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">File Lampiran</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {submission.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white group hover:border-e17-navy transition-colors">
                        <div className="flex items-center min-w-0">
                          <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                          <div className="truncate pr-2">
                            <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-e17-navy hover:bg-blue-50 rounded-md transition-colors shrink-0">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Grading Panel */}
        <div className="lg:col-span-1">
          <div className="card-clean p-6 sticky top-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 border-b border-slate-100 pb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> Form Penilaian
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nilai Akhir (0-100)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0" max="100"
                    placeholder="Contoh: 90"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    disabled={submission.status === 'graded'}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-2xl font-black text-center focus:outline-none focus:border-e17-navy focus:ring-4 focus:ring-e17-navy/10 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Umpan Balik (Feedback)
                </label>
                <textarea
                  rows={6}
                  placeholder="Berikan saran atau apresiasi terkait hasil kerja siswa..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  disabled={submission.status === 'graded'}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 resize-none disabled:bg-slate-50 disabled:text-slate-500 leading-relaxed"
                ></textarea>
              </div>

              {submission.status === 'graded' ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-center">
                  <p className="text-sm font-bold text-emerald-700">Tugas ini sudah dinilai.</p>
                  <p className="text-xs text-emerald-600 mt-1">Siswa telah menerima notifikasi penilaian.</p>
                </div>
              ) : (
                <button 
                  onClick={handleGradeSubmit}
                  disabled={!gradeInput && submission.status !== 'graded'}
                  className="w-full bg-e17-navy hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Simpan Nilai & Feedback
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
