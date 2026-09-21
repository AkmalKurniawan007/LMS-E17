"use client"

import * as React from "react"
import { Users, BookOpen, CheckSquare, Clock, ArrowRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, FileText, Loader2, Megaphone, X } from "lucide-react"
import Link from "next/link"
import { CalendarWidget, type CalendarEvent } from "@/components/ui/calendar-widget"
import { createClient } from "@/utils/supabase/client"

export default function MentorDashboardPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [stats, setStats] = React.useState({
    totalBatches: 0,
    totalStudents: 0,
    pendingAssignments: 0, // Mock for now, requires task_submissions implementation
    upcomingClasses: 0,
    avgGradingTime: "24 Jam", // Mock
    overdueAssignments: 0 // Mock
  })

  const [myBatches, setMyBatches] = React.useState<any[]>([])
  const [latestAnnouncement, setLatestAnnouncement] = React.useState<any>(null)
  const [calendarEvents, setCalendarEvents] = React.useState<{date: string, items: CalendarEvent[]}[]>([])
  
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<CalendarEvent[]>([])

  React.useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
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

      // Fetch Batches for this Mentor
      const { data: batchMentorsData } = await supabase
        .from('batch_mentors')
        .select(`
          batches (
            id,
            name,
            status,
            programs ( name ),
            enrollments ( id ),
            sessions ( id, title, scheduled_at, status, session_type )
          )
        `)
        .eq('mentor_id', userId)

      if (batchMentorsData) {
        let totalStudents = 0
        let upcomingClassesCount = 0
        const formattedBatches = []
        const eventsMap: Record<string, CalendarEvent[]> = {}

        for (const item of batchMentorsData) {
          const batch = item.batches as any
          if (!batch) continue

          const studentsCount = batch.enrollments ? batch.enrollments.length : 0
          totalStudents += studentsCount
          
          let completedSessions = 0
          let totalSessions = batch.sessions ? batch.sessions.length : 0

          if (batch.sessions) {
            batch.sessions.forEach((sess: any) => {
              if (sess.status === 'completed') completedSessions++
              
              if (sess.scheduled_at) {
                const sessDateStr = new Date(sess.scheduled_at).toISOString().split('T')[0]
                const sessTimeStr = new Date(sess.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                
                // upcoming logic (next 7 days)
                const now = new Date()
                const sessDate = new Date(sess.scheduled_at)
                const diffTime = sessDate.getTime() - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
                if (diffDays >= 0 && diffDays <= 7 && sess.status !== 'completed') {
                  upcomingClassesCount++
                }

                if (!eventsMap[sessDateStr]) eventsMap[sessDateStr] = []
                eventsMap[sessDateStr].push({
                  id: sess.id,
                  title: `[${batch.name}] ${sess.title}`,
                  time: sessTimeStr,
                  type: sess.session_type || 'offline',
                  metadata: { batch: batch.name, sessionId: sess.id, batchId: batch.id }
                })
              }
            })
          }

          const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

          formattedBatches.push({
            id: batch.id,
            name: batch.name,
            program: batch.programs?.name || 'Program',
            students: studentsCount,
            progress: progress
          })
        }

        const eventsArray = Object.keys(eventsMap).map(date => ({
          date,
          items: eventsMap[date]
        }))

        setMyBatches(formattedBatches)
        setStats(prev => ({
          ...prev,
          totalBatches: formattedBatches.length,
          totalStudents: totalStudents,
          upcomingClasses: upcomingClassesCount
        }))
        setCalendarEvents(eventsArray)
        
        const todayStr = new Date().toISOString().split('T')[0]
        if (eventsMap[todayStr]) {
          setSelectedDayEvents(eventsMap[todayStr])
        }
      }
    } catch (error) {
      console.error("Error fetching mentor dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateClick = (date: string, events: CalendarEvent[]) => {
    setSelectedCalendarDate(date)
    setSelectedDayEvents(events)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat dashboard mentor...</p>
      </div>
    )
  }

  // MOCK for sub components
  const MOCK_RECENT_SUBMISSIONS: any[] = []
  const MOCK_AT_RISK_STUDENTS: any[] = []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
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
              supabase.from('in_app_notifications').update({ is_read: true }).eq('id', latestAnnouncement.id).then()
            }}
            className="text-blue-400 hover:text-blue-700 bg-white/50 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Dashboard Mentor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang! Berikut adalah ringkasan kelas dan tugas yang perlu Anda tinjau hari ini.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Kelas Aktif</h3>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-e17-dark">{stats.totalBatches}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">Batch yang Anda ajar</p>
        </div>

        <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Siswa</h3>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-e17-dark">{stats.totalStudents}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">Dalam semua kelas Anda</p>
        </div>

        <div className="card-clean p-6 flex flex-col justify-between hover:border-amber-500 transition-colors transform hover:-translate-y-1 hover:shadow-lg duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Tugas Menunggu</h3>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <CheckSquare className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 relative z-10">
            <span className="text-4xl font-black text-amber-600">{stats.pendingAssignments}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2 relative z-10">Memerlukan penilaian</p>
        </div>

        <div className="card-clean p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Jadwal Mendatang</h3>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-e17-dark">{stats.upcomingClasses}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">Sesi dalam 7 hari kedepan</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Widget */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-e17-dark flex items-center">
                <Clock className="w-5 h-5 mr-2 text-e17-navy" /> Jadwal Mengajar Anda
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarWidget 
              events={calendarEvents} 
              selectedDate={selectedCalendarDate}
              onDateClick={handleDateClick}
            />
            
            {/* Event Details */}
            <div className="card-clean p-5 h-[360px] flex flex-col overflow-hidden">
              <h4 className="font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                Detail Jadwal
                {selectedCalendarDate && (
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {new Date(selectedCalendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                )}
              </h4>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {!selectedCalendarDate ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm text-center">Pilih tanggal pada kalender untuk melihat detail jadwal.</p>
                  </div>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-200" />
                    <p className="text-sm text-center">Tidak ada jadwal mengajar pada tanggal ini.</p>
                  </div>
                ) : (
                  selectedDayEvents.map(ev => (
                    <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-e17-navy/30 transition-colors">
                      <p className="text-xs font-bold text-e17-navy mb-1">{ev.time} WIB</p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{ev.title}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ev.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {ev.type}
                        </span>
                        {ev.metadata?.batchId && ev.metadata?.sessionId && (
                          <Link href={`/mentor/batches/${ev.metadata.batchId}/sessions/${ev.metadata.sessionId}`} className="text-[10px] font-bold text-e17-navy hover:underline flex items-center">
                              Buka Sesi <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Needs Grading / Recent Submissions */}
        <div className="lg:col-span-1 card-clean overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center text-sm"><CheckSquare className="w-4 h-4 mr-2 text-amber-400" /> Perlu Dinilai</h3>
            <Link href="/mentor/assignments" className="text-xs font-semibold text-slate-300 hover:text-white hover:underline">Lihat Semua</Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
            {MOCK_RECENT_SUBMISSIONS.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Tidak ada tugas tertunda.</div>
            ) : MOCK_RECENT_SUBMISSIONS.filter((s: any) => s.status === 'pending').map((sub: any) => (
              <div key={sub.id} className="p-4 flex items-start space-x-3 bg-white hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-e17-dark truncate">{sub.student}</p>
                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{sub.task}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{sub.batch} • {sub.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Batches List */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-e17-dark flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-e17-navy" /> Batch yang Anda Ajar
          </h3>
          <Link href="/mentor/batches" className="text-xs font-bold text-e17-navy hover:underline">
            Lihat Semua Batch
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/30">
          {myBatches.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500">
              Anda belum ditugaskan ke batch manapun.
            </div>
          ) : myBatches.map((batch) => (
            <div key={batch.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-e17-navy transition-colors">{batch.name}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">{batch.program}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                  <Users className="w-3 h-3 mr-1" /> {batch.students}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-600">Progres Kelas</span>
                  <span className="text-xs font-bold text-e17-navy">{batch.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-e17-primary h-2 rounded-full" style={{ width: `${batch.progress}%` }}></div>
                </div>
              </div>
              
              <Link href={`/mentor/batches/${batch.id}`} className="mt-5 w-full block">
                <button className="w-full bg-e17-navy hover:bg-blue-900 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
                  Kelola Kelas <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
