import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getSubmissionDetail } from "../actions"
import AssignmentDetailClient from "./assignment-detail-client"

export const dynamic = "force-dynamic"

export default async function MentorAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = await params
  const submission = await getSubmissionDetail(assignmentId)

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="card-clean p-12 flex flex-col items-center justify-center">
          <div className="p-3 bg-amber-50 rounded-full text-amber-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Tugas Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Data pengumpulan tugas dengan ID ini tidak ditemukan atau Anda tidak memiliki akses untuk meninjau tugas ini.
          </p>
          <Link
            href="/mentor/assignments"
            className="mt-6 inline-flex items-center text-sm font-bold bg-e17-navy text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Tugas
          </Link>
        </div>
      </div>
    )
  }

  return <AssignmentDetailClient submission={submission} />
}
