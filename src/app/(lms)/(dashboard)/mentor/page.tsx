import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import MentorDashboardClient from "./client"

export const revalidate = 0;

export default async function MentorDashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    redirect("/pembeli/login")
  }

  const userId = userData.user.id
  let initialData: any = {
    stats: {
      totalBatches: 0,
      totalStudents: 0,
      pendingAssignments: 0,
      upcomingClasses: 0,
      avgGradingTime: "24 Jam",
      overdueAssignments: 0
    },
    myBatches: [],
    latestAnnouncement: null,
    calendarEvents: [],
    todayEvents: []
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
    const eventsMap: Record<string, any[]> = {}

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

    initialData.myBatches = formattedBatches
    initialData.stats.totalBatches = formattedBatches.length
    initialData.stats.totalStudents = totalStudents
    initialData.stats.upcomingClasses = upcomingClassesCount
    initialData.calendarEvents = eventsArray
    
    const todayStr = new Date().toISOString().split('T')[0]
    if (eventsMap[todayStr]) {
      initialData.todayEvents = eventsMap[todayStr]
    }
  }

  return <MentorDashboardClient initialData={initialData} />
}
