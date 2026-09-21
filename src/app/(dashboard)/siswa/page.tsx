"use client"

import Link from "next/link"
import { BookOpen, CheckCircle, Clock, FileText, ChevronRight, Video, MapPin, PlayCircle, Percent, AlertCircle, Calendar, Loader2, Megaphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import * as React from "react"
import { CalendarWidget, type CalendarEvent } from "@/components/ui/calendar-widget"
import { programs, formatPrice } from "@/components/marketing/data/marketing-data"

export default function SiswaDashboardPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(true)
  const [calendarEvents, setCalendarEvents] = React.useState<{date: string, items: CalendarEvent[]}[]>([])
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<CalendarEvent[]>([])

  // Dashboard Data State
  const [activeBootcamp, setActiveBootcamp] = React.useState<any>(null)
  const [nextSession, setNextSession] = React.useState<any>(null)
  const [pendingTasks, setPendingTasks] = React.useState<any[]>([])
  const [latestAnnouncement, setLatestAnnouncement] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const userId = userData.user.id

      // Fetch Latest Announcement
      const { data: latestNotifs } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1)
        
      if (latestNotifs && latestNotifs.length > 0) {
        setLatestAnnouncement(latestNotifs[0])
      }

      // 1. Get Enrollments & Active Bootcamp
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          batch_id,
          batches (
            id,
            name,
            batch_mentors ( users ( full_name ) )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'aktif')

      if (!enrollments || enrollments.length === 0) {
        setIsLoading(false)
        return
      }

      // Just pick the first active batch for dashboard
      const currentBatch = enrollments[0].batches as any
      const batchId = currentBatch.id
      const mentorName = currentBatch.batch_mentors?.[0]?.users?.full_name || "Tidak ada Mentor"

      // 2. Fetch Sessions for Progress and Calendar
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, title, scheduled_at, session_type, status, batches(name)')
        .eq('batch_id', batchId)
        .order('order_number', { ascending: true })

      if (sessions) {
        // Calculate Progress
        const totalSessions = sessions.length
        const completedSessions = sessions.filter(s => s.status === 'completed').length
        const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

        // Determine Jadwal Hari Ini (Today's Schedule)
        const d = new Date()
        const localTodayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        
        const upcomingSession = sessions.find(s => {
          if (!s.scheduled_at) return false
          const sessDateStr = s.scheduled_at.substring(0, 10)
          return sessDateStr === localTodayStr
        })
        let formattedNextSession = null
        if (upcomingSession) {
          const dateObj = new Date(upcomingSession.scheduled_at)
          formattedNextSession = {
            id: upcomingSession.id,
            title: upcomingSession.title,
            date: dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
            mode: upcomingSession.session_type === 'online' ? 'Online' : 'Offline',
            link: "Menunggu link...", // Would come from zoom link field if it exists
            passcode: "Menunggu..."
          }
        }

        // Generate Calendar Events
        const eventsMap: Record<string, CalendarEvent[]> = {}
        sessions.forEach((s: any) => {
          if (!s.scheduled_at) return
          const dateObj = new Date(s.scheduled_at)
          
          // Use substring to ensure date matches exactly what's in DB (YYYY-MM-DD) regardless of browser timezone
          const dateStr = s.scheduled_at.substring(0, 10)
          
          const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          
          if (!eventsMap[dateStr]) eventsMap[dateStr] = []
          eventsMap[dateStr].push({
            id: s.id,
            title: `[${(s.batches as any)?.name || 'Batch'}] ${s.title}`,
            time: timeStr,
            type: s.session_type,
            metadata: { batch: (s.batches as any)?.name }
          })
        })
        
        setCalendarEvents(Object.keys(eventsMap).map(date => ({ date, items: eventsMap[date] })))
        setNextSession(formattedNextSession)

        // Fetch Attendance
        const { data: attendances } = await supabase
          .from('attendances')
          .select('id, status')
          .eq('user_id', userId)
          .in('session_id', sessions.map(s => s.id))
          
        const attendedCount = attendances?.filter(a => a.status === 'present').length || 0
        // Calculate eligible based on completed sessions
        const passedSessionsCount = completedSessions > 0 ? completedSessions : 1 // prevent div by zero
        const attPercentage = Math.round((attendedCount / passedSessionsCount) * 100)
        
        setActiveBootcamp({
           id: currentBatch.id,
           name: currentBatch.name,
           batch: "Batch Saat Ini",
           mentor: mentorName,
           progress: { completed: completedSessions, total: totalSessions, percentage: progressPercentage > 100 ? 100 : progressPercentage },
           attendance: { percentage: attPercentage > 100 ? 100 : attPercentage, isEligible: attPercentage >= 80 }
        })
      }

      // 3. Fetch Pending Tasks
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id)
        
        // Fetch tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, deadline, sessions(title)')
          .in('session_id', sessionIds)

        // Fetch user submissions
        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('task_id')
          .eq('user_id', userId)

        if (tasks) {
           const submittedTaskIds = new Set(submissions?.map(s => s.task_id) || [])
           
           const pending = tasks.filter(t => !submittedTaskIds.has(t.id)).map(t => ({
             id: t.id,
             title: t.title,
             deadlineRaw: t.deadline,
             deadline: t.deadline ? new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "Tidak ada",
             status: "Belum Dikerjakan"
           })).filter(t => !t.deadlineRaw || new Date() < new Date(t.deadlineRaw)) // Hanya yang belum lewat deadline
           
           setPendingTasks(pending)
        }
      }

      setIsLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy" />
      </div>
    )
  }

  if (!activeBootcamp) {
    return (
      <div className="max-w-6xl mx-auto pb-12 pt-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mb-8 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pilih Program Belajar Anda</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Anda belum memiliki program aktif. Silakan pilih salah satu bootcamp atau paket belajar di bawah ini untuk memulai perjalanan karir Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(program => (
            <div key={program.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{program.name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                
                <div className="space-y-2 mb-6">
                  {program.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                <div className="text-xs text-slate-500 mb-1">Mulai dari</div>
                <div className="text-xl font-bold text-slate-900 mb-4">{formatPrice(program.tiers?.[0]?.price || program.price)}</div>
                <Link href={`/checkout?program=${program.id}`} className="block w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-lg text-sm font-semibold transition-colors">
                  Lihat Paket & Daftar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {latestAnnouncement && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="mt-0.5 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900">Pengumuman: {latestAnnouncement.title}</h3>
            <p className="text-sm text-blue-800 mt-1">{latestAnnouncement.message}</p>
          </div>
          <button 
            onClick={() => {
              setLatestAnnouncement(null)
              // Optional: Mark as read in DB if they close it
              supabase.from('in_app_notifications').update({ is_read: true }).eq('id', latestAnnouncement.id).then()
            }}
            className="text-blue-400 hover:text-blue-700 bg-white/50 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Banner: Info Bootcamp Aktif */}
      <div className="bg-e17-navy rounded-xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm border border-slate-200/20">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-100 border border-white/20 mb-3">
              Program Aktif • {activeBootcamp.batch}
            </span>
            <h1 className="text-2xl md:text-3xl font-black mb-2">{activeBootcamp.name}</h1>
            <p className="text-slate-300 text-sm flex items-center">
              <BookOpen className="w-4 h-4 mr-2 opacity-70" /> Mentor: {activeBootcamp.mentor}
            </p>
          </div>
          
          <div className="w-full md:w-72 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm shrink-0">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-slate-300 font-medium mb-1">Progres Kelas</p>
                <p className="text-xl font-bold text-white">{activeBootcamp.progress.percentage}%</p>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-1">{activeBootcamp.progress.completed} dari {activeBootcamp.progress.total} Sesi</p>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="bg-e17-primary h-2 rounded-full" 
                style={{ width: `${activeBootcamp.progress.percentage}%` }}
              ></div>
            </div>
            <Link href={`/siswa/courses`}>
              <Button variant="orange" size="sm" className="w-full font-bold shadow-sm">
                Buka Ruang Kelas <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Kolom Kiri: Sesi Terdekat & Absensi (Lebih Lebar) */}
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-6">
          
          {/* Jadwal Sesi Berikutnya */}
          <div className="card-clean overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-e17-dark flex items-center text-lg">
                <Clock className="mr-2 h-5 w-5 text-e17-navy" /> Jadwal Hari Ini
              </h2>
            </div>
            <div className="p-6">
              {nextSession ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      nextSession.mode === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {nextSession.mode}
                    </span>
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                      {nextSession.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-e17-dark mb-1">{nextSession.title}</h3>
                  {nextSession.mode === 'Online' && (
                     <p className="text-sm text-slate-600">Passcode Zoom: <strong className="text-e17-navy">{nextSession.passcode}</strong></p>
                  )}
                </div>
                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  {nextSession.mode === 'Online' ? (
                    <a href={nextSession.link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="orange" size="lg" className="w-full font-bold shadow-md text-base h-12">
                        <Video className="mr-2 h-5 w-5" /> Gabung Kelas
                      </Button>
                    </a>
                  ) : (
                    <Link href="/siswa/courses" className="block">
                      <Button variant="orange" size="lg" className="w-full font-bold shadow-md text-base h-12">
                        <ChevronRight className="mr-2 h-5 w-5" /> Masuk Ruang Kelas
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p>Tidak ada jadwal kelas hari ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* Lanjutkan Pembelajaran */}
          <div className="card-clean p-6 flex flex-col sm:flex-row items-center gap-5 hover:border-slate-300 transition-colors cursor-pointer group">
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
              <PlayCircle className="h-7 w-7 text-e17-navy" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm text-slate-500 font-medium mb-1">Lanjutkan Pembelajaran Anda</h3>
              <p className="text-base font-bold text-e17-dark">Video Tutorial: Membuat Counter App (Sesi 4)</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-e17-navy transition-colors hidden sm:block" />
          </div>

        </div>

        {/* Kolom Kanan: Tugas & Statistik (Lebih Sempit) */}
        <div className="w-full lg:w-2/5 xl:w-1/3 space-y-6">

          {/* Calendar Widget */}
          <div className="card-clean p-4">
            <h3 className="font-bold text-e17-dark flex items-center mb-4 text-sm">
               <Calendar className="w-4 h-4 mr-2 text-e17-navy" /> Jadwal Kelas Anda (Kalender)
            </h3>
            <CalendarWidget 
              events={calendarEvents} 
              selectedDate={selectedCalendarDate}
              onDateClick={(date, events) => {
                setSelectedCalendarDate(date)
                setSelectedDayEvents(events)
              }}
            />
            {selectedCalendarDate && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="text-xs font-bold text-slate-500 mb-2">Jadwal di {new Date(selectedCalendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}:</p>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Libur, tidak ada kelas hari ini.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map(ev => (
                      <div key={ev.id} className="border-l-2 border-e17-primary pl-2">
                        <p className="text-[10px] font-bold text-e17-navy">{ev.time} WIB</p>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{ev.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Perlu Dikerjakan */}
          <div className="card-clean overflow-hidden bg-white flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-e17-dark flex items-center">
                <FileText className="mr-2 h-4 w-4 text-orange-500" /> Perlu Dikerjakan
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
            </div>
            <div className="p-4 flex-1">
              {pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="border border-slate-200 rounded-lg p-3 hover:border-orange-300 transition-colors bg-white group">
                      <p className="text-sm font-bold text-e17-dark line-clamp-2 leading-tight mb-2 group-hover:text-e17-navy transition-colors">{task.title}</p>
                      <div className="flex items-center text-xs text-orange-700 font-bold bg-orange-50 w-fit px-2 py-1 rounded border border-orange-100">
                        <Clock className="h-3 w-3 mr-1.5" /> Tenggat: {task.deadline}
                      </div>
                      <Link href="/siswa/assignments">
                        <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs border-slate-200">Kerjakan Sekarang</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <CheckCircle className="h-10 w-10 text-slate-200 mb-2" />
                  <p className="text-sm text-slate-500">Semua tugas sudah diselesaikan!</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Kehadiran Ringkas */}
          <div className="card-clean p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-e17-dark flex items-center text-sm">
                <Percent className="mr-2 h-4 w-4 text-e17-navy" /> Status Kehadiran
              </h2>
              <Link href="/siswa/attendance" className="text-xs font-semibold text-e17-navy hover:underline">Detail</Link>
            </div>
            <div className="flex items-center">
              <div className="relative flex items-center justify-center h-16 w-16 shrink-0">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={activeBootcamp.attendance.isEligible ? "text-emerald-500" : "text-amber-500"} strokeWidth="4" strokeDasharray={`${activeBootcamp.attendance.percentage}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-e17-dark">{activeBootcamp.attendance.percentage}%</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                {activeBootcamp.attendance.isEligible ? (
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-fit mb-1">
                    Memenuhi Syarat ( {">"}80% )
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 w-fit mb-1">
                    <AlertCircle className="inline h-3 w-3 mr-1" /> Di Bawah Syarat
                  </p>
                )}
                <p className="text-[11px] text-slate-500 leading-tight">Kehadiran akan memengaruhi syarat kelulusan akhir Anda.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
