"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SiswaQuizEnginePage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = use(params)
  
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Mock Data
  const quiz = {
    title: "Kuis Sesi 4: React State Dasar",
    session: "Sesi 4: State Management",
    timeLimit: "15 Menit",
    passingGrade: 80,
    questions: [
      {
        id: 1,
        text: "Apa kegunaan utama dari hook useState dalam React?",
        options: [
          "Untuk melakukan HTTP request ke server",
          "Untuk mendeklarasikan variabel yang nilainya bisa berubah dan memicu re-render",
          "Untuk mengatur routing antar halaman",
          "Untuk mengubah style CSS secara dinamis"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "Bagaimana cara mendeklarasikan state awal array kosong menggunakan useState?",
        options: [
          "const [data, setData] = useState(0)",
          "const [data, setData] = useState('')",
          "const [data, setData] = useState([])",
          "const [data, setData] = useState({})"
        ],
        correctAnswer: 2
      }
    ]
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedOption(null) // Reset selection for next question
    } else {
      setIsSubmitted(true)
    }
  }

  // Simulated Score Calculation
  const mockScore = 100;
  const isPassed = mockScore >= quiz.passingGrade;

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${isPassed ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isPassed ? <Trophy className="h-12 w-12 text-emerald-600" /> : <XCircle className="h-12 w-12 text-red-600" />}
        </div>
        
        <h1 className="text-3xl font-black text-e17-dark mb-2">
          {isPassed ? "Selamat! Anda Lulus Kuis" : "Sayang Sekali, Anda Belum Lulus"}
        </h1>
        <p className="text-slate-500 mb-8">{quiz.title}</p>
        
        <div className="card-clean p-8 w-full max-w-md mb-8">
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Nilai Akhir</p>
           <div className={`text-6xl font-black ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
              {mockScore}
           </div>
           <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">Batas Kelulusan (Passing Grade): {quiz.passingGrade}</p>
        </div>
        
        <div className="flex gap-4 w-full max-w-md">
           {!isPassed && (
             <Button variant="outline" className="flex-1 border-slate-300 h-12 font-bold">Ulangi Kuis</Button>
           )}
           <Link href="/siswa/courses" className="flex-1">
             <Button variant="orange" className="w-full h-12 font-bold shadow-md">
               {isPassed ? 'Kembali ke Daftar Sesi' : 'Pelajari Ulang Materi'}
             </Button>
           </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <Link href="/siswa/courses">
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">{quiz.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{quiz.session}</p>
          </div>
        </div>
        <div className="flex items-center">
           <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
             <Clock className="w-4 h-4 mr-2 text-e17-navy" /> 14:59
           </span>
        </div>
      </div>

      {/* Progress & Info */}
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
         <div className="flex items-center text-blue-800 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-2" /> Jangan tutup tab ini sebelum ujian selesai.
         </div>
         <div className="text-sm font-bold text-blue-900">
            Soal {currentQuestion + 1} dari {quiz.questions.length}
         </div>
      </div>
      
      {/* Question Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2">
         <div className="bg-e17-navy h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion) / quiz.questions.length) * 100}%` }}></div>
      </div>

      {/* Question Card */}
      <div className="card-clean p-6 md:p-10 min-h-[400px] flex flex-col">
         <h2 className="text-xl font-bold text-e17-dark mb-8 leading-relaxed">
            {currentQuestion + 1}. {quiz.questions[currentQuestion].text}
         </h2>
         
         <div className="space-y-3 flex-1">
            {quiz.questions[currentQuestion].options.map((option, idx) => (
              <label 
                key={idx} 
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedOption === idx 
                    ? 'border-e17-navy bg-blue-50 ring-1 ring-e17-navy shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 mr-4 shrink-0 rounded-full border border-slate-300 bg-white">
                   {selectedOption === idx && <div className="w-3 h-3 bg-e17-navy rounded-full"></div>}
                </div>
                <input 
                  type="radio" 
                  name={`question-${currentQuestion}`} 
                  className="hidden" 
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                />
                <span className={`text-sm ${selectedOption === idx ? 'font-semibold text-e17-navy' : 'text-slate-700'}`}>
                  {option}
                </span>
              </label>
            ))}
         </div>
         
         <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
            <Button 
              variant="orange" 
              size="lg" 
              className="font-bold shadow-md px-8"
              disabled={selectedOption === null}
              onClick={handleNext}
            >
              {currentQuestion < quiz.questions.length - 1 ? "Soal Selanjutnya" : "Submit Jawaban"}
            </Button>
         </div>
      </div>
    </div>
  )
}
