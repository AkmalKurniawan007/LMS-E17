'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export type SystemSettings = {
  institutionName: string
  contactEmail: string
  minAttendance: number
  timezone: string
  passingGrade: number
  gracePeriodHours: number
  maintenanceMode: boolean
  sessionTimeoutMinutes: number
  maxActiveDevices: number
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword?: string
  primaryColor: string
  logoUrl: string
  weightAttendance: number
  weightTaskAndQuiz: number
  weightProject: number
  maxQuizRetries: number
  defaultCertificateUrl: string
  requirePortfolioValidation: boolean
}

const defaultSettings: SystemSettings = {
  institutionName: 'E17 Course',
  contactEmail: 'info@e17course.com',
  minAttendance: 80,
  timezone: 'Asia/Jakarta',
  passingGrade: 70,
  gracePeriodHours: 24,
  maintenanceMode: false,
  sessionTimeoutMinutes: 60,
  maxActiveDevices: 2,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  primaryColor: '#1e3a8a',
  logoUrl: '',
  weightAttendance: 10,
  weightTaskAndQuiz: 40,
  weightProject: 50,
  maxQuizRetries: 3,
  defaultCertificateUrl: '',
  requirePortfolioValidation: true
}

export async function getSettings(): Promise<SystemSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('global_settings')
      .select('data')
      .eq('id', 1)
      .single()

    if (error || !data) {
      console.warn('Could not fetch settings from DB, using defaults. Error:', error?.message)
      return defaultSettings
    }
    
    // Merge DB data with defaults to ensure all fields exist
    return { ...defaultSettings, ...(data.data as Partial<SystemSettings>) }
  } catch (error) {
    console.error('Failed to get settings:', error)
    return defaultSettings
  }
}

export async function updateSettings(data: SystemSettings) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('global_settings')
      .upsert({ id: 1, data: data, updated_at: new Date().toISOString() })

    if (error) {
      console.error('Supabase error updating settings:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to update settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}
