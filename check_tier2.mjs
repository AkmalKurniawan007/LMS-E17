import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    envVars[key] = value;
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: programs } = await supabase.from('marketing_programs').select('id').limit(1);
  if (!programs || programs.length === 0) {
    console.log("No programs found.");
    return;
  }
  
  const programId = programs[0].id;
  console.log("Testing insert for tier 'complete' on program", programId);
  
  const res = await supabase.from('marketing_program_tiers').upsert({
    program_id: programId,
    tier_type: 'complete',
    label: 'Bootcamp',
    price: 1000,
    original_price: 2000,
    is_popular: true,
    is_active: true,
    sort_order: 3,
    features: [],
    excludes: []
  }, { onConflict: 'program_id,tier_type' });
  
  console.log("Result error:", res.error);
}

check();
