import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']; // using ANON KEY
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Login as Mentor Budi
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mentor@e17.com',
    password: 'password123'
  });
  
  if (authErr) {
    console.log("Auth Error:", authErr.message);
    return;
  }
  
  const quizIds = ['7d2758b6-e6d5-4bff-896c-c52d683913c6', 'e8916a2f-6787-40a9-a431-718e42cb37cf'];

  const { data: attemptsData, error: err } = await supabase
    .from('quiz_attempts')
    .select(`
      id, score, is_passed, created_at, quiz_id,
      users ( full_name )
    `)
    .in('quiz_id', quizIds);
  console.log("attemptsData with ANON KEY:", attemptsData, err?.message);
}

test();
