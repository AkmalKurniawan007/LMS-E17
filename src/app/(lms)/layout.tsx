"use client"

import * as React from "react"
import { Sidebar, type UserRole } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Tier, getHighestTier } from "@/lib/access-tier"

import { checkAndSyncStudentRole } from "@/app/(lms)/actions"

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
  const [userTier, setUserTier] = React.useState<Tier>('junior')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
        
        let currentRole = data?.role
        let userEnrollments: any[] | null = null

        // Helper untuk fetch enrollments aktif dengan relasi checkout_orders
        const fetchActiveEnrollments = async () => {
          const { data: enList } = await supabase
            .from('enrollments')
            .select(`
              id,
              status,
              enrollment_source,
              checkout_order_id,
              checkout_orders (
                tier_type
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'aktif')

          return enList || []
        }

        // Jika user belum memiliki role di tabel users, cek apakah memiliki batch aktif
        if (!currentRole) {
          const activeEnrollment = await fetchActiveEnrollments()

          if (activeEnrollment && activeEnrollment.length > 0) {
            currentRole = 'siswa'
            userEnrollments = activeEnrollment
            // Sinkronkan ke database users.role = 'siswa' di background
            checkAndSyncStudentRole().catch(console.error)
          }
        }

        // Proteksi: Jika user sama sekali tidak memiliki role dan tidak punya kelas aktif
        if (!currentRole) {
          window.location.href = '/pembeli/kelas-saya'
          return
        }

        // Update role
        if (currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'super_admin') {
          setUserRole('Super Admin')
        } else if (currentRole === 'mentor') {
          setUserRole('Mentor')
        } else {
          setUserRole('Siswa')
          
          let activeEnrollment = userEnrollments
          if (!activeEnrollment) {
            activeEnrollment = await fetchActiveEnrollments()
          }

          if (!activeEnrollment || activeEnrollment.length === 0) {
            // Cek apakah user punya akses video aktif (junior / video only)
            const { data: va } = await supabase
              .from('video_access')
              .select('id, tier')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .limit(1)

            if (va && va.length > 0) {
              setUserTier((va[0].tier as Tier) || 'junior')
            } else {
              window.location.href = '/pembeli/kelas-saya'
              return
            }
          } else {
            // Siswa terdaftar pada Batch LMS aktif:
            // 1. Jika via checkout_orders: Paket 2 = 'expert', Paket 3 = 'complete'
            // 2. Jika diinput manual oleh Admin (manual_admin / bulk_import): otomatis 'bootcamp'
            const resolvedTiers: Tier[] = activeEnrollment.map((en: any) => {
              const co = Array.isArray(en.checkout_orders) ? en.checkout_orders[0] : en.checkout_orders
              if (co?.tier_type) {
                return co.tier_type as Tier
              }
              // Siswa inputan Admin otomatis menjadi 'bootcamp'
              return 'bootcamp' as Tier
            })

            const effectiveTier = getHighestTier(resolvedTiers)
            setUserTier(effectiveTier)
          }
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
        tier={userTier}
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
