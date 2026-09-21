"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CalendarEvent {
  id: string
  title: string
  time: string
  type?: 'online' | 'offline' | string
  metadata?: any
}

interface CalendarWidgetProps {
  events?: { date: string; items: CalendarEvent[] }[]
  onDateClick?: (date: string, events: CalendarEvent[]) => void
  selectedDate?: string | null
}

export function CalendarWidget({ events = [], onDateClick, selectedDate }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  const days = []
  
  // Fill empty spaces before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  // Fill days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  // Helper to format date to YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-e17-dark text-lg">
          {monthNames[month]} {year}
        </h3>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-100 rounded-full">
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-9 w-full"></div>
          }

          const dateStr = formatDateString(year, month, day)
          const dayEvents = events.find(e => e.date === dateStr)?.items || []
          const hasEvents = dayEvents.length > 0
          const isToday = isCurrentMonth && day === today.getDate()
          const isSelected = selectedDate === dateStr

          return (
            <div key={day} className="flex flex-col items-center justify-center p-0.5 relative group">
              <button
                onClick={() => {
                  if (onDateClick) onDateClick(dateStr, dayEvents)
                }}
                className={`
                  relative h-9 w-full rounded-lg flex flex-col items-center justify-center transition-all duration-200
                  ${isSelected ? 'bg-e17-navy text-white shadow-md font-bold scale-105' : ''}
                  ${!isSelected && isToday ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200' : ''}
                  ${!isSelected && !isToday ? 'text-slate-600 hover:bg-slate-100 font-medium' : ''}
                  ${hasEvents && !isSelected ? 'hover:text-e17-navy' : ''}
                `}
              >
                <span className="text-sm">{day}</span>
                
                {/* Event Indicator Dot */}
                {hasEvents && (
                  <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></span>
                )}
              </button>
              
              {/* Tooltip on Hover for Events */}
              {hasEvents && !isSelected && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-800 text-white text-[10px] rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  <span className="font-bold block mb-0.5">{dayEvents.length} Jadwal:</span>
                  {dayEvents.slice(0,2).map((ev, i) => (
                    <span key={i} className="block truncate opacity-90">• {ev.title}</span>
                  ))}
                  {dayEvents.length > 2 && <span className="block opacity-75 italic">+{dayEvents.length - 2} lainnya</span>}
                  
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-800"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
