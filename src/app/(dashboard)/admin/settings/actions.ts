'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'src/data/settings.json')

export async function getSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      // Default settings if file doesn't exist
      return {
        institutionName: 'E17 Course',
        contactEmail: 'info@e17course.com',
        minAttendance: 80
      }
    }
    const data = fs.readFileSync(settingsPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to get settings:', error)
    return {
      institutionName: 'E17 Course',
      contactEmail: 'info@e17course.com',
      minAttendance: 80
    }
  }
}

export async function updateSettings(data: { institutionName: string, contactEmail: string, minAttendance: number }) {
  try {
    const dir = path.dirname(settingsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to update settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}
