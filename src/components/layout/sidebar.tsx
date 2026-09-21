"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Users, Folder, Settings, FileText, CheckSquare, Award, Scan, Trophy, PieChart, ShieldAlert, Megaphone, Ticket, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export type UserRole = "Super Admin" | "Mentor" | "Siswa"

interface SidebarProps {
  role: UserRole
  className?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ role, className, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = React.useMemo(() => {
    switch (role) {
      case "Super Admin":
        return [
          { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { name: "Manajemen Program", href: "/admin/programs", icon: BookOpen },
          { name: "Manajemen Batch", href: "/admin/batches", icon: Folder },
          { name: "Manajemen Siswa", href: "/admin/students", icon: Users },
          { name: "Manajemen Pengguna", href: "/admin/users", icon: Users },
          { name: "Nilai & Peringkat", href: "/admin/grades", icon: Trophy },
          { name: "Laporan & Data", href: "/admin/reports", icon: PieChart },
          { name: "Sertifikat", href: "/admin/certificates", icon: Award },
          { name: "Portofolio Siswa", href: "/admin/portfolios", icon: Folder },
          { name: "Broadcast", href: "/admin/broadcast", icon: Megaphone },
          { name: "Tiket Bantuan", href: "/admin/helpdesk", icon: Ticket },
          { name: "Log Audit", href: "/admin/audit", icon: ShieldAlert },
          { name: "Pengaturan", href: "/admin/settings", icon: Settings },
        ]
      case "Mentor":
        return [
          { name: "Dashboard", href: "/mentor", icon: LayoutDashboard },
          { name: "Batch Saya", href: "/mentor/batches", icon: BookOpen },
          { name: "Pesan & Diskusi", href: "/mentor/messages", icon: MessageSquare },
          { name: "Penilaian Tugas", href: "/mentor/assignments", icon: CheckSquare },
          { name: "Penilaian Kuis", href: "/mentor/quizzes", icon: FileText },
          { name: "Proyek Akhir", href: "/mentor/projects", icon: Trophy },
          { name: "Validasi Portofolio", href: "/mentor/portfolio-review", icon: Award },
          { name: "Tiket Bantuan", href: "/mentor/helpdesk", icon: Ticket },
        ]
      case "Siswa":
        return [
          { name: "Dashboard", href: "/siswa", icon: LayoutDashboard },
          { name: "Materi Belajar", href: "/siswa/courses", icon: BookOpen },
          { name: "Pesan & Diskusi", href: "/siswa/messages", icon: MessageSquare },
          { name: "Tugas Harian", href: "/siswa/assignments", icon: CheckSquare },
          { name: "Proyek Akhir", href: "/siswa/projects", icon: Trophy },
          { name: "Portofolio", href: "/siswa/portfolio", icon: FileText },
          { name: "Sertifikat", href: "/siswa/certificates", icon: Award },
          { name: "Tiket Bantuan", href: "/siswa/helpdesk", icon: Ticket },
        ]
      default:
        return []
    }
  }, [role])

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-e17-navy border-r border-e17-navy transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center px-6 bg-e17-navy border-b border-white/10 shrink-0">
          <Link href="/" className="flex items-center">
            {/* The wide logo for E17 Course */}
            <img 
              src="/assets/logo-wide.png" 
              alt="E17 Course" 
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-e17-primary"></div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">{role}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isDashboardRoot = item.href === '/admin' || item.href === '/mentor' || item.href === '/siswa'
            const isActive = isDashboardRoot 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white border-l-[3px] border-e17-primary ml-0 pl-[9px]"
                    : "text-blue-100 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent ml-0 pl-[9px]"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-e17-primary" : "text-blue-200 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-white/10 shrink-0 bg-e17-navy-active">
          <div className="flex items-center space-x-3 px-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-200 font-medium truncate">© 2026 E17 Course</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
