import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SiswaDashboardClient from "./client"

export const revalidate = 0;

export default async function SiswaDashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    redirect("/pembeli/login")
  }

  const userId = userData.user.id
  let initialData: any = {
    calendarEvents: [],
    activeBootcamp: null,
    nextSession: null,
    pendingTasks: [],
    latestAnnouncement: null,
    videoAccesses: [],
    hasPendingOrder: false,
    pendingOrderData: null
  }

  // Fetch Latest Announcement
  const { data: latestNotifs } = await supabase
    .from('in_app_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(1)
    
  if (latestNotifs && latestNotifs.length > 0) {
    initialData.latestAnnouncement = latestNotifs[0]
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
    // Cek apakah user punya akses video (tier junior/expert)
    const { data: videoData } = await supabase
      .from('video_access')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (videoData && videoData.length > 0) {
      initialData.videoAccesses = videoData
    } else {
      // Cek apakah ada order pending (sudah beli tapi belum dikonfirmasi)
      const { data: pendingOrders } = await supabase
        .from('checkout_orders')
        .select('id, payment_proof_url')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .limit(1)

      if (pendingOrders && pendingOrders.length > 0) {
        const order = pendingOrders[0]
        initialData.hasPendingOrder = true
        initialData.pendingOrderData = {
          id: order.id,
          hasProof: !!order.payment_proof_url
        }
      }
    }
  } else {
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
      const completedSessions = sessions.filter((s: any) => s.status === 'completed').length
      const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

      // Determine Jadwal Hari Ini (Today's Schedule)
      const d = new Date()
      // Note: we can't rely on local timezone in server as much, but we'll use simple Date matching
      const localTodayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      
      const upcomingSession = sessions.find((s: any) => {
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
          link: "Menunggu link...", 
          passcode: "Menunggu..."
        }
      }

      // Generate Calendar Events
      const eventsMap: Record<string, any[]> = {}
      sessions.forEach((s: any) => {
        if (!s.scheduled_at) return
        const dateObj = new Date(s.scheduled_at)
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
      
      initialData.calendarEvents = Object.keys(eventsMap).map(date => ({ date, items: eventsMap[date] }))
      initialData.nextSession = formattedNextSession

      // Fetch Attendance
      const { data: attendances } = await supabase
        .from('attendances')
        .select('id, status')
        .eq('user_id', userId)
        .in('session_id', sessions.map((s: any) => s.id))
        
      const attendedCount = attendances?.filter((a: any) => a.status === 'present').length || 0
      const passedSessionsCount = completedSessions > 0 ? completedSessions : 1
      const attPercentage = Math.round((attendedCount / passedSessionsCount) * 100)
      
      initialData.activeBootcamp = {
         id: currentBatch.id,
         name: currentBatch.name,
         batch: "Batch Saat Ini",
         mentor: mentorName,
         progress: { completed: completedSessions, total: totalSessions, percentage: progressPercentage > 100 ? 100 : progressPercentage },
         attendance: { percentage: attPercentage > 100 ? 100 : attPercentage, isEligible: attPercentage >= 80 }
      }
    }

    // 3. Fetch Pending Tasks
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s: any) => s.id)
      
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, deadline, sessions(title)')
        .in('session_id', sessionIds)

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
         })).filter(t => !t.deadlineRaw || new Date() < new Date(t.deadlineRaw)) 
         
         initialData.pendingTasks = pending
      }
    }
  }

  return <SiswaDashboardClient initialData={initialData} />
}
