'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { logAction } from '@/utils/logger-actions'

export async function createMentorAccount(formData: FormData) {
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string

  if (!fullName || !email) {
    return { success: false, message: 'Nama dan email wajib diisi.' }
  }

  const supabaseAdmin = createAdminClient()

  try {
    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: 'password123', // Default password
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'mentor'
      }
    })

    if (authError) {
      if (authError.message.includes('already exists')) {
        return { success: false, message: 'Email sudah terdaftar di sistem.' }
      }
      throw new Error(authError.message)
    }

    const userId = authData.user.id

    // Ensure user role is set to mentor in public.users
    await supabaseAdmin
      .from('users')
      .update({ role: 'mentor' })
      .eq('id', userId)

    await logAction('admin', 'Pembuatan Akun Mentor', `Membuat akun mentor baru untuk ${email}`, { target_id: userId })

    return { success: true, message: `Mentor ${fullName} berhasil dibuat dengan sandi default: password123` }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat membuat akun mentor.' }
  }
}

export async function assignBatchesToMentor(mentorId: string, batchIds: string[]) {
  if (!mentorId || !batchIds) {
    return { success: false, message: 'Data tidak lengkap.' }
  }

  const supabaseAdmin = createAdminClient()

  try {
    // Get current batch assignments
    const { data: currentAssignments } = await supabaseAdmin
      .from('batch_mentors')
      .select('batch_id')
      .eq('mentor_id', mentorId)

    const currentBatchIds = currentAssignments?.map(a => a.batch_id) || []

    // Batches to remove
    const toRemove = currentBatchIds.filter(id => !batchIds.includes(id))
    // Batches to add
    const toAdd = batchIds.filter(id => !currentBatchIds.includes(id))

    // Remove old assignments
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('batch_mentors')
        .delete()
        .eq('mentor_id', mentorId)
        .in('batch_id', toRemove)

      if (deleteError) throw deleteError
    }

    // Add new assignments
    if (toAdd.length > 0) {
      const newAssignments = toAdd.map(batchId => ({
        mentor_id: mentorId,
        batch_id: batchId
      }))

      const { error: insertError } = await supabaseAdmin
        .from('batch_mentors')
        .insert(newAssignments)

      if (insertError) throw insertError
    }

    await logAction('admin', 'Assign Batch ke Mentor', `Mengassign ${batchIds.length} batch kepada mentor ID: ${mentorId}`, { target_id: mentorId })

    return { success: true, message: 'Batch assignment berhasil diperbarui.' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat assign batch.' }
  }
}

export async function removeMentor(mentorId: string) {
  if (!mentorId) {
    return { success: false, message: 'ID mentor tidak valid.' }
  }

  const supabaseAdmin = createAdminClient()

  try {
    // Check if mentor has active batches
    const { data: activeBatches, error: checkError } = await supabaseAdmin
      .from('batch_mentors')
      .select('batches(id, status)')
      .eq('mentor_id', mentorId)

    if (checkError) throw checkError

    const hasActiveBatches = activeBatches?.some((bm: any) => bm.batches?.status === 'berjalan')
    if (hasActiveBatches) {
      return { success: false, message: 'Tidak dapat menghapus mentor yang masih aktif mengajar. Hapus assignment batch terlebih dahulu.' }
    }

    // Remove all batch assignments
    await supabaseAdmin
      .from('batch_mentors')
      .delete()
      .eq('mentor_id', mentorId)

    // Ban the user in auth
    await supabaseAdmin.auth.admin.updateUserById(mentorId, {
      ban_duration: '87600h' // Ban for 10 years
    })

    await logAction('admin', 'Penghapusan Mentor', `Menghapus/suspend akun mentor ID: ${mentorId}`, { target_id: mentorId })

    return { success: true, message: 'Mentor berhasil dihapus/suspend dari sistem.' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat menghapus mentor.' }
  }
}

export async function getMentorDetailWithStats(mentorId: string) {
  const supabaseAdmin = createAdminClient()

  try {
    // Get mentor info
    const { data: mentorData, error: mentorError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', mentorId)
      .single()

    if (mentorError) throw mentorError

    // Get mentor's batches with student count
    const { data: batchMentors, error: batchError } = await supabaseAdmin
      .from('batch_mentors')
      .select(`
        batches (
          id,
          name,
          status,
          start_date,
          end_date,
          programs (name),
          enrollments (id, status, final_grade),
          sessions (id, status)
        )
      `)
      .eq('mentor_id', mentorId)

    if (batchError) throw batchError

    // Calculate stats
    let totalStudents = 0
    let totalSessions = 0
    let completedSessions = 0
    let avgStudentGrade = 0
    let totalGrades = 0
    let gradeCount = 0

    const batches = (batchMentors || []).map((bm: any) => {
      const batch = bm.batches
      const studentCount = batch?.enrollments?.length || 0
      totalStudents += studentCount

      const sessionCount = batch?.sessions?.length || 0
      const completedCount = batch?.sessions?.filter((s: any) => s.status === 'completed').length || 0
      totalSessions += sessionCount
      completedSessions += completedCount

      // Calculate average grade
      batch?.enrollments?.forEach((enrollment: any) => {
        if (enrollment.final_grade) {
          totalGrades += enrollment.final_grade
          gradeCount++
        }
      })

      return {
        id: batch?.id,
        name: batch?.name,
        program: batch?.programs?.name,
        status: batch?.status,
        students: studentCount,
        sessions: sessionCount,
        completedSessions: completedCount
      }
    })

    avgStudentGrade = gradeCount > 0 ? totalGrades / gradeCount : 0

    return {
      success: true,
      data: {
        mentor: mentorData,
        batches,
        stats: {
          totalStudents,
          totalSessions,
          completedSessions,
          avgStudentGrade: avgStudentGrade.toFixed(2)
        }
      }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat mengambil data mentor.' }
  }
}
