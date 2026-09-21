"use client"

import * as React from "react"
import { Ticket, Search, User, Clock, CheckCircle2, MoreVertical, Send, MessageSquare, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createTicket, replyToTicket } from "./actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"

type TicketStatus = "Open" | "In Progress" | "Resolved"

interface TicketData {
  id: string
  subject: string
  status: TicketStatus
  created_at: string
  helpdesk_messages: { sender_id: string; is_admin: boolean; message: string; created_at: string }[]
}

export default function SiswaHelpdeskClient({ initialTickets }: { initialTickets: TicketData[] }) {
  const [tickets, setTickets] = React.useState<TicketData[]>(initialTickets)
  const [activeTicketId, setActiveTicketId] = React.useState<string | null>(initialTickets[0]?.id || null)
  const [replyText, setReplyText] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<TicketStatus | "All">("All")
  const [isCreating, setIsCreating] = React.useState(false)
  const [newSubject, setNewSubject] = React.useState("")
  const [newMsg, setNewMsg] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const activeTicket = tickets.find(t => t.id === activeTicketId)

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "Open": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Open</span>
      case "In Progress": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">In Progress</span>
      case "Resolved": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Resolved</span>
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicket) return
    setIsSubmitting(true)
    const result = await replyToTicket(activeTicket.id, replyText)
    if (result.error) {
      toast.error("Gagal mengirim pesan: " + result.error)
    } else {
      // Optimistic update
      const updatedTickets = tickets.map(t => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            helpdesk_messages: [
              ...t.helpdesk_messages,
              { sender_id: "me", is_admin: false, message: replyText, created_at: new Date().toISOString() }
            ]
          }
        }
        return t
      })
      setTickets(updatedTickets)
      setReplyText("")
    }
    setIsSubmitting(false)
  }

  const handleCreateNew = async () => {
    if (!newSubject.trim() || !newMsg.trim()) return
    setIsSubmitting(true)
    const result = await createTicket(newSubject, newMsg)
    if (result.error) {
      toast.error("Gagal membuat tiket: " + result.error)
    } else {
      toast.success("Tiket berhasil dibuat, harap refresh untuk melihat.") // Ideally we fetch new data here or router.refresh
      setIsCreating(false)
      setNewSubject("")
      setNewMsg("")
      window.location.reload()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark flex items-center">
            <Ticket className="w-6 h-6 mr-2 text-e17-navy" />
            Tiket Bantuan (Helpdesk)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sampaikan laporan atau kendala teknis Anda di sini.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => setIsCreating(true)} className="bg-e17-primary hover:bg-e17-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Buat Tiket
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari tiket..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    filterStatus === status 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Tidak ada tiket yang ditemukan.</div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => { setActiveTicketId(ticket.id); setIsCreating(false); }}
                  className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors ${activeTicketId === ticket.id && !isCreating ? 'bg-blue-50/50 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 truncate">{ticket.subject}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono truncate mr-2">{ticket.id.slice(0, 8)}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {isCreating ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Buat Tiket Baru</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subjek Laporan</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Contoh: Kesalahan penulisan pada modul 3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pesan / Detail</label>
                  <textarea
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Jelaskan detail kendala atau laporan Anda..."
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNew} disabled={isSubmitting || !newSubject.trim() || !newMsg.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>Batal</Button>
                </div>
              </div>
            </div>
          ) : activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{activeTicket.subject}</h2>
                  <div className="flex items-center mt-1 text-sm text-slate-500">
                    <span className="font-mono text-xs mr-3 bg-slate-100 px-1.5 py-0.5 rounded">#{activeTicket.id.slice(0, 8)}</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {activeTicket.helpdesk_messages.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg, idx) => (
                  <div key={idx} className={`flex ${!msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${!msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${!msg.is_admin ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className={`flex flex-col ${!msg.is_admin ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs font-semibold text-slate-500 mb-1">
                          {!msg.is_admin ? 'Anda' : 'Admin'} • {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: localeId })}
                        </span>
                        <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${!msg.is_admin ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                {activeTicket.status === "Resolved" ? (
                  <div className="bg-slate-100 rounded-lg p-4 text-center text-sm text-slate-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    Tiket ini sudah ditandai selesai. Pesan baru tidak dapat dikirim.
                  </div>
                ) : (
                  <div className="flex gap-3 items-end">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Ketik balasan Anda di sini..."
                      className="flex-1 max-h-32 min-h-[44px] resize-y px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold shadow-sm"
                    >
                      {isSubmitting ? "..." : <><span className="hidden sm:inline">Kirim</span> <Send className="w-4 h-4 sm:ml-2" /></>}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
              <p>Pilih tiket di panel sebelah kiri atau buat tiket baru.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
