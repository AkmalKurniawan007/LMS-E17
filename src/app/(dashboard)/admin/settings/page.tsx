"use client"

import * as React from "react"
import { Settings as SettingsIcon, Bell, Shield, Palette, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSettings, updateSettings } from "./actions"

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const [settings, setSettings] = React.useState({
    institutionName: '',
    contactEmail: '',
    minAttendance: 80
  })

  React.useEffect(() => {
    async function loadSettings() {
      const data = await getSettings()
      setSettings(data)
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateSettings(settings)
    setIsSaving(false)
    if (result.success) {
      const { logAction } = await import('@/utils/logger-actions')
      await logAction('admin', 'Ubah Pengaturan Global', `Mengubah Nama Institusi menjadi ${settings.institutionName}`)
      alert("Pengaturan berhasil disimpan!")
    } else {
      alert("Gagal menyimpan pengaturan.")
    }
  }
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi global platform E17 Course.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="orange" className="font-bold shadow-sm" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            <button className="flex items-center px-3 py-2 bg-slate-100 text-e17-navy rounded-md font-medium text-sm transition-colors border border-slate-200">
              <SettingsIcon className="mr-3 h-4 w-4" /> Umum
            </button>
            <button className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
              <Shield className="mr-3 h-4 w-4" /> Keamanan
            </button>
            <button className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
              <Bell className="mr-3 h-4 w-4" /> Notifikasi Email
            </button>
            <button className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
              <Palette className="mr-3 h-4 w-4" /> Kustomisasi (Tema)
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="card-clean p-6">
            <h2 className="text-lg font-bold text-e17-dark mb-4 border-b border-slate-100 pb-2">Informasi Institusi</h2>
            {isLoading ? (
              <div className="py-12 flex justify-center items-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Institusi</label>
                  <input 
                    type="text" 
                    value={settings.institutionName}
                    onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Kontak Utama</label>
                  <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Syarat Minimal Kehadiran (%)</label>
                  <input 
                    type="number" 
                    value={settings.minAttendance}
                    onChange={(e) => setSettings({...settings, minAttendance: parseInt(e.target.value) || 0})}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Berlaku secara global untuk menentukan kelulusan siswa.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
