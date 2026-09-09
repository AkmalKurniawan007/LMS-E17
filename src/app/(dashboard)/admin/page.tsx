"use client"

import * as React from "react"
import { Users, GraduationCap, BookOpen, AlertCircle, ArrowUpRight, CheckCircle2, Clock, UserPlus, BookCopy, Loader2, Bell, BarChart3 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { CalendarWidget, type CalendarEvent } from "@/components/ui/calendar-widget"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [calendarEvents, setCalendarEvents] = React.useState<{date: string, items: CalendarEvent[]}[]>([])
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<CalendarEvent[]>([])
  
  const [stats, setStats] = React.useState({
    totalSiswa: 0,
    totalMentor: 0,
    batchAktif: 0,
    totalLulus: 0
  })
  
  const [alerts, setAlerts] = React.useState<any[]>([])
  const [recentEnrollments, setRecentEnrollments] = React.useState<any[]>([])
  const [recentMentorActs, setRecentMentorActs] = React.useState<any[]>([])
  const [activeBatches, setActiveBatches] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Chart States
  const [batches, setBatches] = React.useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = React.useState("")
  const [monthFilter, setMonthFilter] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  })
  const [chartData, setChartData] = React.useState<any[]>([])
  const [isLoadingChart, setIsLoadingChart] = React.useState(false)

  React.useEffect(() => {
    fetchDashboardData()
    const fetchBatches = async () => {
      const { data } = await supabase.from('batches').select('id, name').order('created_at', { ascending: false })
      if (data) setBatches(data)
    }
    fetchBatches()
  }, [])

  React.useEffect(() => {
    fetchChartData()
  }, [selectedBatch, monthFilter])

  const fetchChartData = async () => {
    setIsLoadingChart(true)
    try {
      let query = supabase.from('enrollments').select('created_at, status, batch_id')

      if (selectedBatch) {
        query = query.eq('batch_id', selectedBatch)
      }
      
      const [year, month] = monthFilter.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString()
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString()
      query = query.gte('created_at', startDate).lte('created_at', endDate)
      
      const { data, error } = await query
      if (error) throw error

      const dailyCounts = (data || []).reduce((acc: any, curr: any) => {
        const day = new Date(curr.created_at).getDate()
        acc[day] = (acc[day] || 0) + 1
        return acc
      }, {})

      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
      const formattedData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        return {
          tanggal: `${day}`,
          Pendaftar: dailyCounts[day] || 0
        }
      })
      
      setChartData(formattedData)
    } catch (error) {
      console.error(error)
    }
    setIsLoadingChart(false)
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    
    // 1. Fetch Stats
    const { count: siswaCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'siswa')
    const { count: mentorCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'mentor')
    
    const today = new Date().toISOString().split('T')[0]
    const { count: batchCount } = await supabase.from('batches')
      .select('*', { count: 'exact', head: true })
      // Approximation for active batches
      
    const { count: lulusCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'lulus')

    setStats({
      totalSiswa: siswaCount || 0,
      totalMentor: mentorCount || 0,
      batchAktif: batchCount || 0, // In real scenario, filter by start_date <= today
      totalLulus: lulusCount || 0
    })

    // 2. Fetch Alerts
    const combinedAlerts: any[] = []
    
    const { data: importJobs, error: errImport } = await supabase.from('bulk_import_jobs')
      .select('id, status, created_at')
      .neq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3)
      
    if (!errImport && importJobs) {
      importJobs.forEach((job: any) => {
        combinedAlerts.push({
          id: `imp-${job.id}`,
          type: 'import',
          title: job.status === 'failed' ? 'Sistem: Bulk Import Gagal' : 'Sistem: Bulk Import Tertunda',
          desc: `Terdapat proses pendaftaran massal yang bermasalah.`,
          isError: job.status === 'failed',
          date: new Date(job.created_at)
        })
      })
    }

    const { data: weightRequests, error: errWeight } = await supabase.from('batch_weight_requests')
      .select('id, status, created_at, batches(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!errWeight && weightRequests) {
      weightRequests.forEach((req: any) => {
        combinedAlerts.push({
          id: `weight-${req.id}`,
          type: 'weight',
          title: 'Aksi Mentor: Perubahan Bobot',
          desc: `Menunggu persetujuan Anda untuk kelas ${req.batches?.name || '-'}`,
          isError: false,
          date: new Date(req.created_at)
        })
      })
    }
    
    // Sort alerts by date
    combinedAlerts.sort((a, b) => b.date.getTime() - a.date.getTime())
    setAlerts(combinedAlerts)

    // 3. Fetch Recent Enrollments (Student Activity)
    const { data: enrolls } = await supabase.from('enrollments')
      .select('id, created_at, users(full_name), batches(name)')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (enrolls) setRecentEnrollments(enrolls)

    // 4. Fetch Recent Mentor Assignments (Mentor Activity)
    const { data: mentorAssigns } = await supabase.from('batch_mentors')
      .select('id, created_at, users(full_name), batches(name)')
      .order('created_at', { ascending: false })
      .limit(5)
      
    if (mentorAssigns) setRecentMentorActs(mentorAssigns)

    // 5. Fetch Active Batches
    const { data: activeBatchesData } = await supabase.from('batches')
      .select('id, name, start_date, end_date, programs(name)')
      .order('start_date', { ascending: false })
      .limit(4)
      
    if (activeBatchesData) {
      // Get student count for each
      const batchesWithCount = await Promise.all(activeBatchesData.map(async (b: any) => {
        const { count } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('batch_id', b.id)
        return { ...b, studentCount: count || 0 }
      }))
      setActiveBatches(batchesWithCount)
    }

    // 6. Fetch Global Calendar Events (All Batches)
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
      
      // Auto select today if has events
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      if (eventsMap[todayStr]) {
        setSelectedCalendarDate(todayStr)
        setSelectedDayEvents(eventsMap[todayStr])
      }
    }

    setIsLoading(false)
  }

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 60) // minutes
    if (diff < 60) return `${diff} menit yang lalu`
    if (diff < 1440) return `${Math.floor(diff / 60)} jam yang lalu`
    return `${Math.floor(diff / 1440)} hari yang lalu`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Dashboard Super Admin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan *real-time* seluruh aktivitas pengguna LMS E17 Course.
          </p>
        </div>
        <button onClick={fetchDashboardData} className="text-sm font-semibold text-e17-navy hover:underline flex items-center">
          <Clock className="w-4 h-4 mr-1" /> Segarkan Data
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-e17-navy" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Siswa</h3>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-e17-dark">{stats.totalSiswa}</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">Terdaftar di platform</p>
            </div>

            <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Batch</h3>
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-e17-dark">{stats.batchAktif}</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">Seluruh angkatan</p>
            </div>

            <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Mentor</h3>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-e17-dark">{stats.totalMentor}</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">Staf pengajar aktif</p>
            </div>

            <div className="card-clean p-6 flex flex-col justify-between hover:border-e17-navy transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Siswa Lulus</h3>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-e17-dark">{stats.totalLulus}</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">Alumni bersertifikat</p>
            </div>
          </div>

          {/* Dashboard Chart */}
          <div className="card-clean p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-e17-dark flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-e17-navy" /> Tren Pendaftaran Siswa
              </h2>
              <div className="flex items-center gap-3">
                <input 
                  type="month" 
                  value={monthFilter} 
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy text-slate-700 font-medium cursor-pointer"
                />
                <select 
                  value={selectedBatch} 
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">Semua Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {isLoadingChart ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPendaftar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="Pendaftar" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorPendaftar)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <BarChart3 className="w-12 h-12 text-slate-200" />
                  <p className="text-sm">Tidak ada pendaftaran pada periode ini.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-e17-dark flex items-center">
                   <Clock className="w-5 h-5 mr-2 text-e17-navy" /> Jadwal Semua Kelas (Global)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CalendarWidget 
                  events={calendarEvents} 
                  selectedDate={selectedCalendarDate}
                  onDateClick={(date, events) => {
                    setSelectedCalendarDate(date)
                    setSelectedDayEvents(events)
                  }}
                />
                
                {/* Event Details for Selected Date */}
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
                        <p className="text-sm text-center">Tidak ada jadwal kelas pada tanggal ini.</p>
                      </div>
                    ) : (
                      selectedDayEvents.map(ev => (
                        <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-e17-navy/30 transition-colors">
                          <p className="text-xs font-bold text-e17-navy mb-1">{ev.time} WIB</p>
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{ev.title}</p>
                          <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ev.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {ev.type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Alerts */}
            <div className="lg:col-span-1 card-clean overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center"><Bell className="w-4 h-4 mr-2 text-e17-primary" /> Kotak Masuk & Alert</h3>
                {alerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{alerts.length}</span>}
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-600">Semua Terkendali</p>
                    <p className="text-xs text-slate-400 mt-1">Tidak ada peringatan atau persetujuan yang menunggu.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 flex items-start space-x-3 bg-white hover:bg-slate-50 transition-colors">
                      <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${alert.isError ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <p className="text-sm font-bold text-e17-dark">{alert.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{alert.desc}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-2">{timeAgo(alert.date.toISOString())}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Feeds */}
          <div className="card-clean overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-e17-dark">Live Feed: Aktivitas Pengguna</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Siswa Log */}
              <div className="p-0">
                <div className="bg-blue-50/50 px-4 py-2 border-b border-slate-100 sticky top-0">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Aktivitas Siswa</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentEnrollments.length === 0 ? (
                    <p className="text-sm text-slate-400 p-6 text-center italic">Belum ada aktivitas.</p>
                  ) : (
                    recentEnrollments.map((enr: any) => (
                      <div key={enr.id} className="p-4 flex items-start gap-3 hover:bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <UserPlus className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800">
                            <span className="font-bold">{enr.users?.full_name || 'Siswa'}</span> baru saja terdaftar.
                          </p>
                          <p className="text-xs font-medium text-e17-navy mt-1">{enr.batches?.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(enr.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mentor Log */}
              <div className="p-0">
                <div className="bg-amber-50/50 px-4 py-2 border-b border-slate-100 sticky top-0">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Aktivitas Mentor</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentMentorActs.length === 0 ? (
                    <p className="text-sm text-slate-400 p-6 text-center italic">Belum ada aktivitas.</p>
                  ) : (
                    recentMentorActs.map((act: any) => (
                      <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <BookCopy className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800">
                            <span className="font-bold">{act.users?.full_name || 'Mentor'}</span> ditugaskan mengajar.
                          </p>
                          <p className="text-xs font-medium text-purple-700 mt-1">{act.batches?.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(act.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Active Batches Section */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-e17-dark flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-e17-navy" /> Kelas (Batch) yang Sedang Berjalan
              </h3>
              <Link href="/admin/batches" className="text-xs font-bold text-e17-navy hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Batch</th>
                    <th className="px-6 py-4 font-semibold">Program</th>
                    <th className="px-6 py-4 font-semibold">Periode Pelaksanaan</th>
                    <th className="px-6 py-4 font-semibold text-center">Jumlah Siswa</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-slate-50/30">
                  {activeBatches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                        Belum ada kelas yang sedang berjalan saat ini.
                      </td>
                    </tr>
                  ) : (
                    activeBatches.map((batch: any) => (
                      <tr key={batch.id} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">{batch.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {batch.programs?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(batch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} 
                          {' - '}
                          {new Date(batch.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                              {batch.studentCount} Siswa
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/batches/${batch.id}`}>
                            <button className="text-e17-navy hover:text-blue-800 font-semibold text-xs border border-e17-navy hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                              Kelola
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
