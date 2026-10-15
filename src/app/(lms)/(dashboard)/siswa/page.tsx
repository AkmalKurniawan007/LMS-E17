import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SiswaDashboardClient from "./client"
import { syncUserRoleIfEnrolled } from "@/lib/auth.server"

export const revalidate = 0;

export default async function SiswaDashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    redirect("/pembeli/login")
  }

  const userId = userData.user.id
  // Pastikan role tersinkronisasi jika user sudah memiliki enrollment aktif
  await syncUserRoleIfEnrolled(userId)

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
  let { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      id,
      tier,
      status,
      batch_id,
      batches (
        id,
        name,
        batch_mentors ( users ( full_name ) )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'aktif')

  if (enrollError && (enrollError as any).code === '42703') {
    const fallbackRes = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        batch_id,
        batches (
          id,
          name,
          batch_mentors ( users ( full_name ) )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'aktif')
    enrollments = fallbackRes.data as any
  }

  if (!enrollments || enrollments.length === 0) {
    // Cek apakah user punya akses video (tier junior/expert)
    const { data: videoData } = await supabase
      .from('video_access')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (videoData && videoData.length > 0) {
      initialData.videoAccesses = videoData
      initialData.tier = 'junior'
      initialData.enrollmentStatus = 'Aktif'
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
    let resolvedTier = enrollments[0].tier
    if (!resolvedTier) {
      const { data: va } = await supabase
        .from('video_access')
        .select('tier')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
      resolvedTier = va?.tier || 'expert'
    }
    initialData.tier = resolvedTier
    initialData.enrollmentStatus = enrollments[0].status || 'Aktif'

    // Just pick the first active batch for dashboard
    const currentBatch = enrollments[0].batches as any
    const batchId = currentBatch?.id
    const mentorName = currentBatch?.batch_mentors?.[0]?.users?.full_name || "Tidak ada Mentor"

    if (batchId) {
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
      const { data: attendances, error: mainAttError } = await supabase
        .from('attendances')
        .select('id, session_id')
        .eq('user_id', userId)
        .in('session_id', sessions.map((s: any) => s.id))

      if (mainAttError) {
        console.error('[siswa/page] Error fetching attendances for activeBootcamp:', mainAttError)
      }
        
      const attendedCount = attendances?.length || 0
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
      
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, deadline, sessions(title)')
        .in('session_id', sessionIds)

      if (tasksError) {
        console.error('[siswa/page] Error fetching tasks:', tasksError)
      }

      const { data: submissions, error: subsError } = await supabase
        .from('task_submissions')
        .select('task_id')
        .eq('user_id', userId)

      if (subsError) {
        console.error('[siswa/page] Error fetching task_submissions:', subsError)
      }

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

      // T10: Ringkasan Status untuk Kartu "Paket Saya" (TierStatusCard)
      // 1. Kehadiran Live: hitung baris attendances milik siswa pada sesi online di batch
      const onlineSessions = sessions.filter((s: any) => s.session_type === 'online')
      const onlineSessionIds = onlineSessions.map((s: any) => s.id)

      let onlineAttendedCount = 0
      if (onlineSessionIds.length > 0) {
        const { data: onlineAttendances, error: attError } = await supabase
          .from('attendances')
          .select('id, session_id')
          .eq('user_id', userId)
          .in('session_id', onlineSessionIds)

        if (attError) {
          console.error('[siswa/page] Error fetching attendances for tierSummary:', attError)
        } else if (onlineAttendances) {
          onlineAttendedCount = onlineAttendances.length
        }
      }

      // 2. Materi Pembelajaran Selesai (material_progress vs materials)
      let batchMaterialsCount = 0
      let completedMaterialsCount = 0
      const { data: batchMaterials, error: matError } = await supabase
        .from('materials')
        .select('id')
        .in('session_id', sessionIds)

      if (matError) {
        console.error('[siswa/page] Error fetching materials for tierSummary:', matError)
      } else if (batchMaterials) {
        batchMaterialsCount = batchMaterials.length
        if (batchMaterialsCount > 0) {
          const matIds = batchMaterials.map(m => m.id)
          const { data: completedMats, error: matProgError } = await supabase
            .from('material_progress')
            .select('id')
            .eq('user_id', userId)
            .eq('is_completed', true)
            .in('material_id', matIds)

          if (matProgError) {
            console.error('[siswa/page] Error fetching material_progress for tierSummary:', matProgError)
          } else if (completedMats) {
            completedMaterialsCount = completedMats.length
          }
        }
      }

      // 3. Status BNSP (bnsp_progress, hanya jika tier granted: 'complete' atau 'bootcamp')
      let bnspSummary = undefined
      const currentTier = enrollments[0].tier || 'bootcamp'
      if (currentTier === 'complete' || currentTier === 'bootcamp') {
        const { data: bnspProg, error: bnspError } = await supabase
          .from('bnsp_progress')
          .select('theory_status, theory_score, portfolio_status, assessor_status')
          .eq('enrollment_id', enrollments[0].id)
          .maybeSingle()

        if (bnspError) {
          console.error('[siswa/page] Error fetching bnsp_progress for tierSummary:', bnspError)
        } else if (bnspProg) {
          bnspSummary = {
            theoryStatus: bnspProg.theory_status || 'not_started',
            theoryScore: bnspProg.theory_score ?? null,
            portfolioStatus: bnspProg.portfolio_status || 'not_submitted',
            assessorStatus: bnspProg.assessor_status || 'pending',
          }
        }
      }

      initialData.tierSummary = {
        liveAttendance: {
          attended: onlineAttendedCount,
          total: onlineSessions.length,
        },
        materials: {
          completed: completedMaterialsCount,
          total: batchMaterialsCount,
        },
        bnsp: bnspSummary,
      }
    }
    }
  }

  return <SiswaDashboardClient initialData={initialData} />
}
