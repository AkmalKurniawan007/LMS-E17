'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { sendEmail, generateClassReminderEmailHtml } from '@/lib/email-service'
import { sendInAppNotification } from '@/app/actions/notification-actions'

export interface ClassReminderResult {
  sessionId: string
  batchName: string
  sessionTitle: string
  mentorsNotified: number
  studentsNotified: number
  status: 'sent' | 'skipped' | 'failed'
  error?: string
}

export interface DailyReminderSummary {
  success: boolean
  targetDate: string
  totalSessions: number
  totalEmailsSent: number
  results: ClassReminderResult[]
  error?: string
}

/**
 * Mendapatkan string tanggal hari ini dalam zona waktu WIB (Asia/Jakarta) YYYY-MM-DD
 */
export async function getTodayWibDateString(): Promise<string> {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date()) // Menghasilkan "YYYY-MM-DD"
}

/**
 * Mengirimkan email pengingat kelas hari ini ke seluruh mentor dan siswa terkait
 * Dipanggil secara otomatis oleh CRON pada jam 07:00 WIB atau manual oleh Admin.
 */
export async function sendDailyClassReminders(options?: {
  targetDate?: string
  forceResend?: boolean
}): Promise<DailyReminderSummary> {
  const targetDate = options?.targetDate || (await getTodayWibDateString())
  const forceResend = options?.forceResend || false
  const adminSupabase = createAdminClient()

  try {
    // 1. Rentang waktu hari target dalam zona waktu WIB (+07:00)
    const startOfDay = `${targetDate}T00:00:00+07:00`
    const endOfDay = `${targetDate}T23:59:59+07:00`

    // 2. Cari semua sesi kelas yang dijadwalkan pada hari target
    const { data: sessions, error: sessionErr } = await adminSupabase
      .from('sessions')
      .select(`
        id,
        order_number,
        title,
        description,
        format,
        scheduled_at,
        start_time,
        end_time,
        session_type,
        meeting_link,
        status,
        batch_id,
        batches (
          id,
          name,
          status,
          program_id,
          programs (
            id,
            name
          )
        )
      `)
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .neq('status', 'cancelled')

    if (sessionErr) {
      console.error('[CLASS REMINDER] Gagal mengambil data sesi:', sessionErr)
      return {
        success: false,
        targetDate,
        totalSessions: 0,
        totalEmailsSent: 0,
        results: [],
        error: sessionErr.message,
      }
    }

    if (!sessions || sessions.length === 0) {
      return {
        success: true,
        targetDate,
        totalSessions: 0,
        totalEmailsSent: 0,
        results: [],
      }
    }

    const results: ClassReminderResult[] = []
    let totalEmailsSent = 0

    // 3. Proses setiap sesi yang dijadwalkan hari ini
    for (const session of sessions) {
      const batch = Array.isArray(session.batches) ? session.batches[0] : session.batches
      const program = batch && Array.isArray((batch as any).programs) 
        ? (batch as any).programs[0] 
        : (batch as any)?.programs

      const batchName = batch?.name || 'Batch'
      const programName = program?.name || 'Program Pelatihan'

      // Cek apakah sudah pernah dikirim untuk sesi & tanggal ini
      if (!forceResend) {
        const { data: existingLog } = await adminSupabase
          .from('class_reminder_logs')
          .select('id')
          .eq('session_id', session.id)
          .eq('reminder_date', targetDate)
          .maybeSingle()

        if (existingLog) {
          results.push({
            sessionId: session.id,
            batchName,
            sessionTitle: session.title,
            mentorsNotified: 0,
            studentsNotified: 0,
            status: 'skipped',
          })
          continue
        }
      }

      // Ambil Mentor untuk batch ini
      const { data: mentorRows } = await adminSupabase
        .from('batch_mentors')
        .select(`
          mentor_id,
          users:mentor_id (
            id,
            email,
            full_name
          )
        `)
        .eq('batch_id', session.batch_id)

      // Ambil Siswa yang berstatus aktif di batch ini
      const { data: enrollmentRows } = await adminSupabase
        .from('enrollments')
        .select(`
          user_id,
          users:user_id (
            id,
            email,
            full_name
          )
        `)
        .eq('batch_id', session.batch_id)
        .eq('status', 'aktif')

      // Format Waktu & Tanggal
      const scheduledDateObj = new Date(session.scheduled_at)
      const dateFormatted = scheduledDateObj.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      let timeFormatted = 'Jadwal hari ini'
      if (session.start_time && session.end_time) {
        timeFormatted = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)} WIB`
      } else if (session.scheduled_at) {
        timeFormatted = scheduledDateObj.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      }

      const mentorEmails: string[] = []
      const studentEmails: string[] = []

      // 4. Kirim ke Setiap Mentor
      if (mentorRows) {
        for (const row of mentorRows) {
          const mentorUser = Array.isArray(row.users) ? row.users[0] : row.users
          if (!mentorUser || !mentorUser.email) continue

          const emailHtml = generateClassReminderEmailHtml({
            recipientName: mentorUser.full_name || 'Mentor',
            role: 'mentor',
            programName,
            batchName,
            sessionNumber: session.order_number,
            sessionTitle: session.title,
            dateFormatted,
            timeFormatted,
            sessionType: session.session_type || 'online',
            meetingLink: session.meeting_link,
          })

          await sendEmail({
            to: mentorUser.email,
            subject: `[Pengingat Mengajar] Sesi ${session.order_number}: ${session.title} - ${batchName}`,
            html: emailHtml,
          })

          // In-App Notification untuk Mentor
          await sendInAppNotification({
            userId: mentorUser.id,
            title: `Jadwal Mengajar Hari Ini: Sesi ${session.order_number}`,
            message: `Anda dijadwalkan mengajar "${session.title}" (${batchName}) pada pukul ${timeFormatted}.`,
            actionUrl: `/mentor/batches/${session.batch_id}/sessions/${session.id}`,
          })

          mentorEmails.push(mentorUser.email)
          totalEmailsSent++
        }
      }

      // 5. Kirim ke Setiap Siswa
      if (enrollmentRows) {
        for (const row of enrollmentRows) {
          const studentUser = Array.isArray(row.users) ? row.users[0] : row.users
          if (!studentUser || !studentUser.email) continue

          const emailHtml = generateClassReminderEmailHtml({
            recipientName: studentUser.full_name || 'Siswa',
            role: 'siswa',
            programName,
            batchName,
            sessionNumber: session.order_number,
            sessionTitle: session.title,
            dateFormatted,
            timeFormatted,
            sessionType: session.session_type || 'online',
            meetingLink: session.meeting_link,
          })

          await sendEmail({
            to: studentUser.email,
            subject: `[Pengingat Kelas] Sesi ${session.order_number}: ${session.title} - ${batchName}`,
            html: emailHtml,
          })

          // In-App Notification untuk Siswa
          await sendInAppNotification({
            userId: studentUser.id,
            title: `Kelas Hari Ini: Sesi ${session.order_number}`,
            message: `Sesi "${session.title}" (${batchName}) akan dimulai pada pukul ${timeFormatted}. Siapkan diri Anda!`,
            actionUrl: `/siswa/learn/${session.id}`,
          })

          studentEmails.push(studentUser.email)
          totalEmailsSent++
        }
      }

      // 6. Catat Log ke Database Supabase
      try {
        await adminSupabase.from('class_reminder_logs').upsert(
          {
            session_id: session.id,
            batch_id: session.batch_id,
            reminder_date: targetDate,
            total_recipients: mentorEmails.length + studentEmails.length,
            mentor_recipients: mentorEmails,
            student_recipients: studentEmails,
            status: 'sent',
            sent_at: new Date().toISOString(),
          },
          { onConflict: 'session_id,reminder_date' }
        )
      } catch (logErr) {
        console.error('[CLASS REMINDER] Gagal mencatat log:', logErr)
      }

      results.push({
        sessionId: session.id,
        batchName,
        sessionTitle: session.title,
        mentorsNotified: mentorEmails.length,
        studentsNotified: studentEmails.length,
        status: 'sent',
      })
    }

    return {
      success: true,
      targetDate,
      totalSessions: sessions.length,
      totalEmailsSent,
      results,
    }
  } catch (err: any) {
    console.error('[CLASS REMINDER] Terjadi kesalahan fatal:', err)
    return {
      success: false,
      targetDate,
      totalSessions: 0,
      totalEmailsSent: 0,
      results: [],
      error: err?.message || 'Terjadi kesalahan sistem pengingat.',
    }
  }
}

/**
 * Mengambil daftar kelas hari ini beserta status pengiriman pengingatnya (untuk Admin UI)
 */
export async function getTodayScheduledClassesWithStatus() {
  const targetDate = await getTodayWibDateString()
  const adminSupabase = createAdminClient()

  const startOfDay = `${targetDate}T00:00:00+07:00`
  const endOfDay = `${targetDate}T23:59:59+07:00`

  const { data: sessions } = await adminSupabase
    .from('sessions')
    .select(`
      id,
      order_number,
      title,
      scheduled_at,
      start_time,
      end_time,
      session_type,
      meeting_link,
      status,
      batch_id,
      batches (
        id,
        name,
        programs ( name )
      )
    `)
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })

  if (!sessions || sessions.length === 0) {
    return { targetDate, sessions: [] }
  }

  // Cek log pengingat
  const sessionIds = sessions.map((s) => s.id)
  const { data: logs } = await adminSupabase
    .from('class_reminder_logs')
    .select('*')
    .in('session_id', sessionIds)
    .eq('reminder_date', targetDate)

  const logMap = new Map((logs || []).map((l) => [l.session_id, l]))

  const enrichedSessions = sessions.map((s) => {
    const log = logMap.get(s.id)
    const batch = Array.isArray(s.batches) ? s.batches[0] : s.batches
    const program = batch && Array.isArray((batch as any).programs) ? (batch as any).programs[0] : (batch as any)?.programs

    return {
      id: s.id,
      orderNumber: s.order_number,
      title: s.title,
      scheduledAt: s.scheduled_at,
      startTime: s.start_time,
      endTime: s.end_time,
      sessionType: s.session_type,
      meetingLink: s.meeting_link,
      batchName: batch?.name || 'Batch',
      programName: program?.name || 'Program',
      reminderSent: !!log,
      sentAt: log?.sent_at || null,
      totalRecipients: log?.total_recipients || 0,
    }
  })

  return {
    targetDate,
    sessions: enrichedSessions,
  }
}
