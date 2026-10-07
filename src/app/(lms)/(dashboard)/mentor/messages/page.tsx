"use client"

import * as React from "react"
import { Search, Send, CheckCircle2, User, Clock, Image as ImageIcon, Paperclip, MoreVertical, Users, MessageSquare, Plus, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { getChatRooms, getRoomMessages, sendMessage, getAvailableStudentsForMentor, createDirectMessageRoom, type ChatRoom, type ChatMessage } from "./actions"

export default function MentorMessagesPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = React.useState<'group' | 'direct'>('group')
  
  const [rooms, setRooms] = React.useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = React.useState<ChatRoom | null>(null)
  
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputText, setInputText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSending, setIsSending] = React.useState(false)

  // Modal State
  const [showNewChatModal, setShowNewChatModal] = React.useState(false)
  const [availableStudents, setAvailableStudents] = React.useState<{id: string, name: string, email: string}[]>([])
  const [searchStudent, setSearchStudent] = React.useState("")
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false)
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load Rooms
  const loadRooms = async () => {
    setIsLoading(true)
    const data = await getChatRooms()
    setRooms(data)
    setIsLoading(false)
    return data
  }

  React.useEffect(() => {
    loadRooms().then(data => {
      if (data.length > 0 && !activeRoom) {
        const firstOfTab = data.find(r => r.type === activeTab)
        if (firstOfTab) {
          setActiveRoom(firstOfTab)
        }
      }
    })
  }, [])

  // Load Messages when active room changes
  React.useEffect(() => {
    if (!activeRoom) return
    
    async function loadMessages() {
      const msgs = await getRoomMessages(activeRoom!.id)
      setMessages(msgs)
      scrollToBottom()
      
      // clear unread locally
      setRooms(prev => prev.map(r => r.id === activeRoom!.id ? { ...r, unreadCount: 0 } : r))
    }
    
    loadMessages()
  }, [activeRoom])
  
  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time subscription
  React.useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMsg = payload.new as any
        
        if (activeRoom && newMsg.room_id === activeRoom.id) {
          const msgs = await getRoomMessages(activeRoom.id)
          setMessages(msgs)
        } else {
          const data = await getChatRooms()
          setRooms(data)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeRoom, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeRoom || isSending) return
    
    const textToSend = inputText.trim()
    setInputText("") 
    setIsSending(true)
    
    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      room_id: activeRoom.id,
      sender_id: 'me',
      sender_name: 'Saya',
      content: textToSend,
      created_at: new Date().toISOString(),
      isMe: true
    }
    setMessages(prev => [...prev, optimisticMsg])
    
    const { success } = await sendMessage(activeRoom.id, textToSend)
    
    if (!success) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      alert('Gagal mengirim pesan')
    }
    
    setIsSending(false)
  }

  // Load students for modal
  React.useEffect(() => {
    if (showNewChatModal && availableStudents.length === 0) {
      setIsLoadingStudents(true)
      getAvailableStudentsForMentor().then(data => {
        setAvailableStudents(data)
        setIsLoadingStudents(false)
      })
    }
  }, [showNewChatModal])

  const handleStartNewChat = async (studentId: string) => {
    setIsCreatingRoom(true)
    const { roomId, error } = await createDirectMessageRoom(studentId)
    setIsCreatingRoom(false)
    
    if (error || !roomId) {
      alert(error || 'Gagal membuat ruang pesan')
      return
    }

    setShowNewChatModal(false)
    const data = await loadRooms()
    
    setActiveTab('direct')
    const newRoom = data.find(r => r.id === roomId)
    if (newRoom) {
      setActiveRoom(newRoom)
    }
  }

  const formatTime = (isoDate: string | null) => {
    if (!isoDate) return ''
    const d = new Date(isoDate)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const filteredRooms = rooms.filter(r => r.type === activeTab)
  const filteredStudents = availableStudents.filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()))

  return (
    <>
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] min-h-[600px] bg-white border border-slate-200 rounded-2xl shadow-sm flex overflow-hidden">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50 relative">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-e17-dark">Pesan & Diskusi</h1>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 bg-e17-navy text-white rounded-md hover:bg-blue-900 transition-colors"
                title="Pesan Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
              <button 
                onClick={() => {
                  setActiveTab('group')
                  if (activeRoom?.type !== 'group') setActiveRoom(null)
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center transition-colors ${activeTab === 'group' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Users className="w-4 h-4 mr-1.5" /> Grup Kelas
              </button>
              <button 
                onClick={() => {
                  setActiveTab('direct')
                  if (activeRoom?.type !== 'direct') setActiveRoom(null)
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center transition-colors ${activeTab === 'direct' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4 mr-1.5" /> Personal
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-slate-500">
                <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">Belum ada ruang percakapan {activeTab === 'group' ? 'grup' : 'personal'}.</p>
                {activeTab === 'direct' && (
                  <button onClick={() => setShowNewChatModal(true)} className="mt-4 text-xs font-bold text-e17-navy bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    Mulai Chat Baru
                  </button>
                )}
              </div>
            ) : (
              filteredRooms.map(room => (
                <div 
                  key={room.id} 
                  onClick={() => setActiveRoom(room)}
                  className={`p-4 border-b border-slate-100 flex gap-3 cursor-pointer transition-colors ${activeRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-e17-navy' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase">
                      {room.type === 'group' ? <Users className="w-5 h-5 text-slate-400"/> : (room.name ? room.name.charAt(0) : '?')}
                    </div>
                    {room.type === 'direct' && room.otherUser?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm truncate ${room.unreadCount > 0 ? 'font-bold text-e17-dark' : 'font-semibold text-slate-700'}`}>{room.name}</h3>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">{formatTime(room.lastMessageTime)}</span>
                    </div>
                    <p className={`text-xs truncate ${room.unreadCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                      {room.lastMessage || 'Belum ada pesan.'}
                    </p>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="shrink-0 flex items-center">
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {room.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right Area - Chat Thread */}
        {activeRoom ? (
          <div className="hidden md:flex flex-1 flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase">
                  {activeRoom.type === 'group' ? <Users className="w-5 h-5 text-slate-400"/> : (activeRoom.name ? activeRoom.name.charAt(0) : '?')}
                </div>
                <div>
                  <h2 className="font-bold text-e17-dark">{activeRoom.name}</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {activeRoom.type === 'group' ? 'Grup Diskusi' : (activeRoom.otherUser?.online ? <span className="text-emerald-600">Online</span> : 'Personal')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 text-slate-400">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Search className="w-5 h-5"/></button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical className="w-5 h-5"/></button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              
              {messages.map((msg, idx) => {
                const showName = activeRoom.type === 'group' && !msg.isMe
                
                return (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      {showName && (
                        <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">{msg.sender_name}</span>
                      )}
                      <div className={`rounded-2xl px-4 py-3 ${msg.isMe ? 'bg-e17-navy text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[10px] mt-1.5 flex justify-end items-center gap-1 ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {formatTime(msg.created_at)}
                          {msg.isMe && <CheckCircle2 className="w-3 h-3 text-blue-300" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button type="button" className="p-3 text-slate-400 hover:text-e17-navy hover:bg-blue-50 rounded-lg transition-colors shrink-0 hidden sm:block">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  placeholder="Ketik pesan..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isSending}
                  className="p-3 bg-e17-primary hover:bg-yellow-400 text-e17-navy rounded-xl font-bold transition-colors shrink-0 disabled:opacity-50 disabled:hover:bg-e17-primary"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col bg-slate-50 items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-semibold text-sm">Pilih ruang percakapan untuk mulai mengirim pesan.</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-e17-dark">Pesan Baru</h2>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama siswa..." 
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingStudents ? (
                <div className="p-6 text-center text-sm text-slate-500">Memuat data siswa...</div>
              ) : availableStudents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Tidak ada siswa yang aktif di kelas Anda.</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Siswa tidak ditemukan.</div>
              ) : (
                filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStartNewChat(student.id)}
                    disabled={isCreatingRoom}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
