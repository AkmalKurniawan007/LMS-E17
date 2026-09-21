"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, UploadCloud, Link as LinkIcon, FileText, CheckCircle2, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { logAction } from "@/utils/logger-actions"

export default function AssignmentSubmissionPage() {
  const params = useParams()
  const assignmentId = params.assignmentId as string
  const supabase = createClient()

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [notesInput, setNotesInput] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const [taskData, setTaskData] = React.useState<any>(null)
  const [submissionData, setSubmissionData] = React.useState<any>(null)
  const [sessionTitle, setSessionTitle] = React.useState("")

  React.useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // 1. Fetch Task Details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, sessions(title)')
      .eq('id', assignmentId)
      .single()

    if (taskError || !task) {
      toast.error("Gagal memuat tugas.")
      setIsLoading(false)
      return
    }
    setTaskData(task)
    setSessionTitle(task.sessions?.title || "")

    // 2. Fetch Submission
    const { data: submission } = await supabase
      .from('task_submissions')
      .select('*, manual_grades(score)')
      .eq('task_id', assignmentId)
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (submission) {
      setSubmissionData(submission)
    }

    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (!notesInput.trim() && !selectedFile) {
      return toast.error("Silakan isi catatan atau unggah file tugas Anda.")
    }
    
    setIsSubmitting(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const userId = userData.user.id
    let publicUrl = null

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${userId}_${assignmentId}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('task-submissions')
          .upload(fileName, selectedFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('task-submissions')
          .getPublicUrl(fileName)

        publicUrl = publicUrlData.publicUrl
      }

      let fileUrlToSave = notesInput.trim()
      if (publicUrl && notesInput.trim()) {
        fileUrlToSave = JSON.stringify({ url: publicUrl, text: notesInput.trim() })
      } else if (publicUrl) {
        fileUrlToSave = publicUrl
      }

      const { error: dbError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: assignmentId,
          user_id: userId,
          file_url: fileUrlToSave,
          submission_type: publicUrl ? 'file_upload' : 'text'
        })

      if (dbError) throw dbError

      await logAction('siswa', 'Pengumpulan Tugas', `Mengumpulkan tugas harian (Task ID: ${assignmentId})`, { user_id: userId, target_id: assignmentId })
      toast.success("Tugas berhasil dikumpulkan!")
      fetchData()
    } catch (error: any) {
      toast.error("Gagal mengumpulkan: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-e17-navy" /></div>
  }

  if (!taskData) {
    return <div className="text-center py-32 text-slate-500">Tugas tidak ditemukan.</div>
  }

  const isSubmitted = !!submissionData
  const isPastDeadline = taskData.deadline ? new Date() > new Date(taskData.deadline) : false
  const score = submissionData?.manual_grades ? (Array.isArray(submissionData.manual_grades) ? submissionData.manual_grades[0]?.score : submissionData.manual_grades.score) : null

  let parsedSubmissionFileUrl = submissionData?.file_url
  let parsedSubmissionText = null
  if (parsedSubmissionFileUrl?.startsWith('{"url"')) {
    try {
      const parsed = JSON.parse(parsedSubmissionFileUrl)
      parsedSubmissionFileUrl = parsed.url
      parsedSubmissionText = parsed.text
    } catch (e) {}
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
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/siswa/assignments">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pengumpulan Tugas</h1>
          <p className="text-sm text-gray-500">{sessionTitle}</p>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">{taskData.title}</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Batas Waktu:</span>
              <span className="font-semibold text-red-600">{new Date(taskData.deadline).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
            <p>{renderTextWithLinks(taskData.description)}</p>
          </div>
          {taskData.pdf_url && (
            <div className="mt-4">
               <a href={taskData.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-bold text-e17-navy bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
                 <FileText className="w-4 h-4 mr-2" /> Lihat Lampiran Soal
               </a>
            </div>
          )}
        </div>
      </div>

      {/* Mentor Feedback Section (If Graded) */}
      {score !== null && score !== undefined && (
        <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm overflow-hidden p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-green-800 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Tugas Telah Dinilai
            </h3>
            <div className="text-2xl font-extrabold text-green-700">{score} <span className="text-sm font-medium text-green-600">/ 100</span></div>
          </div>
          
          {submissionData?.feedback && (
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                Catatan dari Mentor
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{submissionData.feedback}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {isSubmitted ? "Hasil Pengumpulan Anda" : "Form Pengumpulan"}
          </h3>
          
          {!isSubmitted ? (
            isPastDeadline ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-center">
                 <h4 className="font-bold text-rose-700 mb-2">Waktu Pengumpulan Habis</h4>
                 <p className="text-sm text-rose-600">Anda sudah tidak bisa mengumpulkan tugas ini karena melewati batas waktu.</p>
              </div>
            ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-1">
                    Jawaban / Teks / Tautan
                  </label>
                  <textarea 
                    id="notes" 
                    rows={4}
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-e17-yellow focus-visible:border-e17-yellow"
                    placeholder="Ketik jawaban Anda atau tautan (Google Drive / GitHub) di sini..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Lampiran File (Opsional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        disabled={isSubmitting} 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0])
                          }
                        }}
                      />
                      {selectedFile ? (
                        <div className="flex items-center text-emerald-600 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          {selectedFile.name}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 text-sm font-medium">
                          <UploadCloud className="h-5 w-5 mr-2 text-gray-400" />
                          Pilih Berkas Tugas (PDF/ZIP/DOCX)
                        </div>
                      )}
                    </label>
                    {selectedFile && (
                      <Button
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => setSelectedFile(null)}
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                    )}
                  </div>
                </div>

                <Button 
                  variant="orange" 
                  disabled={isSubmitting || (!notesInput.trim() && !selectedFile)} 
                  onClick={handleSubmit} 
                  className="w-full text-[#1A1A1A] font-bold h-12 hover:bg-yellow-500 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : 'Kirim Jawaban'}
                </Button>
              </div>
            </div>
            )
          ) : (
            // Submitted State View
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <ClockIcon className="mr-2 h-4 w-4" />
                Dikumpulkan pada: <span className="font-medium text-gray-900 ml-1">{new Date(submissionData.created_at).toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {submissionData.submission_type === 'file_upload' && parsedSubmissionFileUrl && (
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="min-w-0 flex-1">
                      <a href={parsedSubmissionFileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 truncate hover:underline block">
                        Lihat File yang Dikumpulkan
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Text/Notes rendering */}
                {(submissionData.submission_type === 'text' || submissionData.submission_type === 'link') && (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                    <h4 className="text-xs uppercase font-bold text-blue-700 mb-2 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" /> Jawaban Anda
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(parsedSubmissionFileUrl)}</p>
                  </div>
                )}
                
                {submissionData.submission_type === 'file_upload' && parsedSubmissionText && (
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                    <h4 className="text-xs uppercase font-bold text-blue-700 mb-2 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" /> Catatan Anda
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(parsedSubmissionText)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

