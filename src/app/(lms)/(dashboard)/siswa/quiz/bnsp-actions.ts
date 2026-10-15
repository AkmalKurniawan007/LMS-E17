'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireCapability } from '@/lib/access-tier.server'
import { ensureBnspProgress } from '@/lib/bnsp.server'

/**
 * Memuat soal kuis BNSP ke siswa TANPA menyertakan kolom correct_answer.
 */
export async function getBnspQuizQuestions(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Anda harus login terlebih dahulu.')
  }

  const supabaseAdmin = createAdminClient()
  const { data: quiz, error: quizError } = await supabaseAdmin
    .from('quizzes')
    .select('id, is_bnsp, session_id, passing_grade, max_retries, deadline, sessions(batch_id)')
    .eq('id', quizId)
    .single()

  if (quizError || !quiz) {
    throw new Error('Kuis tidak ditemukan.')
  }

  const batchId = (quiz.sessions as any)?.batch_id ?? null
  await requireCapability(user.id, batchId, 'bnsp_exam')

  // Query soal TANPA correct_answer
  const { data: questions, error: qError } = await supabaseAdmin
    .from('quiz_questions')
    .select('id, quiz_id, question_text, type, options, order_number')
    .eq('quiz_id', quizId)
    .order('order_number', { ascending: true })

  if (qError) {
    throw new Error(`Gagal memuat soal: ${qError.message}`)
  }

  return {
    success: true,
    quiz: {
      id: quiz.id,
      passing_grade: quiz.passing_grade,
      max_retries: quiz.max_retries,
      deadline: quiz.deadline,
      is_bnsp: quiz.is_bnsp,
    },
    questions: (questions || []).map((q: any) => ({
      id: q.id,
      text: q.question_text,
      options: q.options || [],
    })),
  }
}

/**
 * Server action submit kuis BNSP:
 * - Guard tier capability
 * - Validasi attempt count vs max_retries
 * - Cek deadline (seperti kuis reguler)
 * - Tolak submit jika theory_status sudah 'passed'
 * - Hitung skor di server dari DB correct_answer
 * - Tulis quiz_attempts & update bnsp_progress secara atomik/konsisten
 */
export async function submitBnspQuiz(
  quizId: string,
  answers: (string | null | undefined)[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Anda harus login terlebih dahulu.')
  }

  const supabaseAdmin = createAdminClient()
  const { data: quiz, error: quizError } = await supabaseAdmin
    .from('quizzes')
    .select('id, is_bnsp, session_id, passing_grade, max_retries, deadline, sessions(batch_id)')
    .eq('id', quizId)
    .single()

  if (quizError || !quiz) {
    throw new Error('Kuis tidak ditemukan.')
  }

  if (!quiz.is_bnsp) {
    throw new Error('Kuis ini bukan merupakan kuis BNSP.')
  }

  // Cek batas waktu deadline (konsisten dengan kuis reguler)
  if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
    throw new Error('Batas waktu pengerjaan kuis telah terlewati.')
  }

  const batchId = (quiz.sessions as any)?.batch_id ?? null
  const { enrollmentId } = await requireCapability(user.id, batchId, 'bnsp_exam')

  if (!enrollmentId) {
    throw new Error('Enrollment aktif tidak ditemukan untuk batch kuis ini.')
  }

  // 1. Pastikan record bnsp_progress ada lewat helper server-only
  await ensureBnspProgress(enrollmentId)

  // 2. Cek apakah theory_status sudah passed
  const { data: progress } = await supabaseAdmin
    .from('bnsp_progress')
    .select('theory_status')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle()

  if (progress?.theory_status === 'passed') {
    throw new Error('Ujian teori BNSP sudah dinyatakan lulus. Anda tidak perlu mengulang.')
  }

  // 3. Cek attempt count
  const { data: previousAttempts, error: attemptQueryErr } = await supabaseAdmin
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', quizId)
    .eq('user_id', user.id)

  if (attemptQueryErr) {
    throw new Error(`Gagal memeriksa riwayat percobaan: ${attemptQueryErr.message}`)
  }

  const currentAttempts = previousAttempts?.length ?? 0
  if (quiz.max_retries && currentAttempts >= quiz.max_retries) {
    throw new Error(`Batas maksimal percobaan (${quiz.max_retries}x) telah tercapai.`)
  }

  // 4. Muat kunci jawaban dari database
  const { data: questions, error: qError } = await supabaseAdmin
    .from('quiz_questions')
    .select('id, correct_answer')
    .eq('quiz_id', quizId)
    .order('order_number', { ascending: true })

  if (qError || !questions || questions.length === 0) {
    throw new Error('Gagal memeriksa jawaban karena data soal tidak valid.')
  }

  // 5. Evaluasi jawaban di server
  let correctCount = 0
  questions.forEach((q: any, i: number) => {
    if (answers[i] && String(answers[i]) === String(q.correct_answer)) {
      correctCount++
    }
  })

  const finalScore = Math.round((correctCount / questions.length) * 100)
  const passingGrade = quiz.passing_grade ?? 70
  const isPassed = finalScore >= passingGrade
  const nextAttemptNumber = currentAttempts + 1

  // 6. Simpan hasil ke quiz_attempts
  const { data: insertedAttempt, error: insertAttemptErr } = await supabaseAdmin
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      score: finalScore,
      is_passed: isPassed,
      attempt_number: nextAttemptNumber,
    })
    .select('id')
    .single()

  if (insertAttemptErr) {
    throw new Error(`Gagal menyimpan nilai kuis: ${insertAttemptErr.message}`)
  }

  // 7. Update status ke bnsp_progress
  const updatePayload: Record<string, any> = {
    theory_status: isPassed ? 'passed' : 'failed',
    theory_score: finalScore,
    updated_at: new Date().toISOString(),
  }
  if (isPassed) {
    updatePayload.theory_passed_at = new Date().toISOString()
  }

  const { error: updateProgressErr } = await supabaseAdmin
    .from('bnsp_progress')
    .update(updatePayload)
    .eq('enrollment_id', enrollmentId)

  if (updateProgressErr) {
    // Cleanup attempt agar tidak meninggalkan status tidak konsisten
    if (insertedAttempt?.id) {
      await supabaseAdmin
        .from('quiz_attempts')
        .delete()
        .eq('id', insertedAttempt.id)
    }
    throw new Error(`Gagal memperbarui progress BNSP: ${updateProgressErr.message}`)
  }

  return {
    success: true,
    score: finalScore,
    isPassed,
    attemptNumber: nextAttemptNumber,
  }
}
