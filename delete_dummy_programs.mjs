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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAll() {
  console.log("Deleting checkout_orders...");
  await supabase.from('checkout_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Deleting video_access...");
  await supabase.from('video_access').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Deleting marketing_program_curriculum...");
  await supabase.from('marketing_program_curriculum').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Deleting marketing_program_tiers...");
  await supabase.from('marketing_program_tiers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Deleting marketing_programs...");
  const { error } = await supabase.from('marketing_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error("Error deleting marketing_programs:", error);
  } else {
    console.log("All dummy marketing programs deleted successfully!");
  }
}

deleteAll();
