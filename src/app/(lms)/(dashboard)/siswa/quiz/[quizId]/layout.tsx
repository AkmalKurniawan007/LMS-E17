import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireCapability } from '@/lib/access-tier.server'

export default async function SiswaQuizLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = createAdminClient()
  const { data: quiz } = await supabaseAdmin
    .from('quizzes')
    .select('id, is_bnsp, session_id, sessions(batch_id)')
    .eq('id', quizId)
    .maybeSingle()

  if (quiz?.is_bnsp) {
    const batchId = (quiz.sessions as any)?.batch_id ?? null
    try {
      await requireCapability(user.id, batchId, 'bnsp_exam')
    } catch {
      redirect('/siswa/courses?locked=bnsp')
    }
  }

  return <>{children}</>
}
