"use server"

import { createClient } from "@supabase/supabase-js"

export async function fetchQuizAttemptsByQuizIds(quizIds: string[]) {
  if (!quizIds || quizIds.length === 0) return { data: null, error: null }
  
  // Use service role key to bypass RLS since mentors don't have RLS policy for quiz_attempts
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      quiz_id,
      score,
      is_passed,
      created_at,
      users ( full_name )
    `)
    .in('quiz_id', quizIds)
    .order('created_at', { ascending: false })

  return { data, error }
}
