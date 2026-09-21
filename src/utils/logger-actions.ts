'use server'

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { AuditLog, LogRole } from './logger'

const LOGS_FILE = path.join(process.cwd(), 'src/data/audit_logs.json')

export async function logAction(
  role: LogRole,
  action: string,
  details: string,
  options?: { user_id?: string; user_email?: string; target_id?: string }
) {
  try {
    let finalUserEmail = options?.user_email
    let finalUserId = options?.user_id

    if (!finalUserEmail) {
      try {
        const { createClient } = await import('@/utils/supabase/server')
        const supabase = await createClient()
        const { data: authData } = await supabase.auth.getUser()
        if (authData?.user) {
          finalUserEmail = authData.user.email
          if (!finalUserId) {
            finalUserId = authData.user.id
          }
        }
      } catch (e) {
        // Ignored if run outside request context
      }
    }

    const dir = path.dirname(LOGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    let logs: AuditLog[] = []
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'))
    }

    const newLog: AuditLog = {
      id: randomUUID(),
      role,
      action,
      details,
      created_at: new Date().toISOString(),
      user_id: finalUserId,
      user_email: finalUserEmail,
      target_id: options?.target_id
    }

    // Insert at beginning for newest first
    logs.unshift(newLog)
    
    // Keep only last 1000 logs for performance
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000)
    }

    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    console.error('Failed to log action:', error)
    return { success: false }
  }
}

export async function getAuditLogs() {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      return []
    }
    const logs: AuditLog[] = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'))
    return logs
  } catch (error) {
    console.error('Failed to get logs:', error)
    return []
  }
}
