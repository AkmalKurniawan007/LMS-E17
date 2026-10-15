import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireCapability } from '@/lib/access-tier.server'

export default async function SiswaAssignmentLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = createAdminClient()
  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('id, is_bnsp, session_id, sessions(batch_id)')
    .eq('id', assignmentId)
    .maybeSingle()

  if (task?.is_bnsp) {
    const batchId = (task.sessions as any)?.batch_id ?? null
    try {
      await requireCapability(user.id, batchId, 'bnsp_exam')
    } catch {
      redirect('/siswa/courses?locked=bnsp')
    }
  }

  return <>{children}</>
}
