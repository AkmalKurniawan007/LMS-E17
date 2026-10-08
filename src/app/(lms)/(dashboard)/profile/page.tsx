"use client"

import * as React from "react"
import { User, Mail, Camera, Save, Globe, Eye, EyeOff, LayoutTemplate, Link as LinkIcon, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"

// Simulasi Role (Bisa diubah ke "Mentor" atau "Admin" untuk tes)
const currentUserRole = "Siswa" 

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "portfolio">("profile")
  
  const [isSaved, setIsSaved] = React.useState(false)
  const [isResettingPassword, setIsResettingPassword] = React.useState(false)
  const [resetSent, setResetSent] = React.useState(false)

  // Real Profile Data from Supabase
  const [profile, setProfile] = React.useState({
    name: "",
    email: "",
    phone: "",
    domicile: "",
    birth_date: "",
    institution: "",
    tagline: "",
    bio: "",
    avatarUrl: "",
  })

  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const supabase = createClient()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran maksimal file adalah 2MB")
      return
    }
    
    setIsUploadingAvatar(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Pengguna tidak ditemukan")
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
        
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
        
      setProfile(prev => ({ ...prev, avatarUrl: urlData.publicUrl }))
    } catch (error: any) {
      alert("Gagal mengunggah foto: " + error.message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  React.useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile({
            name: data.full_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            domicile: data.domicile || "",
            birth_date: data.birth_date || "",
            institution: data.institution || "",
            tagline: data.tagline || "",
            bio: data.bio || "",
            avatarUrl: data.avatar_url || "",
          })
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  // Mock Portfolio Data
  const [portfolio, setPortfolio] = React.useState({
    isPublic: true,
    slug: "user-portfolio",
    showGrades: true,
    showAttendance: true,
    showFailedBatches: false,
  })

  const handleResetPassword = async () => {
    if (!profile.email) return
    setIsResettingPassword(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    
    setIsResettingPassword(false)
    if (!error) {
      setResetSent(true)
      setTimeout(() => setResetSent(false), 8000)
    } else {
      alert("Gagal mengirim email reset kata sandi: " + error.message)
    }
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.name,
          phone: profile.phone,
          domicile: profile.domicile,
          birth_date: profile.birth_date,
          institution: profile.institution,
          tagline: profile.tagline,
          bio: profile.bio,
          avatar_url: profile.avatarUrl
        })
        .eq('id', user.id)

      if (!error) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        alert("Gagal menyimpan profil: " + error.message)
      }
    }
  }

  if (isLoading) {
    return <div className="max-w-4xl mx-auto space-y-6 pb-12 p-8 text-center text-slate-500 font-medium">Memuat profil...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Pengaturan Profil</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola informasi pribadi dan preferensi portofolio publik Anda.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" className="border-slate-200 bg-white text-slate-700">
            Batal
          </Button>
          <Button variant="orange" className="font-bold shadow-sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">Perubahan berhasil disimpan.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center ${
            activeTab === "profile" ? "bg-white text-e17-navy shadow-sm" : "text-slate-500 hover:text-e17-dark hover:bg-slate-200"
          }`}
        >
          <User className="w-4 h-4 mr-2" /> Informasi Akun
        </button>
        {currentUserRole === "Siswa" && (
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center ${
              activeTab === "portfolio" ? "bg-white text-e17-navy shadow-sm" : "text-slate-500 hover:text-e17-dark hover:bg-slate-200"
            }`}
          >
            <Globe className="w-4 h-4 mr-2" /> Portofolio Publik
          </button>
        )}
      </div>

      <div className="card-clean overflow-hidden bg-white">
        
        {/* --- TAB: INFORMASI AKUN --- */}
        {activeTab === "profile" && (
          <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
            
            {/* Foto Profil */}
            <div>
              <h3 className="text-sm font-bold text-e17-dark mb-4 uppercase tracking-wider">Foto Profil</h3>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 relative group overflow-hidden shrink-0">
                  {isUploadingAvatar ? (
                    <div className="animate-spin h-6 w-6 border-2 border-e17-navy border-t-transparent rounded-full"></div>
                  ) : profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <User className="h-10 w-10 text-slate-400 group-hover:opacity-0 transition-opacity" />
                  )}
                  <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold">Ubah</span>
                  </label>
                </div>
                <div>
                  <div className="flex gap-3 mb-2">
                    <input type="file" accept="image/*" id="avatarUpload" className="hidden" onChange={handleAvatarUpload} />
                    <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700" onClick={() => document.getElementById('avatarUpload')?.click()} disabled={isUploadingAvatar}>
                      {isUploadingAvatar ? "Mengunggah..." : "Unggah Baru"}
                    </Button>
                    {profile.avatarUrl && (
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setProfile({...profile, avatarUrl: ""})} disabled={isUploadingAvatar}>
                        Hapus
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Format JPG, GIF, atau PNG. Ukuran maksimal 2MB.</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Data Diri */}
            <div>
              <h3 className="text-sm font-bold text-e17-dark mb-4 uppercase tracking-wider">Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                    className="h-11 border-slate-300 focus:border-e17-navy focus:ring-e17-navy"
                    placeholder="Contoh: Akmal Kurniawan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Alamat Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input 
                      type="email"
                      value={profile.email} 
                      onChange={e => setProfile({...profile, email: e.target.value})} 
                      className="h-11 pl-10 bg-slate-50 text-slate-500"
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Email tidak dapat diubah karena terhubung dengan akun utama.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">No. Whatsapp <span className="text-red-500">*</span></label>
                  <Input 
                    type="tel"
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})} 
                    className="h-11 border-slate-300 focus:border-e17-navy focus:ring-e17-navy"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    value={profile.birth_date} 
                    onChange={e => setProfile({...profile, birth_date: e.target.value})} 
                    className="h-11 border-slate-300 focus:border-e17-navy focus:ring-e17-navy"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Institusi <span className="text-red-500">*</span></label>
                  <Input 
                    value={profile.institution} 
                    onChange={e => setProfile({...profile, institution: e.target.value})} 
                    className="h-11 border-slate-300 focus:border-e17-navy focus:ring-e17-navy"
                    placeholder="Universitas / Sekolah / Perusahaan saat ini"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Domisili <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={2}
                    value={profile.domicile} 
                    onChange={e => setProfile({...profile, domicile: e.target.value})} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy focus:border-e17-navy transition-colors resize-none"
                    placeholder="Tolong di isi lengkap (Jalan, RT/RW, Kec, Kota)"
                  />
                </div>

                <div className="col-span-2 h-px bg-slate-100 my-2" />
                
                {currentUserRole === "Siswa" && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Headline / Tagline (Opsional)</label>
                    <Input 
                      value={profile.tagline} 
                      onChange={e => setProfile({...profile, tagline: e.target.value})} 
                      className="h-11 border-slate-300 focus:border-e17-navy focus:ring-e17-navy"
                      placeholder="Contoh: Junior Web Developer"
                    />
                    <p className="text-[10px] text-slate-500">Akan ditampilkan di halaman portofolio Anda.</p>
                  </div>
                )}
                
                <div className="col-span-2 space-y-2 mt-2">
                  <label className="text-sm font-semibold text-slate-700">Bio Singkat</label>
                  <textarea 
                    rows={4}
                    value={profile.bio} 
                    onChange={e => setProfile({...profile, bio: e.target.value})} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy focus:border-e17-navy transition-colors resize-none"
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Keamanan Akun */}
            <div>
              <h3 className="text-sm font-bold text-e17-dark mb-4 uppercase tracking-wider flex items-center gap-2">
                Keamanan Akun
              </h3>
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800">Kata Sandi</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ubah kata sandi Anda untuk menjaga keamanan akun. Tautan verifikasi akan dikirimkan ke email Anda.
                  </p>
                </div>
                
                {resetSent ? (
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle className="h-4 w-4" />
                    Tautan Terkirim!
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="shrink-0 bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? "Mengirim..." : "Ubah Kata Sandi"}
                  </Button>
                )}
              </div>
              {resetSent && (
                <p className="text-xs text-emerald-600 mt-3 font-medium">
                  Cek kotak masuk (atau folder spam) di email <span className="font-bold">{profile.email}</span> untuk memperbarui kata sandi Anda.
                </p>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: PORTOFOLIO PUBLIK --- */}
        {activeTab === "portfolio" && currentUserRole === "Siswa" && (
          <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div>
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  {portfolio.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Status Portofolio: {portfolio.isPublic ? "Publik (Aktif)" : "Privat (Tidak Aktif)"}
                </h3>
                <p className="text-xs text-blue-800 mt-1">
                  {portfolio.isPublic 
                    ? "Portofolio Anda dapat dilihat oleh siapa saja menggunakan tautan (link)." 
                    : "Portofolio Anda disembunyikan dan tidak dapat diakses oleh orang lain."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={portfolio.isPublic}
                  onChange={() => setPortfolio({...portfolio, isPublic: !portfolio.isPublic})}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className={`space-y-8 transition-opacity duration-300 ${!portfolio.isPublic ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-e17-navy" /> Tautan URL Portofolio
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-e17-navy focus-within:border-e17-navy transition-colors">
                  <div className="bg-slate-100 px-4 py-3 flex items-center border-r border-slate-300">
                    <span className="text-sm font-medium text-slate-500">e17course.com/portfolio/</span>
                  </div>
                  <input
                    type="text"
                    value={portfolio.slug}
                    onChange={(e) => setPortfolio({...portfolio, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="flex-1 bg-white px-4 py-3 text-sm font-bold text-e17-dark focus:outline-none"
                    placeholder="nama-kamu"
                  />
                </div>
                <p className="text-xs text-slate-500">Hanya gunakan huruf kecil, angka, dan tanda hubung (-).</p>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div>
                <h3 className="text-sm font-bold text-e17-dark mb-4 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-slate-500" /> Preferensi Tampilan
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-e17-navy bg-slate-100 border-slate-300 rounded focus:ring-e17-navy cursor-pointer"
                        checked={portfolio.showGrades}
                        onChange={(e) => setPortfolio({...portfolio, showGrades: e.target.checked})}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-e17-dark">Tampilkan Nilai Akhir</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tampilkan nilai akhir kelulusan Anda (contoh: 92/100) di setiap sertifikat.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-e17-navy bg-slate-100 border-slate-300 rounded focus:ring-e17-navy cursor-pointer"
                        checked={portfolio.showAttendance}
                        onChange={(e) => setPortfolio({...portfolio, showAttendance: e.target.checked})}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-e17-dark">Tampilkan Persentase Kehadiran</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tampilkan persentase kehadiran Anda (contoh: Kehadiran 100%) sebagai salah satu pencapaian.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-e17-navy bg-slate-100 border-slate-300 rounded focus:ring-e17-navy cursor-pointer"
                        checked={portfolio.showFailedBatches}
                        onChange={(e) => setPortfolio({...portfolio, showFailedBatches: e.target.checked})}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-e17-dark">Tampilkan Program yang Gagal/Drop-Out</p>
                      <p className="text-xs text-slate-500 mt-0.5">Menampilkan riwayat pelatihan meskipun Anda belum berhasil lulus.</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
