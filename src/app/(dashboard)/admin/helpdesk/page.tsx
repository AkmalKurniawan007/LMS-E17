"use client"

import * as React from "react"
import { Ticket, Search, User, Clock, CheckCircle2, MoreVertical, Send, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type TicketStatus = "Open" | "In Progress" | "Resolved"

interface TicketData {
  id: string
  subject: string
  student: string
  time: string
  status: TicketStatus
  messages: { sender: string; isAdmin: boolean; text: string; time: string }[]
}

const MOCK_TICKETS: TicketData[] = [
  {
    id: "TK-1002",
    subject: "Sertifikat salah nama",
    student: "Joko Anwar",
    time: "2 jam lalu",
    status: "Open",
    messages: [
      { sender: "Joko Anwar", isAdmin: false, text: "Halo min, sertifikat kelulusan saya di batch 4 salah nama. Tertulis 'Joko Anwr', kurang huruf a. Mohon bantuannya.", time: "09:30 AM" }
    ]
  },
  {
    id: "TK-1001",
    subject: "Gagal akses modul 3",
    student: "Rina Wijaya",
    time: "Kemarin",
    status: "In Progress",
    messages: [
      { sender: "Rina Wijaya", isAdmin: false, text: "Selamat siang. Saya sudah menyelesaikan kuis modul 2, tapi modul 3 masih terkunci.", time: "Kemarin, 14:00" },
      { sender: "Admin E17", isAdmin: true, text: "Halo Rina, kami sedang mengecek log sistem untuk kendala ini. Mohon ditunggu ya.", time: "Kemarin, 15:30" }
    ]
  },
  {
    id: "TK-0998",
    subject: "Perubahan email akun",
    student: "Budi Santoso",
    time: "3 hari lalu",
    status: "Resolved",
    messages: [
      { sender: "Budi Santoso", isAdmin: false, text: "Min, bisa ganti email akun ini ga ke budis@gmail.com?", time: "01 Sep 2026, 10:00" },
      { sender: "Admin E17", isAdmin: true, text: "Halo Budi, email akun kamu sudah berhasil kami update sesuai permintaan. Silakan login kembali menggunakan email yang baru.", time: "01 Sep 2026, 11:45" },
      { sender: "Budi Santoso", isAdmin: false, text: "Terima kasih min, sudah bisa login.", time: "01 Sep 2026, 12:00" }
    ]
  }
]

export default function HelpdeskPage() {
  const [tickets, setTickets] = React.useState<TicketData[]>(MOCK_TICKETS)
  const [activeTicketId, setActiveTicketId] = React.useState<string>(MOCK_TICKETS[0].id)
  const [replyText, setReplyText] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<TicketStatus | "All">("All")

  const activeTicket = tickets.find(t => t.id === activeTicketId)

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.student.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return

    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: t.status === "Open" ? "In Progress" : t.status, // Auto move to In Progress if replied
          messages: [
            ...t.messages,
            { sender: "Admin E17", isAdmin: true, text: replyText, time: "Baru saja" }
          ]
        }
      }
      return t
    })

    setTickets(updatedTickets as TicketData[])
    setReplyText("")
  }

  const handleResolve = () => {
    if (!activeTicket) return
    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, status: "Resolved" }
      }
      return t
    })
    setTickets(updatedTickets as TicketData[])
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark flex items-center">
            <Ticket className="w-6 h-6 mr-2 text-e17-navy" />
            Tiket Bantuan (Helpdesk)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan tanggapi keluhan atau pertanyaan dari siswa.</p>
        </div>
      </div>

      {/* Main Inbox Layout */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex overflow-hidden">
        
        {/* Left Panel: Ticket List */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari tiket atau siswa..." 
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
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors ${activeTicketId === ticket.id ? 'bg-blue-50/50 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1 pr-2">{ticket.student}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{ticket.time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 truncate">{ticket.subject}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">{ticket.id}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Chat Detail */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{activeTicket.subject}</h2>
                  <div className="flex items-center mt-1 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700 mr-2">{activeTicket.student}</span>
                    <span className="font-mono text-xs mr-3 bg-slate-100 px-1.5 py-0.5 rounded">{activeTicket.id}</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTicket.status !== "Resolved" && (
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={handleResolve}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {activeTicket.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                        {msg.isAdmin ? <User className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs font-semibold text-slate-500 mb-1">{msg.sender} • {msg.time}</span>
                        <div className={`px-4 py-3 rounded-2xl text-sm ${msg.isAdmin ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                          {msg.text}
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
                      disabled={!replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold shadow-sm"
                    >
                      Kirim <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
              <p>Pilih tiket di panel sebelah kiri untuk melihat detail.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
