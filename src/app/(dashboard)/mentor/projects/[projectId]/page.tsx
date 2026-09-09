"use client"

import * as React from "react"
import { ArrowLeft, FileText, CheckCircle2, Clock, Link as LinkIcon, Download, MessageSquare, AlertCircle, Check } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock Data
const MOCK_PROJECTS = {
  's3': {
    id: 's3', 
    student: 'Andi Wijaya', 
    studentEmail: 'andi.wijaya@example.com',
    task: {
      title: 'Proyek Akhir: Wireframing',
      type: 'project',
      description: 'Rancang wireframe lengkap untuk aplikasi E-Commerce. Sertakan dokumentasi alur pengguna.',
      dueDate: '2026-09-15 23:59',
      batch: 'UI/UX Design - Batch 2'
    },
    status: 'pending',
    time: '2 jam yang lalu', 
    submittedAt: '2026-09-07 08:00',
    link: 'https://figma.com/file/12345/wireframe', 
    answerText: 'Mohon direview UX writing-nya juga kak.',
    attachments: [
      { name: 'user-flow.pdf', size: '1.2 MB', type: 'document' }
    ],
    score: null,
    feedback: null
  },
  's5': {
    id: 's5', 
    student: 'Eko Prasetyo', 
    studentEmail: 'eko.prasetyo@example.com',
    task: {
      title: 'Proyek Akhir: E-Commerce',
      type: 'project',
      description: 'Buat aplikasi e-commerce fullstack',
      dueDate: '2026-09-15 23:59',
      batch: 'Fullstack JS - Batch 3'
    },
    status: 'graded',
    time: '2 hari yang lalu', 
    submittedAt: '2026-09-05 08:00',
    link: 'https://github.com/eko/ecommerce', 
    answerText: 'Selesai kak.',
    attachments: [],
    score: 85,
    feedback: 'Sudah bagus.'
  }
}

export default function MentorProjectDetailPage() {
  const params = useParams()
  
  // In real app, fetch data based on params.projectId
  const projectId = typeof params.projectId === 'string' ? params.projectId : 's3'
  const project = MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] || MOCK_PROJECTS['s3']
  
  // Rubric State 
  const [rubric, setRubric] = React.useState({
    reqFulfillment: project.status === 'graded' ? 85 : 0,
    outputQuality: project.status === 'graded' ? 90 : 0,
    problemSolving: project.status === 'graded' ? 80 : 0,
    documentation: project.status === 'graded' ? 75 : 0,
  })

  const [feedbackInput, setFeedbackInput] = React.useState(project.feedback || "")

  // Calculate final score
  const finalScore = React.useMemo(() => {
    const score = (rubric.reqFulfillment * 0.3) + (rubric.outputQuality * 0.3) + (rubric.problemSolving * 0.2) + (rubric.documentation * 0.2)
    return Math.round(score)
  }, [rubric])

  const handleGradeSubmit = () => {
    alert(`Proyek ${project.student} dinilai ${finalScore} dengan feedback: ${feedbackInput}`)
    // redirect or update state in real app
  }

  // Handle number inputs to prevent NaN and limit to 0-100
  const handleRubricChange = (key: keyof typeof rubric, value: string) => {
    let numValue = parseInt(value)
    if (isNaN(numValue)) numValue = 0
    if (numValue > 100) numValue = 100
    if (numValue < 0) numValue = 0
    setRubric({ ...rubric, [key]: numValue })
  }

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
                  <><Check className="w-3 h-3 mr-1" /> Selesai Dinilai</>
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
            <p className="text-slate-700 text-sm leading-relaxed">{project.task.description}</p>
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
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Catatan/Jawaban Teks</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.answerText}</p>
                </div>
              )}

              {/* Link */}
              {project.link && (
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

              {/* Attachments */}
              {project.attachments && project.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">File Lampiran</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.attachments.map((file, idx) => (
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
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> Form Penilaian Rubrik
            </h3>

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
                    disabled={project.status === 'graded'}
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
                    disabled={project.status === 'graded'}
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
                    disabled={project.status === 'graded'}
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
                    disabled={project.status === 'graded'}
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
                  disabled={project.status === 'graded'}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 resize-none disabled:bg-slate-50 disabled:text-slate-500 leading-relaxed"
                ></textarea>
              </div>

              {project.status === 'graded' ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-center">
                  <p className="text-sm font-bold text-emerald-700">Proyek ini sudah dinilai.</p>
                  <p className="text-xs text-emerald-600 mt-1">Siswa telah menerima notifikasi penilaian.</p>
                </div>
              ) : (
                <button 
                  onClick={handleGradeSubmit}
                  disabled={finalScore === 0 && project.status !== 'graded'}
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
