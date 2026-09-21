import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, scheduled_at, status, batches(name)')
    
  console.log(JSON.stringify(sessions, null, 2))
}

run()
