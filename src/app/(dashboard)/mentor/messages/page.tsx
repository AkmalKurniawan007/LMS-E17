"use client"

import * as React from "react"
import { Search, Send, CheckCircle2, User, Clock, Image as ImageIcon, Paperclip, MoreVertical } from "lucide-react"

const MOCK_CHATS = [
  { 
    id: 'c1', 
    name: 'Budi Santoso', 
    batch: 'Fullstack JS - Batch 3', 
    lastMessage: 'Halo kak, saya bingung di bagian useEffect..', 
    time: '10:30', 
    unread: 2,
    online: true
  },
  { 
    id: 'c2', 
    name: 'Siti Aminah', 
    batch: 'UI/UX Design - Batch 2', 
    lastMessage: 'Terima kasih atas feedback tugasnya pak!', 
    time: 'Kemarin', 
    unread: 0,
    online: false
  },
  { 
    id: 'c3', 
    name: 'Andi Wijaya', 
    batch: 'Fullstack JS - Batch 3', 
    lastMessage: 'Pak, boleh minta izin telat kumpul tugas?', 
    time: 'Selasa', 
    unread: 0,
    online: true
  }
]

const MOCK_MESSAGES = [
  { id: 'm1', sender: 'Budi Santoso', text: 'Halo kak, selamat pagi.', time: '10:25', isMe: false },
  { id: 'm2', sender: 'Budi Santoso', text: 'Saya bingung di bagian useEffect untuk fetch data API. Kenapa infinite loop ya?', time: '10:26', isMe: false },
  { id: 'm3', sender: 'Me', text: 'Pagi Budi. Coba cek array dependency di akhir useEffect-nya.', time: '10:30', isMe: true },
  { id: 'm4', sender: 'Budi Santoso', text: 'Ah iya! Saya lupa menaruh kurung siku kosong []. Terima kasih kak!', time: '10:32', isMe: false },
]

export default function MentorMessagesPage() {
  const [activeChat, setActiveChat] = React.useState(MOCK_CHATS[0])
  const [inputText, setInputText] = React.useState("")
  const [messages, setMessages] = React.useState(MOCK_MESSAGES)
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    setMessages([...messages, {
      id: `m${Date.now()}`,
      sender: 'Me',
      text: inputText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }])
    setInputText("")
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] min-h-[600px] bg-white border border-slate-200 rounded-2xl shadow-sm flex overflow-hidden">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h1 className="text-lg font-bold text-e17-dark mb-4">Pesan & Diskusi</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari siswa atau pesan..." 
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`p-4 border-b border-slate-100 flex gap-3 cursor-pointer transition-colors ${activeChat.id === chat.id ? 'bg-blue-50 border-l-4 border-l-e17-navy' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {chat.name.charAt(0)}
                </div>
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`text-sm truncate ${chat.unread > 0 ? 'font-bold text-e17-dark' : 'font-semibold text-slate-700'}`}>{chat.name}</h3>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.unread > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-1">{chat.batch}</p>
              </div>
              {chat.unread > 0 && (
                <div className="shrink-0 flex items-center">
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {chat.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Area - Chat Thread */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              {activeChat.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-e17-dark">{activeChat.name}</h2>
              <p className="text-xs font-semibold text-emerald-600">{activeChat.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex gap-2 text-slate-400">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Search className="w-5 h-5"/></button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical className="w-5 h-5"/></button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Hari Ini</span>
          </div>
          
          {messages.map((msg, idx) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isMe ? 'bg-e17-navy text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[10px] mt-1.5 flex justify-end items-center gap-1 ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.time}
                  {msg.isMe && <CheckCircle2 className="w-3 h-3 text-blue-300" />}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button type="button" className="p-3 text-slate-400 hover:text-e17-navy hover:bg-blue-50 rounded-lg transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" className="p-3 text-slate-400 hover:text-e17-navy hover:bg-blue-50 rounded-lg transition-colors shrink-0 hidden sm:block">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Ketik pesan..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="p-3 bg-e17-primary hover:bg-yellow-400 text-e17-navy rounded-xl font-bold transition-colors shrink-0 disabled:opacity-50 disabled:hover:bg-e17-primary"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
