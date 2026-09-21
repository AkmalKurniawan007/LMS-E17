"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle, Trophy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { logAction } from "@/utils/logger-actions"

export default function SiswaQuizEnginePage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = use(params)
  
  const supabase = createClient()
  
  const [answers, setAnswers] = React.useState<string[]>([])
  const [score, setScore] = React.useState(0)
  const [attemptCount, setAttemptCount] = React.useState(0)
  const [isSaved, setIsSaved] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [quiz, setQuiz] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    setIsLoading(true)
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) return

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*, sessions(title)')
      .eq('id', quizId)
      .single()

    if (quizError) {
      toast.error("Gagal memuat kuis")
      setIsLoading(false)
      return
    }

    const { data: questionsData, error: qError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_number', { ascending: true })

    if (!qError && questionsData) {
      setQuiz({
        ...quizData,
        sessionTitle: quizData.sessions?.title || 'Sesi',
        questions: questionsData.map((q: any) => ({
          id: q.id,
          text: q.question_text,
          options: q.options || [],
          correctAnswer: q.correct_answer
        }))
      })
    }

    // Check attempts
    const { data: attemptData } = await supabase
      .from('quiz_attempts')
      .select('id, score, is_passed')
      .eq('quiz_id', quizId)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (attemptData && attemptData.length > 0) {
      setAttemptCount(attemptData.length)
      const bestScore = Math.max(...attemptData.map((a: any) => Number(a.score)))
      if (bestScore === 100 || attemptData.length >= quizData.max_retries) {
        setScore(bestScore)
        setIsSubmitted(true)
        setIsSaved(true)
      }
    }

    setIsLoading(false)
  }

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx)
    if (!quiz) return
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = quiz.questions[currentQuestion].options[idx].id
    setAnswers(newAnswers)
  }

  const saveScore = async (finalScore: number, currentAttempts: number) => {
    setIsSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    
    const isPassed = finalScore >= quiz.passing_grade

    const { error } = await supabase.from('quiz_attempts').insert({
      quiz_id: quiz.id,
      user_id: userData.user?.id,
      score: finalScore,
      is_passed: isPassed,
      attempt_number: currentAttempts + 1
    })

    if (error) {
      toast.error("Gagal menyimpan nilai: " + error.message)
    } else {
      if (userData.user) {
        await logAction('siswa', 'Pengerjaan Kuis', `Menyelesaikan kuis "${quiz.title}" dengan nilai ${finalScore}`, { user_id: userData.user.id, target_id: quiz.id })
      }
      toast.success("Nilai berhasil disimpan!")
      setIsSaved(true)
      setAttemptCount(prev => prev + 1)
    }
    setIsSaving(false)
  }

  const handleNext = async () => {
    if (!quiz) return
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedOption(null) // Reset selection for next question
    } else {
      // Calculate score
      let correctCount = 0
      quiz.questions.forEach((q: any, i: number) => {
         if (answers[i] === String(q.correctAnswer)) {
           correctCount++
         }
      })
      const calculatedScore = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0
      setScore(calculatedScore)
      setIsSubmitted(true)

      // Auto save if score is 100 or max retries reached
      if (calculatedScore === 100 || attemptCount + 1 >= quiz.max_retries) {
         await saveScore(calculatedScore, attemptCount)
      }
    }
  }

  const isPassed = quiz ? score >= quiz.passing_grade : false;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat kuis...</p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-xl font-bold text-slate-700">Kuis Tidak Ditemukan</h2>
      </div>
    )
  }

  const isPastDeadline = quiz.deadline ? new Date() > new Date(quiz.deadline) : false;

  if (isPastDeadline) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-24 w-24 rounded-full bg-rose-100 flex items-center justify-center mb-6 shadow-xl">
           <AlertCircle className="h-12 w-12 text-rose-600" />
        </div>
        <h2 className="text-2xl font-black text-e17-dark mb-2">Waktu Pengerjaan Habis</h2>
        <p className="text-slate-500 mb-6 max-w-md">Batas waktu untuk mengerjakan kuis ini telah terlewati pada {new Date(quiz.deadline).toLocaleString('id-ID')}. Anda tidak dapat lagi mengikuti atau mengulangi kuis ini.</p>
        <Link href="/siswa/courses">
           <Button variant="outline" className="font-bold border-slate-300">Kembali ke Daftar Sesi</Button>
        </Link>
      </div>
    )
  }

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
              {score}
           </div>
           <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">Batas Kelulusan (Passing Grade): {quiz.passing_grade}</p>
        </div>
        
        <div className="flex gap-4 w-full max-w-md mt-6">
           {!isSaved && score < 100 && attemptCount < quiz.max_retries && (
             <Button variant="outline" className="flex-1 border-slate-300 h-12 font-bold" onClick={() => {
                setCurrentQuestion(0)
                setAnswers([])
                setSelectedOption(null)
                setIsSubmitted(false)
             }}>Ulangi Kuis</Button>
           )}
           
           {!isSaved ? (
             <Button variant="orange" className="flex-1 h-12 font-bold shadow-md" disabled={isSaving} onClick={() => saveScore(score, attemptCount)}>
               {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Selesai (Simpan Nilai)
             </Button>
           ) : (
             <Link href="/siswa/courses" className="w-full">
               <Button variant="orange" className="w-full h-12 font-bold shadow-md">
                 Kembali ke Daftar Sesi
               </Button>
             </Link>
           )}
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
            <p className="text-sm text-slate-500 mt-1">{quiz.sessionTitle}</p>
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
            {quiz.questions[currentQuestion].options.map((option: any, idx: number) => (
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
                  onChange={() => handleSelectOption(idx)}
                />
                <span className="font-bold text-slate-500 mr-3 w-5">{option.id}.</span>
                <span className={`text-sm ${selectedOption === idx ? 'font-semibold text-e17-navy' : 'text-slate-700'}`}>
                  {option.text}
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
