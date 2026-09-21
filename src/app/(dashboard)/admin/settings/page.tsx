"use client"

import * as React from "react"
import { Settings as SettingsIcon, Bell, Shield, Palette, Save, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSettings, updateSettings, SystemSettings } from "./actions"

type Tab = 'umum' | 'keamanan' | 'notifikasi' | 'tema'

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<Tab>('umum')
  
  const [settings, setSettings] = React.useState<SystemSettings>({
    institutionName: '',
    contactEmail: '',
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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
  }

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button 
      onClick={() => handleTabChange(id)}
      className={`flex w-full items-center px-3 py-2 rounded-md font-medium text-sm transition-colors ${
        activeTab === id 
          ? 'bg-slate-100 text-e17-navy border border-slate-200' 
          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <Icon className="mr-3 h-4 w-4" /> {label}
    </button>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi global platform E17 Course.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button 
            variant="orange" 
            className="font-bold shadow-sm" 
            onClick={handleSave} 
            disabled={isSaving || isLoading || ((settings.weightAttendance || 0) + (settings.weightTaskAndQuiz || 0) + (settings.weightProject || 0) !== 100)}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <TabButton id="umum" icon={SettingsIcon} label="Umum & Akademik" />
            <TabButton id="keamanan" icon={Shield} label="Keamanan" />
            <TabButton id="notifikasi" icon={Bell} label="Notifikasi Email" />
            <TabButton id="tema" icon={Palette} label="Kustomisasi (Tema)" />
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="card-clean p-6">
            {isLoading ? (
              <div className="py-12 flex justify-center items-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* UMUM & AKADEMIK TAB */}
                {activeTab === 'umum' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-lg font-bold text-e17-dark mb-4 border-b border-slate-100 pb-2">Informasi Umum & Akademik</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Zona Waktu Default</label>
                        <select 
                          value={settings.timezone}
                          onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                        >
                          <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                          <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                          <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Toleransi Keterlambatan Tugas</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={settings.gracePeriodHours}
                            onChange={(e) => setSettings({...settings, gracePeriodHours: parseInt(e.target.value) || 0})}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-12" 
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-slate-500">Jam</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Syarat Minimal Kehadiran (%)</label>
                        <input 
                          type="number" 
                          value={settings.minAttendance}
                          onChange={(e) => setSettings({...settings, minAttendance: parseInt(e.target.value) || 0})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">KKM / Nilai Kelulusan Minimal</label>
                        <input 
                          type="number" 
                          value={settings.passingGrade}
                          onChange={(e) => setSettings({...settings, passingGrade: parseInt(e.target.value) || 0})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Maksimal Pengulangan Kuis</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={settings.maxQuizRetries}
                            onChange={(e) => setSettings({...settings, maxQuizRetries: parseInt(e.target.value) || 0})}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-12" 
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-slate-500">Kali</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Distribusi Bobot Penilaian (%)</h3>
                        <p className="text-xs text-slate-500 mb-3">Total ketiga bobot ini harus tepat 100%.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Kehadiran</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={settings.weightAttendance}
                              onChange={(e) => setSettings({...settings, weightAttendance: parseInt(e.target.value) || 0})}
                              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-8" 
                            />
                            <span className="absolute right-3 top-2 text-sm text-slate-500">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Evaluasi Rutin (Tugas/Quiz)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={settings.weightTaskAndQuiz}
                              onChange={(e) => setSettings({...settings, weightTaskAndQuiz: parseInt(e.target.value) || 0})}
                              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-8" 
                            />
                            <span className="absolute right-3 top-2 text-sm text-slate-500">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Project Akhir</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={settings.weightProject}
                              onChange={(e) => setSettings({...settings, weightProject: parseInt(e.target.value) || 0})}
                              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-8" 
                            />
                            <span className="absolute right-3 top-2 text-sm text-slate-500">%</span>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const total = (settings.weightAttendance || 0) + (settings.weightTaskAndQuiz || 0) + (settings.weightProject || 0);
                        if (total !== 100) {
                          return (
                            <p className="text-xs font-bold text-red-600 mt-2">
                              Total saat ini: {total}%. (Harus 100% untuk dapat menyimpan pengaturan).
                            </p>
                          )
                        }
                        return <p className="text-xs font-bold text-emerald-600 mt-2">Total bobot sudah valid (100%).</p>
                      })()}
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center space-x-3 bg-red-50 p-4 rounded-lg border border-red-100">
                        <input 
                          type="checkbox" 
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                          className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-600"
                        />
                        <div>
                          <span className="block text-sm font-bold text-red-800">Mode Maintenance</span>
                          <span className="block text-xs text-red-600">Aktifkan untuk menutup akses siswa dan mentor sementara waktu.</span>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <input 
                          type="checkbox" 
                          checked={settings.requirePortfolioValidation}
                          onChange={(e) => setSettings({...settings, requirePortfolioValidation: e.target.checked})}
                          className="h-5 w-5 rounded border-blue-300 text-blue-600 focus:ring-blue-600"
                        />
                        <div>
                          <span className="block text-sm font-bold text-blue-800">Wajibkan Validasi Mentor untuk Portofolio</span>
                          <span className="block text-xs text-blue-600">Jika mati, portofolio siswa langsung dipublikasi tanpa menunggu persetujuan.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* KEAMANAN TAB */}
                {activeTab === 'keamanan' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-lg font-bold text-e17-dark mb-4 border-b border-slate-100 pb-2">Pengaturan Keamanan</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sesi Kedaluwarsa (Timeout)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={settings.sessionTimeoutMinutes}
                            onChange={(e) => setSettings({...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 0})}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy pr-16" 
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-slate-500">Menit</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Pengguna akan otomatis logout jika tidak ada aktivitas.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Maksimal Perangkat Aktif</label>
                        <input 
                          type="number" 
                          value={settings.maxActiveDevices}
                          onChange={(e) => setSettings({...settings, maxActiveDevices: parseInt(e.target.value) || 0})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Batas perangkat yang bisa login bersamaan per akun.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFIKASI EMAIL TAB */}
                {activeTab === 'notifikasi' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-lg font-bold text-e17-dark mb-4 border-b border-slate-100 pb-2">Konfigurasi SMTP Email</h2>
                    
                    <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Pengaturan ini digunakan oleh sistem untuk mengirimkan email notifikasi (reset password, nilai tugas, dll). 
                        Pastikan menggunakan kredensial SMTP yang valid.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                        <input 
                          type="text" 
                          placeholder="smtp.example.com"
                          value={settings.smtpHost}
                          onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
                        <input 
                          type="number" 
                          value={settings.smtpPort}
                          onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value) || 0})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP User / Email</label>
                        <input 
                          type="text" 
                          placeholder="no-reply@e17course.com"
                          value={settings.smtpUser}
                          onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={settings.smtpPassword}
                          onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMA TAB */}
                {activeTab === 'tema' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-lg font-bold text-e17-dark mb-4 border-b border-slate-100 pb-2">Kustomisasi Tema & Tampilan</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Warna Aksen Utama</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={settings.primaryColor}
                            onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                            className="h-10 w-20 rounded cursor-pointer border border-slate-300" 
                          />
                          <input 
                            type="text" 
                            value={settings.primaryColor}
                            onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                            className="flex h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy font-mono" 
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Warna yang digunakan untuk tombol dan elemen sorotan utama.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Logo Institusi URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/logo.png"
                          value={settings.logoUrl}
                          onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                        {settings.logoUrl && (
                          <div className="mt-3 p-3 border border-slate-200 rounded-md bg-slate-50 flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={settings.logoUrl} alt="Logo Preview" className="max-h-12 object-contain" />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL Template Sertifikat Default</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/certificate-template.png"
                          value={settings.defaultCertificateUrl}
                          onChange={(e) => setSettings({...settings, defaultCertificateUrl: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy" 
                        />
                        <p className="text-xs text-slate-500 mt-2">Gambar desain sertifikat yang digunakan jika kelas tidak memiliki desain sendiri.</p>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
