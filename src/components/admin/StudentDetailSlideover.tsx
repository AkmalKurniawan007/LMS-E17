import React from 'react'
import { X, User, Phone, Mail, MapPin, Building, Calendar, GraduationCap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EnrollmentStatus = "Aktif" | "Lulus" | "Tidak Lulus" | "Mengundurkan Diri"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  batch: string
  status: EnrollmentStatus
  joinedAt: string
  domicile?: string
  birth_date?: string
  institution?: string
  avatar_url?: string
}

interface StudentDetailSlideoverProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  onResendEmail: (email: string) => void
  onManagePortfolio: (student: Student) => void
  isResending: boolean
}

export function StudentDetailSlideover({
  isOpen,
  onClose,
  student,
  onResendEmail,
  onManagePortfolio,
  isResending
}: StudentDetailSlideoverProps) {
  if (!isOpen || !student) return null

  const statusConfig: Record<EnrollmentStatus, { bg: string; text: string; border: string }> = {
    "Aktif":             { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "Lulus":             { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
    "Tidak Lulus":       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"     },
    "Mengundurkan Diri": { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-300"   },
  }

  const cfg = statusConfig[student.status]

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
          <h2 className="text-xl font-bold text-e17-dark">Detail Siswa</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {/* Header Card */}
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{student.name}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <Mail className="h-3 w-3 mr-1.5" />
                  {student.email}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Informasi Pribadi */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Pribadi</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md"><Phone className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">No. Whatsapp</p>
                    <p className="text-sm font-medium text-slate-900">{student.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md"><Calendar className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Tanggal Lahir</p>
                    <p className="text-sm font-medium text-slate-900">
                      {student.birth_date ? new Date(student.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md"><Building className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Institusi</p>
                    <p className="text-sm font-medium text-slate-900">{student.institution || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md"><MapPin className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Domisili</p>
                    <p className="text-sm font-medium text-slate-900">{student.domicile || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Informasi Akademik */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Akademik</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-blue-50 p-1.5 rounded-md border border-blue-100"><GraduationCap className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Batch</p>
                    <p className="text-sm font-bold text-e17-navy">{student.batch}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md"><Clock className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Tanggal Daftar</p>
                    <p className="text-sm font-medium text-slate-900">{student.joinedAt}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />
            
            {/* Aksi Cepat */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Aksi Cepat</h4>
               <div className="space-y-2">
                 <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                    onClick={() => onResendEmail(student.email)}
                    disabled={isResending}
                  >
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {isResending ? "Mengirim Email..." : "Kirim Ulang Email Aktivasi"}
                 </Button>
                 <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                    onClick={() => {
                      onClose();
                      onManagePortfolio(student);
                    }}
                  >
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    Kelola Portofolio Publik
                 </Button>
               </div>
            </div>
            
            <div className="pb-6"></div>

          </div>
        </div>
      </div>
    </>
  )
}
