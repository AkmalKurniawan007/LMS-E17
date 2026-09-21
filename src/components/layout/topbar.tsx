"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Bell, User, Search, Check, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import type { UserRole } from "./sidebar"

interface TopbarProps {
  role: UserRole
  userName: string
  onMobileMenuToggle: () => void
}

export function Topbar({ role, userName, onMobileMenuToggle }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false)
  
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    // Initial set
    setCurrentTime(new Date())
    // Update every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    fetchNotifications()
    
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      setNotifications(data.map(n => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: timeAgo(n.created_at),
        unread: !n.is_read
      })))
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 60)
    if (diff < 1) return `Baru saja`
    if (diff < 60) return `${diff} menit lalu`
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`
    return `${Math.floor(diff / 1440)} hari lalu`
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleMarkAllRead = async () => {
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 sm:px-6 lg:px-8 border-b border-slate-200 shadow-sm">
      <div className="flex flex-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2 text-slate-500 hover:text-slate-900"
          onClick={onMobileMenuToggle}
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Search Bar */}
        <div className="hidden lg:flex lg:flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari materi atau fitur..."
              className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-e17-primary focus:border-e17-primary transition-colors hover:border-slate-300 text-e17-dark"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`relative text-slate-500 hover:text-slate-900 ${isNotificationOpen ? 'bg-slate-100 text-slate-900' : ''}`}
            aria-label="Notifications"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-e17-primary ring-2 ring-white" />
            )}
          </Button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-e17-dark text-sm">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[11px] font-semibold text-e17-navy hover:underline flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Belum ada notifikasi.
                  </div>
                ) : notifications.map(notif => (
                  <div key={notif.id} className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread && unreadCount > 0 ? 'bg-blue-50/30' : ''}`}>
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${notif.unread && unreadCount > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm ${notif.unread && unreadCount > 0 ? 'font-bold text-e17-dark' : 'font-medium text-slate-700'}`}>{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                  <Link href="#" className="text-xs font-bold text-e17-navy hover:underline">Lihat Semua Notifikasi</Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            {currentTime && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <span className="text-sm font-semibold text-e17-dark leading-none mb-1">{userName}</span>
            <span className="text-xs text-slate-500 font-medium leading-none">{role}</span>
          </div>
          <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-e17-navy transition-colors cursor-pointer" title="Profil">
            <User className="h-4 w-4" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer" 
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
