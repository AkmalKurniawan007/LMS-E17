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
      user_id: options?.user_id,
      user_email: options?.user_email,
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
