import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSubmissions() {
  const { data, error } = await supabase
    .from('task_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  console.log(data)
}

checkSubmissions()
