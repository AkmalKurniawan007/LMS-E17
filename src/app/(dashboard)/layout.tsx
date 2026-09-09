"use client"

import * as React from "react"
import { Sidebar, type UserRole } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [userName, setUserName] = React.useState<string>("Memuat...")
  const pathname = usePathname()
  const supabase = createClient()

  // Determine mock role based on URL for demonstration purposes
  let role: UserRole = "Siswa"
  if (pathname?.startsWith("/admin")) role = "Super Admin"
  if (pathname?.startsWith("/mentor")) role = "Mentor"

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find user full_name
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (data?.full_name) {
          setUserName(data.full_name)
        } else {
          setUserName(user.email || "Pengguna")
        }
      } else {
        // Fallback for development if not logged in
        const mockUser: Record<string, string> = {
          "Super Admin": "Admin (Dev Mode)",
          "Mentor": "Mentor (Dev Mode)",
          "Siswa": "Siswa (Dev Mode)",
        }
        setUserName(mockUser[role] || "Pengguna")
      }
    }
    fetchUser()
  }, [role])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        role={role} 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <Topbar 
          role={role} 
          userName={userName} 
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
