"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminAttendanceRecapPage() {
  const [selectedBatch, setSelectedBatch] = React.useState("B003")

  const sessions = ["S1", "S2", "S3", "S4", "S5", "S6"]
  
  const students = [
    { id: 1, name: "Budi Santoso", attendance: [true, true, true, true, true, true], percentage: 100 },
    { id: 2, name: "Siti Aminah", attendance: [true, false, true, true, true, false], percentage: 66.6 },
    { id: 3, name: "Rina Wijaya", attendance: [true, true, false, false, true, true], percentage: 66.6 },
    { id: 4, name: "Andi Saputra", attendance: [true, true, true, true, false, true], percentage: 83.3 },
    { id: 5, name: "Joko Anwar", attendance: [false, false, true, true, true, true], percentage: 66.6 },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/reports`}>
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Rekap Kehadiran Global</h1>
            <p className="text-sm text-slate-500 mt-1">Pantau matriks kehadiran siswa lintas angkatan.</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white text-slate-700 border-slate-200">
            <Download className="mr-2 h-4 w-4" /> Ekspor ke Excel
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-clean p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 border-slate-200">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filter:</span>
          
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-e17-primary">
            <option>Program: Web Development</option>
            <option>Program: Digital Marketing</option>
          </select>
          
          <select 
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-e17-primary"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="B003">Batch 3 (Aktif)</option>
            <option value="B002">Batch 2 (Selesai)</option>
          </select>
        </div>
      </div>

      <div className="card-clean overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="text-lg font-bold text-e17-dark">Matriks Kehadiran: Web Development - Batch 3</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold border-r border-slate-100 min-w-[200px]">Nama Siswa</th>
                {sessions.map(s => (
                  <th key={s} className="px-3 py-4 font-bold text-center border-r border-slate-100 min-w-[60px]" title={`Sesi ${s.replace('S', '')}`}>{s}</th>
                ))}
                <th className="px-6 py-4 font-bold text-center">Total (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-e17-dark border-r border-slate-100">{student.name}</td>
                  
                  {student.attendance.map((isPresent, i) => (
                    <td key={i} className="px-3 py-4 text-center border-r border-slate-100">
                      {isPresent ? (
                        <div className="flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                      ) : (
                        <div className="flex justify-center"><X className="h-4 w-4 text-red-500" /></div>
                      )}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 text-center font-bold">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${
                      student.percentage >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {student.percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
