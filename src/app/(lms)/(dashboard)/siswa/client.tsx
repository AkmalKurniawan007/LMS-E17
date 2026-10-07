"use client"

import Link from "next/link"
import { BookOpen, CheckCircle, Clock, FileText, ChevronRight, Video, MapPin, PlayCircle, Percent, AlertCircle, Calendar, Loader2, Megaphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import * as React from "react"
import { CalendarWidget, type CalendarEvent } from "@/components/ui/calendar-widget"

export default function SiswaDashboardClient({ 
  initialData 
}: { 
  initialData: any 
}) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const [calendarEvents, setCalendarEvents] = React.useState<{date: string, items: CalendarEvent[]}[]>(initialData.calendarEvents || [])
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<CalendarEvent[]>([])

  // Dashboard Data State
  const [activeBootcamp, setActiveBootcamp] = React.useState<any>(initialData.activeBootcamp)
  const [nextSession, setNextSession] = React.useState<any>(initialData.nextSession)
  const [pendingTasks, setPendingTasks] = React.useState<any[]>(initialData.pendingTasks || [])
  const [latestAnnouncement, setLatestAnnouncement] = React.useState<any>(initialData.latestAnnouncement)
  const [videoAccesses, setVideoAccesses] = React.useState<any[]>(initialData.videoAccesses || [])
  const [hasPendingOrder, setHasPendingOrder] = React.useState(initialData.hasPendingOrder || false)
  const [pendingOrderData, setPendingOrderData] = React.useState<{ id: string; hasProof: boolean } | null>(initialData.pendingOrderData || null)



  if (!activeBootcamp) {
    // Punya akses video (junior/expert)
    if (videoAccesses.length > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-sky-50 border-2 border-sky-200 rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-sky-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Video Aktif!</h2>
          <p className="text-slate-500 mb-2">
            Paket Anda memberikan akses ke materi video.
            Klik tombol di bawah untuk mulai belajar.
          </p>
          <p className="text-xs text-slate-400 mb-8">
            Untuk akses penuh LMS (sesi live, tugas, mentor), upgrade ke paket Bootcamp Lengkap.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Link
              href="/siswa/video"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Video className="w-4 h-4" />
              Tonton Materi
            </Link>
            <Link
              href="/#pricing"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )
    }

    // Ada order pending, belum dikonfirmasi
    if (hasPendingOrder && pendingOrderData) {
      // Belum upload bukti pembayaran
      if (!pendingOrderData.hasProof) {
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-orange-50 border-2 border-orange-200 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Upload Bukti Pembayaran</h2>
            <p className="text-slate-500 mb-8">
              Pesanan Anda sudah dibuat. Silakan upload bukti pembayaran agar tim kami dapat memverifikasi dan mengaktifkan akses Anda.
            </p>
            <Link
              href={`/pembeli/payment/${pendingOrderData.id}`}
              className="inline-flex items-center gap-2 bg-e17-navy hover:bg-e17-navy/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Upload Bukti Sekarang
            </Link>
          </div>
        )
      }

      // Sudah upload, menunggu verifikasi
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Pembayaran Sedang Diverifikasi</h2>
          <p className="text-slate-500 mb-8">
            Tim E17 Course sedang memverifikasi pembayaran Anda.
            Akses akan aktif dalam 1×24 jam setelah dikonfirmasi.
            Tidak perlu melakukan apa pun sekarang.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      )
    }

    // Belum beli apa-apa
    return (
       <div className="flex flex-col items-center justify-center py-32 text-center max-w-xl mx-auto">
         <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
         <h2 className="text-xl font-bold text-e17-dark mb-2">Belum Ada Program Aktif</h2>
         <p className="text-slate-500 mb-6">Anda belum terdaftar dalam program manapun. Pilih program dan mulai perjalanan belajar Anda.</p>
         <Link href="/#pricing" className="bg-e17-navy hover:bg-e17-navy/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
           Lihat Program Kami
         </Link>
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
