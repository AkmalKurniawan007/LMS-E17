import { createClient } from '@supabase/supabase-js'

// Fungsi ini HANYA boleh dipanggil dari sisi Server (Server Actions / Route Handlers)
// DILARANG keras di-import di sisi Client (React Components) karena akan mengekspos Service Role Key!
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL atau Service Role Key belum dikonfigurasi di env.')
  }

  // Parameter auth.autoRefreshToken: false dan persistSession: false sangat penting
  // untuk client admin agar tidak bentrok dengan sesi user yang sedang login.
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
