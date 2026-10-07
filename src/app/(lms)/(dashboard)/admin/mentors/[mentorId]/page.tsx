"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Users, BookOpen, BarChart3, Award, Clock, TrendingUp, FileText, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { getMentorDetailWithStats } from "../actions"

export default function MentorDetailPage({
  params,
}: {
  params: Promise<{ mentorId: string }>
}) {
  const { mentorId } = use(params)
  const supabase = createClient()
  
  const [mentorData, setMentorData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchMentorDetail()
  }, [])

  const fetchMentorDetail = async () => {
    setIsLoading(true)
    try {
      const result = await getMentorDetailWithStats(mentorId)
      if (result.success) {
        setMentorData(result.data)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error fetching mentor detail:', error)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-500">Memuat detail mentor...</p>
        </div>
      </div>
    )
  }

  if (!mentorData) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-slate-500 mb-4">Mentor tidak ditemukan</p>
        <Link href="/admin/mentors">
          <Button variant="outline">← Kembali ke Daftar Mentor</Button>
        </Link>
      </div>
    )
  }

  const mentor = mentorData.mentor
  const batches = mentorData.batches
  const stats = mentorData.stats

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/mentors">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-e17-dark">{mentor.full_name}</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" /> {mentor.email}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="card-clean p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-600 uppercase">Total Siswa</p>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-e17-dark">{stats.totalStudents}</p>
          <p className="text-xs text-slate-500 mt-2">Di semua batch aktif</p>
        </div>

        {/* Total Batches */}
        <div className="card-clean p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-600 uppercase">Batch Aktif</p>
            <BookOpen className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-4xl font-black text-e17-dark">{batches.length}</p>
          <p className="text-xs text-slate-500 mt-2">Kelas yang diampu</p>
        </div>

        {/* Sessions Progress */}
        <div className="card-clean p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-600 uppercase">Sesi Selesai</p>
            <Clock className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-4xl font-black text-e17-dark">
            {stats.completedSessions}/{stats.totalSessions}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% selesai
          </p>
        </div>

        {/* Average Student Grade */}
        <div className="card-clean p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-600 uppercase">Rata-rata Nilai</p>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-4xl font-black text-e17-dark">{stats.avgStudentGrade}</p>
          <p className="text-xs text-slate-500 mt-2">Nilai siswa mentee</p>
        </div>
      </div>

      {/* Batches Detail */}
      <div className="card-clean overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-e17-dark flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Batch yang Diampu
          </h2>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada batch yang di-assign ke mentor ini</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.map((batch: any) => (
              <div key={batch.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-e17-dark">{batch.name}</h3>
                    <p className="text-sm text-slate-500">{batch.program}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    batch.status === 'berjalan' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : batch.status === 'selesai'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {batch.status === 'berjalan' ? '🔴 Berjalan' : batch.status === 'selesai' ? '✅ Selesai' : '⏳ Akan Datang'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Siswa</p>
                    <p className="text-2xl font-black text-e17-dark">{batch.students}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Sesi</p>
                    <p className="text-2xl font-black text-e17-dark">{batch.sessions}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Progress</p>
                    <div className="relative h-8 bg-slate-100 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                        style={{ width: `${batch.sessions > 0 ? (batch.completedSessions / batch.sessions) * 100 : 0}%` }}
                      >
                        {batch.sessions > 0 && Math.round((batch.completedSessions / batch.sessions) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/batches/${batch.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                      Lihat Batch
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentor Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="card-clean p-6">
          <h3 className="text-lg font-bold text-e17-dark mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informasi Akun
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap</p>
              <p className="text-sm text-e17-dark font-medium">{mentor.full_name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-1">Email</p>
              <p className="text-sm text-e17-dark font-medium">{mentor.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-1">Role</p>
              <p className="text-sm text-e17-dark font-medium">Mentor / Pengajar</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-1">Terdaftar Sejak</p>
              <p className="text-sm text-e17-dark font-medium">
                {new Date(mentor.created_at).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card-clean p-6">
          <h3 className="text-lg font-bold text-e17-dark mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Ringkasan Performa
          </h3>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-700 uppercase mb-1">Tingkat Penyelesaian Sesi</p>
              <p className="text-2xl font-black text-blue-600">
                {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Rata-rata Nilai Siswa</p>
              <p className="text-2xl font-black text-emerald-600">{stats.avgStudentGrade}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs font-bold text-purple-700 uppercase mb-1">Total Siswa Dibimbing</p>
              <p className="text-2xl font-black text-purple-600">{stats.totalStudents} siswa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start pt-4">
        <Link href="/admin/mentors">
          <Button variant="outline" className="font-bold">
            ← Kembali ke Daftar Mentor
          </Button>
        </Link>
      </div>
    </div>
  )
}
