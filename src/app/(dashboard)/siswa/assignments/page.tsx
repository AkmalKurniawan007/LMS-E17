"use client"

import Link from "next/link"
import { CheckSquare, UploadCloud, Clock, CheckCircle, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SiswaAssignmentsPage() {
  const assignments = [
    { 
      id: 1, 
      title: "Tugas Akhir: MERN Stack E-Commerce", 
      session: "Sesi 10",
      deadline: "20 Sep 2026, 23:59 WIB",
      status: "pending",
      description: "Buat aplikasi E-Commerce sederhana menggunakan MongoDB, Express, React, dan Node.js. Kumpulkan dalam bentuk link repository GitHub dan link deploy (Vercel/Netlify)."
    },
    { 
      id: 2, 
      title: "Tugas Sesi 4: React State", 
      session: "Sesi 4",
      deadline: "10 Agu 2026, 23:59 WIB",
      status: "submitted",
      score: 85,
      feedback: "Logika state sudah bagus. Perhatikan penamaan variabel agar lebih deskriptif."
    },
    { 
      id: 3, 
      title: "Tugas Sesi 2: Javascript Logic", 
      session: "Sesi 2",
      deadline: "01 Agu 2026, 23:59 WIB",
      status: "submitted",
      score: 90,
      feedback: "Sangat baik. Algoritma efisien."
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Tugas & Proyek</h1>
          <p className="text-sm text-slate-500 mt-1">Selesaikan tugas untuk mengukur pemahaman materi Anda.</p>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card-clean overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                    {assignment.session}
                  </span>
                  <h3 className="text-lg font-bold text-e17-dark">{assignment.title}</h3>
                </div>
                
                {assignment.status === "pending" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Belum Dikerjakan
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Sudah Dinilai
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-md border border-slate-100 w-fit">
                <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                Batas Waktu: <strong className="ml-1 text-e17-dark">{assignment.deadline}</strong>
              </div>
              
              {assignment.status === "pending" && (
                <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-lg">
                  {assignment.description}
                </p>
              )}
            </div>

            <div className="p-6 bg-slate-50/50 flex-1">
              {assignment.status === "pending" ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                    <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Unggah File atau Tautan Tugas</span>
                  </div>
                  <Button variant="orange" className="w-full sm:w-auto font-bold shrink-0">
                    Kumpulkan Tugas
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 w-32">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Nilai</span>
                    <span className="text-4xl font-black text-e17-dark">{assignment.score}</span>
                    <span className="text-xs text-slate-400 mt-1">/ 100</span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full">
                    <h4 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Catatan Mentor:
                    </h4>
                    <p className="text-sm text-slate-700 italic">"{assignment.feedback}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
