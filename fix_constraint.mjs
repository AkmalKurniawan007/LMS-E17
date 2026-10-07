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

async function fix() {
  const query = `
    ALTER TABLE public.marketing_program_tiers DROP CONSTRAINT IF EXISTS marketing_program_tiers_tier_type_check;
    ALTER TABLE public.marketing_program_tiers ADD CONSTRAINT marketing_program_tiers_tier_type_check CHECK (tier_type IN ('junior', 'expert', 'complete', 'bootcamp'));
  `;
  const { error } = await supabase.rpc('execute_sql', { query });
  console.log('Execute via RPC error:', error);
}

fix();
