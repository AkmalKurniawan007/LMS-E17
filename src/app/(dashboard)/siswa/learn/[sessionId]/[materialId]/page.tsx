"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ArrowLeft, PlayCircle, CheckCircle, FileText, ChevronRight, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export default function SiswaLearningViewerPage({
  params,
}: {
  params: Promise<{ sessionId: string; materialId: string }>
}) {
  const { sessionId, materialId } = use(params)
  const supabase = createClient()
  
  const [material, setMaterial] = React.useState<any>(null)
  const [sessionData, setSessionData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCompleted, setIsCompleted] = React.useState(false)

  React.useEffect(() => {
    fetchData()
  }, [sessionId, materialId])

  const fetchData = async () => {
    setIsLoading(true)
    const [sessRes, matRes] = await Promise.all([
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase.from('materials').select('*').eq('id', materialId).single()
    ])
    
    if (sessRes.data) setSessionData(sessRes.data)
    if (matRes.data) setMaterial({
       id: matRes.data.id,
       title: matRes.data.title,
       type: matRes.data.type,
       url: matRes.data.content_url,
       sessionTitle: sessRes.data?.title || 'Sesi Pembelajaran',
       mode: sessRes.data?.session_type === 'online' ? 'Online' : 'Offline',
       nextItemType: null,
       nextItemId: null
    })
    setIsLoading(false)
  }

  const handleMarkAsComplete = () => {
    setIsCompleted(true)
  }

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
  }

  if (!material) {
    return <div className="text-center py-32 text-slate-500 font-bold">Materi tidak ditemukan.</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center space-x-4 pb-2 border-b border-slate-200">
        <Link href={`/siswa/courses`}>
          <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
            <Link href="/siswa" className="hover:text-e17-navy">Dasbor</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <Link href={`/siswa/courses`} className="hover:text-e17-navy">{material.sessionTitle}</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-slate-700 truncate max-w-[200px] sm:max-w-md">{material.title}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-e17-dark flex items-center">
            {material.type === 'youtube' ? <PlayCircle className="h-6 w-6 mr-2 text-blue-600" /> : <FileText className="h-6 w-6 mr-2 text-red-600" />}
            {material.title}
          </h1>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="card-clean overflow-hidden bg-black rounded-2xl shadow-lg border border-slate-200">
        <div className="aspect-video w-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
          {material.type === "youtube" ? (
            <iframe 
              className="absolute inset-0 w-full h-full"
              src={material.url.replace('watch?v=', 'embed/')}
              title={material.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : material.type === "pdf" ? (
             <iframe 
              className="absolute inset-0 w-full h-full"
              src={material.url}
              title={material.title}
            ></iframe>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-slate-200 flex flex-col justify-center items-center text-center p-8">
               <FileText className="h-16 w-16 text-slate-400 mb-4" />
               <h3 className="text-xl font-bold text-slate-700">{material.title}</h3>
               <p className="text-slate-500 mt-2 mb-6">Materi ini berformat {material.type.toUpperCase()} dan mungkin tidak dapat dipratinjau secara langsung.</p>
               <a href={material.url} target="_blank" rel="noreferrer">
                 <Button className="bg-e17-navy text-white hover:bg-slate-800">Unduh Materi Eksternal</Button>
               </a>
            </div>
          )}
        </div>
      </div>

      {/* Action / Gating Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto mt-8">
         <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
           <CheckCircle className="h-6 w-6 text-emerald-600" />
         </div>
         <h2 className="text-lg font-bold text-e17-dark mb-2">Sudah selesai mempelajari materi ini?</h2>
         <p className="text-sm text-slate-500 mb-6 leading-relaxed">
           Sesuai kebijakan (FR-24A), Anda wajib menekan tombol di bawah ini sebagai tanda bahwa Anda telah selesai membaca/menonton materi ini secara penuh.
         </p>
         
         {!isCompleted ? (
           <div className="w-full space-y-4">
             <Button 
               onClick={handleMarkAsComplete} 
               size="lg" 
               className="w-full sm:w-auto font-bold bg-e17-navy hover:bg-slate-800 text-white h-12 px-8"
             >
               Tandai Selesai
             </Button>
             {material.nextItemType === "quiz" && (
               <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
                 <p className="text-xs text-slate-500 mb-2">Terdapat Kuis setelah materi ini. Selesaikan materi untuk membuka kuis.</p>
                 <Button disabled variant="outline" size="lg" className="w-full bg-slate-50 border-slate-200 text-slate-400 h-12">
                   Lanjut Kerjakan Kuis <HelpCircle className="ml-2 w-4 h-4 opacity-50" />
                 </Button>
               </div>
             )}
           </div>
         ) : (
           <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
             <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-bold flex items-center justify-center">
               <CheckCircle className="w-4 h-4 mr-2" /> Materi berhasil diselesaikan!
             </div>
             
             {material.nextItemType === "quiz" && (
               <Link href={`/siswa/quiz/${material.nextItemId}`} className="block">
                 <Button variant="orange" size="lg" className="w-full font-bold shadow-md h-12">
                   Lanjut Kerjakan Kuis <HelpCircle className="ml-2 w-4 h-4" />
                 </Button>
               </Link>
             )}
           </div>
         )}
      </div>
    </div>
  )
}
