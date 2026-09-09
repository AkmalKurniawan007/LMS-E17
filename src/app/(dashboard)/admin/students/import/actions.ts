'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export type BulkImportResult = {
  success: boolean;
  message: string;
  details?: any;
}

export async function processBulkImport(
  students: { email: string; full_name: string }[],
  batchId: string,
  adminId: string
): Promise<BulkImportResult> {
  if (!students || students.length === 0) {
    return { success: false, message: 'Tidak ada data siswa yang valid untuk diproses.' }
  }
  if (!batchId) {
    return { success: false, message: 'Batch ID tidak valid.' }
  }

  const supabaseAdmin = createAdminClient()
  let successCount = 0
  let existingUserCount = 0
  let failureCount = 0
  const logDetails: any[] = []

  // Create initial bulk import job record
  const { data: jobData, error: jobError } = await supabaseAdmin
    .from('bulk_import_jobs')
    .insert({
      batch_id: batchId,
      created_by: adminId,
      status: 'processing',
      log_details: []
    })
    .select()
    .single()

  const jobId = jobData?.id

  for (const student of students) {
    try {
      let userId: string;
      let isExisting = false;
      
      // 1. Cek apakah user sudah ada di database
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', student.email)
        .single()
        
      if (existingUser) {
        userId = existingUser.id;
        isExisting = true;
      } else {
        // 2. Jika belum ada, Create user di auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: 'password123',
          email_confirm: true,
          user_metadata: {
            full_name: student.full_name,
            role: 'siswa'
          }
        })
  
        if (authError) throw new Error(authError.message)
        userId = authData.user.id
      }

      // 3. Cek apakah sudah terdaftar di batch ini
      const { data: existingEnroll } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('batch_id', batchId)
        .single()
        
      if (existingEnroll) {
        throw new Error("Siswa sudah terdaftar di batch ini.")
      }

      // 4. Create enrollment
      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert({
          user_id: userId,
          batch_id: batchId,
          status: 'aktif'
        })

      if (enrollError) {
        throw new Error(`Gagal enroll: ${enrollError.message}`)
      }

      successCount++
      if (isExisting) existingUserCount++
      
      const msg = isExisting ? 'Akun lama, berhasil dimasukkan ke kelas ini' : 'Akun baru berhasil dibuat'
      logDetails.push({ email: student.email, status: 'success', message: msg })
      
    } catch (error: any) {
      failureCount++
      logDetails.push({ email: student.email, status: 'error', reason: error.message || 'Unknown error' })
    }
  }

  // Update job status
  if (jobId) {
    await supabaseAdmin
      .from('bulk_import_jobs')
      .update({
        status: failureCount === 0 ? 'completed' : (successCount === 0 ? 'failed' : 'partial_success'),
        log_details: logDetails
      })
      .eq('id', jobId)
  }

  let finalMessage = `Selesai memproses. ${successCount} berhasil, ${failureCount} gagal.`
  if (existingUserCount > 0) {
    finalMessage += ` (Terdapat ${existingUserCount} akun lama yang ditambahkan ke kelas ini).`
  }

  return {
    success: true,
    message: finalMessage,
    details: logDetails
  }
}

export async function getActiveBatches() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('batches')
    .select('id, name')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching batches:', error)
    return []
  }
  return data
}
