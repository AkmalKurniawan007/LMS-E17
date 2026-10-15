"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BookOpen, Clock, Lock, PlayCircle, CheckCircle, Video, MapPin, Download, ArrowRight, ArrowUpRight, Loader2, UserCheck, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Tier, getCapabilityAccess } from "@/lib/access-tier"
import { BnspLockedBanner, UPGRADE_URL } from "@/components/bnsp/BnspLockedBanner"

function CoursesContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const lockedParam = searchParams.get('locked')

  const [userTier, setUserTier] = React.useState<Tier>('bootcamp')
  const [sessions, setSessions] = React.useState<any[]>([])
  const [courseData, setCourseData] = React.useState<any>({ name: "Memuat...", batch: "...", mentor: "...", progress: 0, completed: 0, total: 0, startDate: null })
  const [attendances, setAttendances] = React.useState<Record<string, boolean>>({}) // mapping sessionId to hasAttended
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAbsenLoading, setIsAbsenLoading] = React.useState<string | null>(null)

  const bnspAccess = getCapabilityAccess(userTier, 'bnsp_exam')

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

    // 1. Fetch Enrollment to get batch_id and tier
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('batch_id, tier')
      .eq('user_id', userData.user.id)
      .single()

    if (!enrollmentData) {
      setCourseData({ name: "Anda Belum Terdaftar", batch: "-", mentor: "-", progress: 0, completed: 0, total: 0, startDate: null })
      setIsLoading(false)
      return
    }

    if (enrollmentData.tier) {
      setUserTier(enrollmentData.tier as Tier)
    }

    const batchId = enrollmentData.batch_id

    // 2. Fetch Batch Info
    const { data: batchData } = await supabase
      .from('batches')
      .select(`
        name,
        start_date,
        programs ( name )
      `)
      .eq('id', batchId)
      .single()

    // 3. Fetch Sessions & Materials, Quizzes, and Tasks with is_bnsp flag
    const { data: sessData } = await supabase.from('sessions')
      .select('*, materials(*), quizzes(id, title, is_bnsp), tasks(id, title, is_bnsp)')
      .eq('batch_id', batchId)
      .order('order_number', { ascending: true })

    // 4. Fetch Attendances for this user
    const { data: attData } = await supabase.from('attendances')
      .select('session_id')
      .eq('user_id', userData.user.id)

    const attMap: Record<string, boolean> = {}
    if (attData) {
      attData.forEach(a => attMap[a.session_id] = true)
    }
      
    if (sessData) {
      setSessions(sessData)
      const totalSess = sessData.length
      const compSess = sessData.filter(s => s.status === 'completed').length
      const prog = totalSess > 0 ? Math.round((compSess / totalSess) * 100) : 0
      
      setCourseData({
        name: (batchData?.programs as any)?.name || "Program",
        batch: batchData?.name || "Batch",
        mentor: "Mentor Kelas",
        progress: prog,
        completed: compSess,
        total: totalSess,
        startDate: batchData?.start_date
      })
    }
    
    setAttendances(attMap)
    setIsLoading(false)
  }

  const handleKlikAbsen = async (sessionId: string) => {
    setIsAbsenLoading(sessionId)
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error } = await supabase
      .from('attendances')
      .insert({
        session_id: sessionId,
        user_id: userData.user.id,
        source: 'roll_call_online'
      })

    if (error) {
      toast.error("Gagal melakukan absensi: " + error.message)
    } else {
      toast.success("Absensi berhasil dicatat!")
      setAttendances(prev => ({ ...prev, [sessionId]: true }))
    }
    
    setIsAbsenLoading(null)
  }

  if (isLoading) {
     return <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-e17-navy" /></div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Banner info saat dialihkan karena hak BNSP terkunci */}
      {lockedParam === 'bnsp' && (
        <div className="animate-in fade-in slide-in-from-top-3">
          <BnspLockedBanner />
        </div>
      )}

      {/* Header Gabungan */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Materi Belajar</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-slate-600">{courseData.name}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
              {courseData.batch}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Mentor: {courseData.mentor}</p>
        </div>
        
        <div className="w-full md:w-64 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-600 font-bold">Progres Kelas</span>
            <span className="font-black text-e17-navy">{courseData.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-e17-navy h-2 rounded-full transition-all duration-500" style={{ width: `${courseData.progress}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-right">{courseData.completed} dari {courseData.total} Sesi Selesai</p>
        </div>
      </div>

      {/* List of Sessions */}
      <div className="space-y-4 mt-6">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">Anda belum terdaftar di kelas manapun atau belum ada sesi.</div>
        ) : sessions.map((session, idx) => {
          const firstMaterialId = session.materials && session.materials.length > 0 ? session.materials[0].id : null;
          const status = session.status; 
          const sessionMode = session.session_type === 'online' ? 'Online' : 'Offline';
          const sessionDate = session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum ditentukan';
          const hasAttended = attendances[session.id] || false;
          
          // Determine if materials are accessible (H-1 of Batch Start Date)
          const batchStart = courseData.startDate ? new Date(courseData.startDate) : null;
          let canAccessMaterials = true;
          if (batchStart) {
            const hMinusOne = new Date(batchStart.getTime() - (24 * 60 * 60 * 1000));
            if (new Date() < hMinusOne) {
              canAccessMaterials = false;
            }
          }
          
          return (
          <div 
            key={session.id} 
            className={`card-clean overflow-hidden transition-all ${
              status === 'not_started' ? 'bg-slate-50' : 
              status === 'ongoing' ? 'border-e17-navy ring-1 ring-e17-navy shadow-md bg-white' : 'bg-white'
            }`}
          >
            <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">
              
              {/* Status Icon */}
              <div className="shrink-0 mt-1 hidden sm:block">
                {status === 'ongoing' ? (
                  <div className="h-12 w-12 rounded-full bg-e17-primary/10 flex items-center justify-center border border-e17-primary/20">
                    <PlayCircle className="h-6 w-6 text-e17-primary animate-pulse" />
                  </div>
                ) : status === 'completed' ? (
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 opacity-50">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                  <h3 className={`font-bold text-lg leading-tight ${status === 'not_started' ? 'text-slate-600' : 'text-e17-dark'}`}>
                    {session.title}
                  </h3>
                  
                  {/* Mode & Date Badges */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                      sessionMode === 'Online' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {sessionMode === 'Online' ? <Video className="w-3.5 h-3.5 mr-1.5" /> : <MapPin className="w-3.5 h-3.5 mr-1.5" />}
                      Kelas {sessionMode}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {sessionDate}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Materi Tersedia</p>
                  <div className="flex flex-wrap gap-2">
                    {session.materials && session.materials.length > 0 ? (
                      session.materials.map((mat: any, i: number) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></div>
                          {mat.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada materi yang diunggah mentor.</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
                  
                  {/* Gabung Meeting */}
                  {sessionMode === 'Online' && session.meeting_link && (
                    <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold">
                        <Video className="h-4 w-4 mr-2" /> Gabung Meeting
                      </Button>
                    </a>
                  )}

                  {/* Klik Absen (Online & Offline) */}
                  {hasAttended ? (
                    <Button variant="outline" disabled className="w-full sm:w-auto border-emerald-200 bg-emerald-50 text-emerald-700 font-bold opacity-100">
                      <UserCheck className="h-4 w-4 mr-2" /> Sudah Absen
                    </Button>
                  ) : status === 'ongoing' ? (
                    <Button 
                      onClick={() => handleKlikAbsen(session.id)}
                      disabled={isAbsenLoading === session.id}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                    >
                      {isAbsenLoading === session.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <MapPin className="h-4 w-4 mr-2" />} 
                      Klik Absen Sekarang
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full sm:w-auto border-slate-200 bg-slate-50 text-slate-400 font-bold">
                      <MapPin className="h-4 w-4 mr-2" /> Klik Absen (Terkunci)
                    </Button>
                  )}
                  
                  {/* Mulai Belajar */}
                  {!canAccessMaterials ? (
                     <Button variant="outline" disabled className="w-full sm:w-auto ml-auto bg-slate-50 text-slate-400 border-slate-200 font-bold" title="Akses dibuka H-1 kelas dimulai">
                       Belum Waktunya <Lock className="h-4 w-4 ml-2" />
                     </Button>
                  ) : (
                    <Link href={firstMaterialId ? `/siswa/learn/${session.id}/${firstMaterialId}` : '#'} className="w-full sm:w-auto ml-auto">
                      <Button variant="orange" className="w-full font-bold shadow-md" disabled={!firstMaterialId}>
                        {firstMaterialId ? 'Mulai Belajar' : 'Materi Kosong'} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}

                  {/* Kerjakan Tugas */}
                  {session.tasks && session.tasks.map((task: any) => {
                    const isBnsp = Boolean(task.is_bnsp)
                    if (isBnsp && bnspAccess === 'hidden') return null

                    if (isBnsp && bnspAccess === 'locked') {
                      return (
                        <div key={`task-${task.id}`} className="w-full mt-2 p-3 rounded-xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 text-amber-900">
                            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="text-xs font-bold">{task.title || "Tugas Portofolio BNSP"} (Terkunci)</span>
                          </div>
                          <a
                            href={UPGRADE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0"
                          >
                            Upgrade ke Paket 3
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )
                    }

                    return canAccessMaterials ? (
                      <Link key={`task-${task.id}`} href={`/siswa/assignments/${task.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 shadow-sm">
                          <FileText className="h-4 w-4 mr-2" /> Kerjakan Tugas {isBnsp ? "(BNSP)" : ""}
                        </Button>
                      </Link>
                    ) : (
                      <Button key={`task-${task.id}`} variant="outline" disabled className="w-full sm:w-auto bg-slate-50 text-slate-400 border-slate-200 font-bold">
                        <FileText className="h-4 w-4 mr-2" /> Tugas Terkunci
                      </Button>
                    )
                  })}

                  {/* Kerjakan Kuis */}
                  {session.quizzes && session.quizzes.map((quiz: any) => {
                    const isBnsp = Boolean(quiz.is_bnsp)
                    if (isBnsp && bnspAccess === 'hidden') return null

                    if (isBnsp && bnspAccess === 'locked') {
                      return (
                        <div key={`quiz-${quiz.id}`} className="w-full mt-2 p-3 rounded-xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 text-amber-900">
                            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="text-xs font-bold">{quiz.title || "Kuis Teori BNSP"} (Terkunci)</span>
                          </div>
                          <a
                            href={UPGRADE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0"
                          >
                            Upgrade ke Paket 3
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )
                    }

                    return canAccessMaterials ? (
                      <Link key={`quiz-${quiz.id}`} href={`/siswa/quiz/${quiz.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full border-purple-200 bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 shadow-sm">
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Kerjakan Kuis {isBnsp ? "(BNSP)" : ""}
                        </Button>
                      </Link>
                    ) : (
                      <Button key={`quiz-${quiz.id}`} variant="outline" disabled className="w-full sm:w-auto bg-slate-50 text-slate-400 border-slate-200 font-bold">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Kuis Terkunci
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SiswaCoursesPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-e17-navy" /></div>}>
      <CoursesContent />
    </React.Suspense>
  )
}
