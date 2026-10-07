"use client"

import * as React from "react"
import { Sidebar, type UserRole } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LmsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [userName, setUserName] = React.useState<string>("Memuat...")
  const [userAvatar, setUserAvatar] = React.useState<string | undefined>(undefined)
  const pathname = usePathname()
  const supabase = createClient()

  let initialRole: UserRole = "Siswa"
  if (pathname?.startsWith("/admin")) initialRole = "Super Admin"
  if (pathname?.startsWith("/mentor")) initialRole = "Mentor"

  const [userRole, setUserRole] = React.useState<UserRole>(initialRole)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
        
        // Proteksi: Jika query berhasil tapi user tidak memiliki role LMS (baru daftar di marketing)
        if (!error && !data?.role) {
          window.location.href = '/'
          return
        }

        // Update role from database
        if (data?.role === 'admin') setUserRole('Super Admin')
        else if (data?.role === 'mentor') setUserRole('Mentor')
        else setUserRole('Siswa')

        // Proteksi: Wajib lengkapi profil (terutama dari Google login) sebelum akses kelas/LMS
        const isProfileIncomplete = !data?.phone || !data?.domicile || !data?.birth_date || !data?.institution
        if (isProfileIncomplete && pathname !== '/profile') {
          // Kasih peringatan menggunakan alert bawaan browser agar user paham kenapa dialihkan
          alert("PERHATIAN: Anda wajib melengkapi data profil (Whatsapp, Domisili, dll) terlebih dahulu sebelum dapat mengakses fitur LMS.")
          // Force redirect ke profil
          window.location.href = '/profile'
          return
        }

        if (data?.full_name) {
          setUserName(data.full_name)
        } else {
          setUserName(user.email || "Pengguna")
        }
        setUserAvatar(data?.avatar_url || undefined)
      } else {
        const mockUser: Record<string, string> = {
          "Super Admin": "Admin (Dev Mode)",
          "Mentor": "Mentor (Dev Mode)",
          "Siswa": "Siswa (Dev Mode)",
        }
        setUserName(mockUser[userRole] || "Pengguna")
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [pathname, supabase])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-6">
          <img 
            src="/assets/Logo.gif" 
            alt="Memuat..." 
            className="w-40 h-40 object-contain"
          />
          <span className="text-slate-500 font-medium tracking-wide">Memeriksa kredensial...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        role={userRole}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex w-0 flex-1 flex-col overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 overflow-hidden mt-16">
          <img
            src="/assets/logo-square.png"
            alt="Watermark"
            className="w-full max-w-[30rem] object-contain opacity-[0.08] mix-blend-multiply"
          />
        </div>

        <div className="z-50 relative flex-shrink-0">
          <Topbar
            role={userRole}
            userName={userName}
            avatarUrl={userAvatar}
            onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          />
        </div>

        <main className="relative flex-1 overflow-y-auto focus:outline-none z-10">
          <div className="py-6 px-4 sm:px-6 lg:px-8 animate-fade-in min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
