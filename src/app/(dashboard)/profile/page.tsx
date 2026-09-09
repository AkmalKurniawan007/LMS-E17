"use client"

import * as React from "react"
import { User, Mail, Camera, Save, Globe, Eye, EyeOff, LayoutTemplate, Link as LinkIcon, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Simulasi Role (Bisa diubah ke "Mentor" atau "Admin" untuk tes)
const currentUserRole = "Siswa" 

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "portfolio">("profile")
  
  const [isSaved, setIsSaved] = React.useState(false)

  // Mock Profile Data
  const [profile, setProfile] = React.useState({
    name: "Rina Wijaya",
    email: "rina.w@example.com",
    tagline: "UI/UX Designer & Frontend Developer",
    bio: "Lulusan program UI/UX Design Masterclass E17 Course. Bersemangat menciptakan pengalaman pengguna yang intuitif dan estetik.",
    avatarUrl: "",
  })

  // Mock Portfolio Data
  const [portfolio, setPortfolio] = React.useState({
    isPublic: true,
    slug: "rina-wijaya",
    showGrades: true,
    showAttendance: true,
    showFailedBatches: false,
  })

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
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
                <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 relative group overflow-hidden">
                  <User className="h-10 w-10 text-slate-400 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex gap-3 mb-2">
                    <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700">Unggah Baru</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Hapus</Button>
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
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Alamat Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input 
                      type="email"
                      value={profile.email} 
                      onChange={e => setProfile({...profile, email: e.target.value})} 
                      className="h-11 pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Email tidak dapat diubah karena terhubung dengan akun utama Anda.</p>
                </div>
                
                {currentUserRole === "Siswa" && (
                  <div className="col-span-2 space-y-2 mt-2">
                    <label className="text-sm font-semibold text-slate-700">Headline / Tagline (Opsional)</label>
                    <Input 
                      value={profile.tagline} 
                      onChange={e => setProfile({...profile, tagline: e.target.value})} 
                      className="h-11"
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
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy focus:border-e17-navy transition-colors resize-none"
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>
              </div>
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
