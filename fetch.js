const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qkvjkcakxwiwmevgrgku.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdmprY2FreHdpd21ldmdyZ2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTYzNTQsImV4cCI6MjEwMjI3MjM1NH0.ZczVnc0qcc_cpX4Zz3beM_SFWkMbFYFGELCxJ5IzbJ4');
(async () => {
  const { data } = await supabase.from('marketing_programs').select('slug, name, is_published').order('created_at', { ascending: true });
  console.log(JSON.stringify(data, null, 2));
})();
