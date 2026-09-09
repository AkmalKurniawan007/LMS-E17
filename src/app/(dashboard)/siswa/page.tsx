"use client"

import Link from "next/link"
import { BookOpen, CheckCircle, Clock, FileText, ChevronRight, Video, MapPin, PlayCircle, Percent, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import * as React from "react"
import { CalendarWidget, type CalendarEvent } from "@/components/ui/calendar-widget"

export default function SiswaDashboardPage() {
  const supabase = createClient()
  const [calendarEvents, setCalendarEvents] = React.useState<{date: string, items: CalendarEvent[]}[]>([])
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<CalendarEvent[]>([])

  React.useEffect(() => {
    const fetchCalendarEvents = async () => {
      // Fetch all sessions (in real app, filter by student's enrollments)
      const { data: allSessions } = await supabase.from('sessions')
        .select('id, title, scheduled_at, session_type, batches(name)')
        .not('scheduled_at', 'is', null)

      if (allSessions) {
        const eventsMap: Record<string, CalendarEvent[]> = {}
        allSessions.forEach((s: any) => {
          if (!s.scheduled_at) return
          const dateObj = new Date(s.scheduled_at)
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
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
        
        const formattedEvents = Object.keys(eventsMap).map(date => ({
          date,
          items: eventsMap[date]
        }))
        
        setCalendarEvents(formattedEvents)
      }
    }
    fetchCalendarEvents()
  }, [])

  // Mock Data: Fokus pada 1 Bootcamp Aktif
  const activeBootcamp = {
    id: 1,
    name: "Full-Stack Web Development",
    batch: "Batch 3",
    mentor: "Ahmad Rizal",
    progress: { completed: 4, total: 10, percentage: 40 },
    attendance: { percentage: 85, isEligible: true }
  }

  const nextSession = {
    id: 5,
    title: "Sesi 5: React State Management",
    date: "Hari ini, 19:00 WIB",
    mode: "Online",
    link: "https://zoom.us/j/123",
    passcode: "REACT123"
  }

  const pendingTasks = [
    {
      id: 1,
      title: "Tugas Sesi 4: Membuat Counter App",
      deadline: "Besok, 23:59 WIB",
      status: "Belum Dikerjakan"
    }
  ]
  
  const recentGrades = [
    { id: 1, type: "Kuis", session: "Sesi 3", score: 85, status: "Lulus" },
    { id: 2, type: "Tugas", session: "Sesi 2", score: 90, status: "Lulus" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
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
                <Clock className="mr-2 h-5 w-5 text-e17-navy" /> Jadwal Sesi Berikutnya
              </h2>
            </div>
            <div className="p-6">
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
                    <Link href="/siswa/attendance" className="block">
                      <Button variant="orange" size="lg" className="w-full font-bold shadow-md text-base h-12">
                        <MapPin className="mr-2 h-5 w-5" /> Buka QR Absensi
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
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
