export type LogRole = 'admin' | 'mentor' | 'siswa' | 'system'

export interface AuditLog {
  id: string
  user_id?: string
  user_email?: string
  role: LogRole
  action: string
  target_id?: string
  details: string
  created_at: string
}
