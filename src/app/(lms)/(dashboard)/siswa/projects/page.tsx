"use client"

import * as React from "react"
import { UploadCloud, Clock, CheckCircle, FileText, AlertCircle, Loader2, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function SiswaProjectsPage() {
  const supabase = createClient()
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [uploadingTaskId, setUploadingTaskId] = React.useState<string | null>(null)
  const [submissionTexts, setSubmissionTexts] = React.useState<Record<string, string>>({})
  const [selectedFiles, setSelectedFiles] = React.useState<Record<string, File | null>>({})

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setIsLoading(false)
      return
    }

    const userId = userData.user.id

    // 1. Fetch Enrollments to get batch_ids
    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select('id, batch_id')
      .eq('user_id', userId)

    if (!enrollmentsData || enrollmentsData.length === 0) {
      setIsLoading(false)
      return
    }

    const batchIds = enrollmentsData.map((e: any) => e.batch_id).filter(Boolean)

    if (batchIds.length === 0) {
      setIsLoading(false)
      return
    }

    // 2. Fetch Tasks linked to sessions in these batches
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, title, batch_id, tasks(*), batches(name)')
      .in('batch_id', batchIds)
      .order('order_number', { ascending: true })

    if (!sessionsData) {
      setIsLoading(false)
      return
    }

    // 3. Fetch task submissions
    const { data: submissionsData } = await supabase
      .from('task_submissions')
      .select('*, manual_grades(score)')
      .eq('user_id', userId)

    // Build unified array
    const combinedAssignments: any[] = []
    
    sessionsData.forEach((session: any) => {
      if (session.tasks && session.tasks.length > 0) {
        session.tasks.forEach((task: any) => {
          // Only show final projects on this page
          if (!task.is_final_project) return;
          
          const submission = submissionsData?.find((s: any) => s.task_id === task.id)
          // Ensure manual_grades is correctly accessed (it could be an array or object depending on relationship)
          let grade = null;
          if (submission?.manual_grades) {
             if (Array.isArray(submission.manual_grades) && submission.manual_grades.length > 0) {
                 grade = submission.manual_grades[0].score;
             } else if (!Array.isArray(submission.manual_grades)) {
                 grade = (submission.manual_grades as any).score;
             }
          }

          let actualFileUrl = submission?.file_url || null
          let studentText = null
          
          if (actualFileUrl?.startsWith('{"url"')) {
            try {
              const parsed = JSON.parse(actualFileUrl)
              actualFileUrl = parsed.url
              studentText = parsed.text
            } catch (e) {}
          }

          combinedAssignments.push({
             id: task.id,
             title: task.title,
             session: session.title,
             batchName: session.batches?.name || 'Kelas Tidak Diketahui',
             deadlineRaw: task.deadline,
             deadline: new Date(task.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
             status: submission ? 'submitted' : 'pending',
             description: task.description,
             score: grade,
             feedback: submission?.feedback || null,
             feedbackBy: submission?.feedback_by || null,
             studentText: studentText,
             fileUrl: actualFileUrl,
             submissionType: submission?.submission_type || 'file_upload'
          })
        })
      }
    })

    setAssignments(combinedAssignments)
    setIsLoading(false)
  }

  const handleSubmit = async (taskId: string) => {
    const text = submissionTexts[taskId]
    const file = selectedFiles[taskId]
    
    if ((!text || text.trim() === '') && !file) {
      return toast.error("Silakan isi jawaban teks atau pilih file untuk diunggah.")
    }
    
    setUploadingTaskId(taskId)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const userId = userData.user.id
    let publicUrl = null

    try {
      // 1. Upload file if exists
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}_${taskId}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('task-submissions')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('task-submissions')
          .getPublicUrl(fileName)

        publicUrl = publicUrlData.publicUrl
      }

      // 2. Insert to task_submissions
      let fileUrlToSave = text.trim()
      if (publicUrl && text.trim()) {
        fileUrlToSave = JSON.stringify({ url: publicUrl, text: text.trim() })
      } else if (publicUrl) {
        fileUrlToSave = publicUrl
      }

      const { error: dbError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: userId,
          file_url: fileUrlToSave,
          submission_type: publicUrl ? 'file_upload' : 'text'
        })

      if (dbError) throw dbError

      toast.success("Jawaban berhasil dikirim!")
      setSubmissionTexts(prev => ({...prev, [taskId]: ""}))
      setSelectedFiles(prev => ({...prev, [taskId]: null}))
      fetchData()
    } catch (error: any) {
      toast.error("Gagal mengirim jawaban: " + error.message)
    } finally {
      setUploadingTaskId(null)
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

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-e17-navy" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Proyek Akhir</h1>
          <p className="text-sm text-slate-500 mt-1">Selesaikan proyek akhir untuk membuktikan keahlian Anda dan lulus dari program ini.</p>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {assignments.length === 0 && (
           <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">Belum ada proyek akhir yang diberikan.</div>
        )}
        
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card-clean overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {assignment.batchName}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {assignment.session}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-e17-dark">{assignment.title}</h3>
                </div>
                
                {assignment.status === "pending" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Belum Dikerjakan
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Telah Dikumpulkan
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100 w-fit">
                  <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                  Batas Waktu: <strong className="ml-1 text-e17-dark">{assignment.deadline}</strong>
                </div>
                {assignment.pdfUrl && (
                  <a href={assignment.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-e17-navy font-bold bg-blue-50 p-2.5 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors w-fit">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Soal (PDF)
                  </a>
                )}
              </div>
              
              <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-lg">
                {renderTextWithLinks(assignment.description)}
              </p>
            </div>

            <div className="p-6 bg-slate-50/50 flex-1">
              {assignment.status === "pending" ? (
                new Date() > new Date(assignment.deadlineRaw) ? (
                  <div className="text-center p-8 bg-rose-50 rounded-xl border border-rose-200">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                    <h3 className="font-bold text-rose-700">Waktu Pengumpulan Habis</h3>
                    <p className="text-sm text-rose-600 mt-1">Anda sudah tidak bisa mengumpulkan proyek akhir ini karena melewati batas waktu.</p>
                  </div>
                ) : (
                <div className="flex flex-col gap-5">
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 p-3">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-e17-navy" /> Ketik Jawaban & Unggah Berkas
                      </h4>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Teks/Tautan Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jawaban / Teks / Tautan</label>
                        <textarea 
                          className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-e17-navy focus:border-e17-navy outline-none bg-slate-50"
                          placeholder="Ketik jawaban Anda di sini, atau tempel tautan (link) Google Drive / GitHub..."
                          value={submissionTexts[assignment.id] || ""}
                          onChange={(e) => setSubmissionTexts({...submissionTexts, [assignment.id]: e.target.value})}
                          disabled={uploadingTaskId === assignment.id}
                        ></textarea>
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lampiran File (Opsional)</label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors relative">
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              onChange={(e) => {
                                 if(e.target.files && e.target.files[0]) {
                                   setSelectedFiles({...selectedFiles, [assignment.id]: e.target.files[0]})
                                 }
                              }}
                              disabled={uploadingTaskId === assignment.id}
                              title="Pilih file untuk diunggah"
                            />
                            {selectedFiles[assignment.id] ? (
                              <div className="flex items-center text-emerald-600 font-bold text-sm">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {selectedFiles[assignment.id]?.name}
                              </div>
                            ) : (
                              <div className="flex items-center text-slate-500 text-sm font-medium">
                                <UploadCloud className="h-4 w-4 mr-2" /> Pilih Berkas (PDF/ZIP/DOCX)
                              </div>
                            )}
                          </label>
                          {selectedFiles[assignment.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setSelectedFiles({...selectedFiles, [assignment.id]: null})}
                              disabled={uploadingTaskId === assignment.id}
                            >
                              Batal
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <Button 
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={uploadingTaskId === assignment.id || (!submissionTexts[assignment.id]?.trim() && !selectedFiles[assignment.id])}
                          className="bg-e17-navy text-white hover:bg-blue-900 px-6"
                        >
                          {uploadingTaskId === assignment.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Kirim Jawaban
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                )
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 w-32">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Nilai</span>
                    <span className="text-4xl font-black text-e17-dark">{assignment.score !== null ? assignment.score : '-'}</span>
                    <span className="text-xs text-slate-400 mt-1">/ 100</span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full flex flex-col gap-3">
                    {assignment.fileUrl && assignment.submissionType === 'file_upload' && (
                      <a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-emerald-700 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Lihat File yang Dikumpulkan
                      </a>
                    )}
                    
                    {/* Jawaban Teks Siswa */}
                    {assignment.submissionType === 'text' && assignment.fileUrl && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-xs uppercase font-bold text-blue-700 mb-2 flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1" /> Jawaban Anda:
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(assignment.fileUrl)}</p>
                      </div>
                    )}
                    {assignment.submissionType === 'file_upload' && assignment.studentText && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-xs uppercase font-bold text-blue-700 mb-2 flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1" /> Catatan Anda:
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(assignment.studentText)}</p>
                      </div>
                    )}

                    {/* Catatan Mentor */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <h4 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Catatan Mentor:
                      </h4>
                      <p className="text-sm text-slate-700 italic">
                        {assignment.feedback ? `"${assignment.feedback}"` : "Belum ada catatan dari mentor."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MessageSquare(props: any) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
