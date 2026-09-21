'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/utils/logger-actions'

export type SubmissionItem = {
  id: string
  student: string
  studentEmail: string
  studentAvatar: string | null
  task: string
  taskDescription: string
  batch: string
  program: string
  status: 'pending' | 'graded'
  score: number | null
  time: string
  submittedAt: string
  link: string
  comment: string
}

export type SubmissionDetail = {
  id: string
  student: string
  studentEmail: string
  studentAvatar: string | null
  task: {
    id: string
    title: string
    description: string
    dueDate: string
    batch: string
    program: string
    session: string
  }
  status: 'pending' | 'graded'
  time: string
  submittedAt: string
  link: string
  submissionType: string
  answerText: string | null
  score: number | null
  feedback: string | null
  feedbackAt: string | null
  gradedBy: string | null
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays} hari yang lalu`
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function getMentorSubmissions(): Promise<SubmissionItem[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return []
  }

  const userId = authData.user.id

  // Fetch current user's role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  const isMentor = userProfile?.role === 'mentor'

  let allowedTaskIds: string[] | null = null

  if (isMentor) {
    // 1. Fetch batches assigned to this mentor
    const { data: mentorBatches, error: bmError } = await supabase
      .from('batch_mentors')
      .select('batch_id')
      .eq('mentor_id', userId)

    if (bmError || !mentorBatches || mentorBatches.length === 0) {
      return []
    }

    const batchIds = mentorBatches.map(b => b.batch_id)

    // 2. Fetch sessions in these batches
    const { data: sessions, error: sessError } = await supabase
      .from('sessions')
      .select('id')
      .in('batch_id', batchIds)

    if (sessError || !sessions || sessions.length === 0) {
      return []
    }

    const sessionIds = sessions.map(s => s.id)

    // 3. Fetch tasks in these sessions that are NOT final projects
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, is_final_project')
      .in('session_id', sessionIds)

    if (taskError || !tasks || tasks.length === 0) {
      return []
    }

    allowedTaskIds = tasks.filter(t => !t.is_final_project).map(t => t.id)
  }

  // Build query
  let query = supabase
    .from('task_submissions')
    .select(`
      id,
      file_url,
      submission_type,
      submitted_at,
      feedback,
      feedback_at,
      feedback_by,
      users:user_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      tasks:task_id (
        id,
        title,
        description,
        deadline,
        session_id,
        sessions:session_id (
          id,
          title,
          batch_id,
          batches:batch_id (
            id,
            name,
            programs:program_id (
              name
            )
          )
        )
      ),
      manual_grades (
        id,
        score,
        component_name,
        graded_by,
        created_at
      )
    `)
    .order('submitted_at', { ascending: false })

  if (allowedTaskIds && allowedTaskIds.length > 0) {
    query = query.in('task_id', allowedTaskIds)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching submissions:', error)
    return []
  }

  return data.map((sub: any) => {
    const studentObj = sub.users || {}
    const taskObj = sub.tasks || {}
    const sessionObj = taskObj.sessions || {}
    const batchObj = sessionObj.batches || {}
    const programObj = batchObj.programs || {}

    const gradeRecord = Array.isArray(sub.manual_grades) && sub.manual_grades.length > 0
      ? sub.manual_grades[0]
      : null

    const hasGrade = gradeRecord && gradeRecord.score !== null && gradeRecord.score !== undefined
    const scoreVal = hasGrade ? Number(gradeRecord.score) : null

    let fileUrl = sub.file_url || ''
    if (fileUrl.startsWith('{"url"')) {
      try {
        const parsed = JSON.parse(fileUrl)
        fileUrl = parsed.url
      } catch (e) {}
    }

    return {
      id: sub.id,
      student: studentObj.full_name || 'Siswa',
      studentEmail: studentObj.email || '-',
      studentAvatar: studentObj.avatar_url || null,
      task: taskObj.title || 'Tugas',
      taskDescription: taskObj.description || '',
      batch: batchObj.name || 'Kelas / Batch',
      program: programObj.name || '',
      status: hasGrade ? 'graded' : 'pending',
      score: scoreVal,
      time: formatRelativeTime(sub.submitted_at),
      submittedAt: formatDateTime(sub.submitted_at),
      link: fileUrl,
      comment: sub.feedback || '',
    }
  })
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetail | null> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return null
  }

  const { data, error } = await supabase
    .from('task_submissions')
    .select(`
      id,
      file_url,
      submission_type,
      submitted_at,
      feedback,
      feedback_at,
      feedback_by,
      users:user_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      tasks:task_id (
        id,
        title,
        description,
        deadline,
        session_id,
        sessions:session_id (
          id,
          title,
          batch_id,
          batches:batch_id (
            id,
            name,
            programs:program_id (
              name
            )
          )
        )
      ),
      manual_grades (
        id,
        score,
        component_name,
        graded_by,
        created_at
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    console.error('Error fetching submission detail:', error)
    return null
  }

  const studentObj = (data.users as any) || {}
  const taskObj = (data.tasks as any) || {}
  const sessionObj = taskObj.sessions || {}
  const batchObj = sessionObj.batches || {}
  const programObj = batchObj.programs || {}

  const gradeRecord = Array.isArray(data.manual_grades) && data.manual_grades.length > 0
    ? data.manual_grades[0]
    : null

  const hasGrade = gradeRecord && gradeRecord.score !== null && gradeRecord.score !== undefined
  const scoreVal = hasGrade ? Number(gradeRecord.score) : null

  let fileUrl = data.file_url
  let studentText = null

  if (fileUrl?.startsWith('{"url"')) {
    try {
      const parsed = JSON.parse(fileUrl)
      fileUrl = parsed.url
      studentText = parsed.text
    } catch (e) {}
  }

  return {
    id: data.id,
    student: studentObj.full_name || 'Siswa',
    studentEmail: studentObj.email || '-',
    studentAvatar: studentObj.avatar_url || null,
    task: {
      id: taskObj.id || '',
      title: taskObj.title || 'Tugas',
      description: taskObj.description || 'Tidak ada instruksi khusus untuk tugas ini.',
      dueDate: taskObj.deadline ? formatDateTime(taskObj.deadline) : 'Tidak ditentukan',
      batch: batchObj.name || 'Batch',
      program: programObj.name || '',
      session: sessionObj.title || '',
    },
    status: hasGrade ? 'graded' : 'pending',
    time: formatRelativeTime(data.submitted_at),
    submittedAt: formatDateTime(data.submitted_at),
    link: fileUrl || '',
    submissionType: data.submission_type || 'file_upload',
    answerText: studentText || ((data.submission_type === 'text' || data.submission_type === 'link') ? fileUrl : null),
    score: scoreVal,
    feedback: data.feedback || null,
    feedbackAt: data.feedback_at ? formatDateTime(data.feedback_at) : null,
    gradedBy: gradeRecord?.graded_by || null,
  }
}

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { success: false, error: 'Sesi telah berakhir. Harap login kembali.' }
  }

  const mentorId = authData.user.id

  if (score < 0 || score > 100 || isNaN(score)) {
    return { success: false, error: 'Nilai harus berupa angka antara 0 sampai 100.' }
  }

  // 1. Fetch submission to get user_id & session batch
  const { data: submission, error: subError } = await supabase
    .from('task_submissions')
    .select(`
      id,
      user_id,
      task_id,
      tasks:task_id (
        id,
        title,
        session_id,
        sessions:session_id (
          id,
          batch_id
        )
      )
    `)
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    return { success: false, error: 'Data tugas siswa tidak ditemukan.' }
  }

  // 2. Find enrollment_id if available
  const batchId = (submission.tasks as any)?.sessions?.batch_id
  let enrollmentId: string | null = null
  if (batchId && submission.user_id) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', submission.user_id)
      .eq('batch_id', batchId)
      .maybeSingle()
    if (enrollment) {
      enrollmentId = enrollment.id
    }
  }

  // 3. Upsert or create manual_grades
  const { data: existingGrade } = await supabase
    .from('manual_grades')
    .select('id')
    .eq('task_submission_id', submissionId)
    .maybeSingle()

  const componentName = (submission.tasks as any)?.title || 'Tugas'

  if (existingGrade) {
    const { error: updateGradeError } = await supabase
      .from('manual_grades')
      .update({
        score,
        graded_by: mentorId,
        enrollment_id: enrollmentId,
      })
      .eq('id', existingGrade.id)

    if (updateGradeError) {
      return { success: false, error: `Gagal memperbarui nilai: ${updateGradeError.message}` }
    }
  } else {
    const { error: insertGradeError } = await supabase
      .from('manual_grades')
      .insert({
        task_submission_id: submissionId,
        score,
        component_name: componentName,
        graded_by: mentorId,
        enrollment_id: enrollmentId,
        weight_percentage: 100,
      })

    if (insertGradeError) {
      return { success: false, error: `Gagal menyimpan nilai: ${insertGradeError.message}` }
    }
  }

  // 4. Update feedback on task_submissions
  const { error: updateSubError } = await supabase
    .from('task_submissions')
    .update({
      feedback,
      feedback_by: mentorId,
      feedback_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (updateSubError) {
    return { success: false, error: `Gagal menyimpan feedback: ${updateSubError.message}` }
  }

  revalidatePath('/mentor/assignments')
  revalidatePath(`/mentor/assignments/${submissionId}`)

  await logAction(
    'mentor', 
    'Penilaian Tugas', 
    `Memberikan nilai ${score} untuk tugas harian (Submission ID: ${submissionId})`, 
    { user_id: mentorId, target_id: submissionId }
  )

  return { success: true }
}
