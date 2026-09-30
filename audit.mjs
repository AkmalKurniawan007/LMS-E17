import fs from 'fs';
import path from 'path';

const SENSITIVE_TABLES = [
  'users', 'certificates', 'manual_grades', 'quiz_attempts', 'quiz_questions', 
  'program_quiz_questions', 'attendance_tokens', 'attendances', 'materials', 
  'program_materials', 'chat_participants', 'chat_rooms', 'messages', 
  'checkout_orders', 'portfolio_projects', 'helpdesk_messages', 'audit_logs', 'global_settings'
];

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync('./src').concat(walkSync('./app')); // Adjust if app is root

const results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  
  // Very basic regex to find .from('table').(insert|update|upsert|delete|select)
  const fromRegex = /\.from\(['"]([^'"]+)['"]\)\s*\.?\s*(insert|update|upsert|delete|select)/gi;
  let match;
  while ((match = fromRegex.exec(content)) !== null) {
    const table = match[1];
    const op = match[2].toLowerCase();
    
    // Only sensitive tables for select
    if (op === 'select' && !SENSITIVE_TABLES.includes(table)) continue;
    
    // Find line number
    const substr = content.substring(0, match.index);
    const lineNum = (substr.match(/\n/g) || []).length + 1;
    
    // Context line
    const lineContent = lines[lineNum - 1].trim();
    
    let env = isClient ? 'Client' : 'Server';
    if (!isClient && (file.includes('route.ts') || file.includes('actions.ts') || file.includes('server'))) {
      env = 'Server Action/Route';
    }
    
    results.push({
      file: file.replace(/\\/g, '/').replace('src/', ''),
      line: lineNum,
      table,
      op,
      env
    });
  }
  
  // find rpc
  const rpcRegex = /\.rpc\(['"]([^'"]+)['"]/gi;
  while ((match = rpcRegex.exec(content)) !== null) {
    const rpcName = match[1];
    const substr = content.substring(0, match.index);
    const lineNum = (substr.match(/\n/g) || []).length + 1;
    let env = isClient ? 'Client' : 'Server';
    
    results.push({
      file: file.replace(/\\/g, '/').replace('src/', ''),
      line: lineNum,
      table: `RPC: ${rpcName}`,
      op: 'rpc',
      env
    });
  }
});

// Write to a temporary JSON so I can read it
fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
console.log(`Found ${results.length} matches`);
