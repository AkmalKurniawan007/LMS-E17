"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, UploadCloud, Link as LinkIcon, FileText, CheckCircle2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AssignmentSubmissionPage() {
  const [submissionType, setSubmissionType] = React.useState<"file" | "link">("file")
  const [isSubmitted, setIsSubmitted] = React.useState(true) // Mock as already submitted for demo

  // Mock Data
  const assignmentData = {
    title: "Tugas Akhir: Membangun RESTful API dengan Express",
    description: "Buatlah sebuah REST API sederhana menggunakan Express.js yang mengimplementasikan CRUD operasi untuk entitas 'Produk'. Pastikan kode Anda di-push ke GitHub dan deploy ke platform seperti Render/Railway.",
    deadline: "25 Agu 2026, 23:59 WIB",
    status: "Graded",
    submittedAt: "24 Agu 2026, 14:30 WIB",
    grade: 85,
    mentorFeedback: "Implementasi CRUD sudah sangat baik dan terstruktur. Struktur routing juga rapi. Saran perbaikan: Tambahkan validasi input pada body request untuk endpoint POST dan PUT agar lebih aman. Secara keseluruhan sudah mantap!",
    mentorName: "Mentor Siti"
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/siswa">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pengumpulan Tugas</h1>
          <p className="text-sm text-gray-500">Sesi 6: API Integration</p>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">{assignmentData.title}</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Batas Waktu:</span>
              <span className="font-semibold text-red-600">{assignmentData.deadline}</span>
            </div>
          </div>
          <div className="prose prose-sm text-gray-600">
            <p>{assignmentData.description}</p>
          </div>
        </div>
      </div>

      {/* Mentor Feedback Section (If Graded) */}
      {assignmentData.status === "Graded" && (
        <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm overflow-hidden p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-green-800 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Tugas Telah Dinilai
            </h3>
            <div className="text-2xl font-extrabold text-green-700">{assignmentData.grade} <span className="text-sm font-medium text-green-600">/ 100</span></div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
              Catatan dari {assignmentData.mentorName}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{assignmentData.mentorFeedback}"
            </p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {isSubmitted ? "Hasil Pengumpulan Anda" : "Form Pengumpulan"}
          </h3>
          
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-2 border-b border-gray-200 pb-4">
                <Button 
                  variant={submissionType === "file" ? "default" : "ghost"}
                  onClick={() => setSubmissionType("file")}
                  className={submissionType === "file" ? "bg-e17-yellow text-e17-dark" : "text-gray-500"}
                >
                  <UploadCloud className="mr-2 h-4 w-4" /> Unggah File
                </Button>
                <Button 
                  variant={submissionType === "link" ? "default" : "ghost"}
                  onClick={() => setSubmissionType("link")}
                  className={submissionType === "link" ? "bg-e17-yellow text-e17-dark" : "text-gray-500"}
                >
                  <LinkIcon className="mr-2 h-4 w-4" /> Tautan Eksternal
                </Button>
              </div>

              {/* Form Areas */}
              {submissionType === "file" ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <UploadCloud className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-900 mb-1">Pilih file atau tarik ke sini</p>
                  <p className="text-xs text-gray-500">Mendukung PDF, ZIP (Maks. 10MB)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                      Tautan Proyek (GitHub, Figma, GDrive, dll)
                    </label>
                    <Input id="url" type="url" placeholder="https://github.com/username/project" />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea 
                      id="notes" 
                      rows={3}
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-e17-yellow focus-visible:border-e17-yellow"
                      placeholder="Masukkan catatan untuk mentor..."
                    ></textarea>
                  </div>
                </div>
              )}

              <Button variant="orange" className="w-full text-[#1A1A1A] font-bold h-12">
                Kumpulkan Tugas
              </Button>
            </div>
          ) : (
            // Submitted State View
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <ClockIcon className="mr-2 h-4 w-4" />
                Dikumpulkan pada: <span className="font-medium text-gray-900 ml-1">{assignmentData.submittedAt}</span>
              </div>
              
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div className="min-w-0 flex-1">
                  <a href="#" className="text-sm font-medium text-blue-600 truncate hover:underline block">
                    https://github.com/siswajoko/express-rest-api
                  </a>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="w-full">Edit Pengumpulan</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClockIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
