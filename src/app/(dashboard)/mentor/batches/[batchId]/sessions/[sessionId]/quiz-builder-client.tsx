"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Trash2, Save, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function QuizBuilderClient({ quizId, onClose }: { quizId: string, onClose: () => void }) {
  const supabase = createClient()
  const [questions, setQuestions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // New question form state
  const [isAdding, setIsAdding] = React.useState(false)
  const [newQuestionText, setNewQuestionText] = React.useState("")
  const [options, setOptions] = React.useState<{id: string, text: string}[]>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ])
  const [correctAnswerId, setCorrectAnswerId] = React.useState<string>('A')

  React.useEffect(() => {
    fetchQuestions()
  }, [quizId])

  const fetchQuestions = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_number', { ascending: true })

    if (error) {
      toast.error("Gagal memuat pertanyaan: " + error.message)
    } else {
      setQuestions(data || [])
    }
    setIsLoading(false)
  }

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) return toast.error("Pertanyaan tidak boleh kosong")
    if (options.some(o => !o.text.trim())) return toast.error("Semua opsi (A,B,C,D) harus diisi")
      
    // find correct answer text (actually, we can store the ID 'A' or the full text. Storing 'A' is easier)
    // Wait, the schema says correct_answer text. We can just store 'A', 'B', 'C', 'D'
    const { error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: newQuestionText,
        type: 'multiple_choice',
        options: options, // JSONB
        correct_answer: correctAnswerId,
        order_number: questions.length + 1
      })

    if (error) {
      toast.error("Gagal menyimpan pertanyaan: " + error.message)
    } else {
      toast.success("Pertanyaan berhasil ditambahkan")
      setNewQuestionText("")
      setOptions([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ])
      setIsAdding(false)
      fetchQuestions()
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Hapus pertanyaan ini?")) return
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
    if (error) toast.error("Gagal menghapus pertanyaan")
    else {
      toast.success("Pertanyaan dihapus")
      fetchQuestions()
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 relative">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:bg-slate-100 rounded-full">
        <X className="w-5 h-5" />
      </Button>
      
      <h3 className="text-lg font-bold text-e17-dark mb-4">Kelola Soal Kuis</h3>
      
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Memuat pertanyaan...</div>
      ) : (
        <div className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Belum ada pertanyaan. Silakan tambah pertanyaan baru.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-slate-800 text-sm">
                      <span className="text-e17-navy mr-2">{index + 1}.</span>
                      {q.question_text}
                    </p>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 pl-6">
                    {(q.options as any[]).map(opt => (
                      <div key={opt.id} className={`text-sm flex items-center p-2 border rounded-md ${q.correct_answer === opt.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}>
                        <span className="font-bold mr-3 w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-xs">{opt.id}</span>
                        {opt.text}
                        {q.correct_answer === opt.id && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Jawaban Benar</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdding ? (
            <div className="border border-e17-navy/20 bg-blue-50/30 p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Tambah Pertanyaan Baru</h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pertanyaan</label>
                <textarea 
                  value={newQuestionText} 
                  onChange={e => setNewQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm min-h-[80px]"
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Pilihan Jawaban (Pilih salah satu sebagai jawaban benar)</label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-lg border ${correctAnswerId === opt.id ? 'border-e17-navy bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                      <input 
                        type="radio" 
                        name="correctAnswer" 
                        checked={correctAnswerId === opt.id}
                        onChange={() => setCorrectAnswerId(opt.id)}
                        className="w-4 h-4 text-e17-navy ml-2 cursor-pointer"
                      />
                      <span className="font-bold text-slate-500 w-5 text-center">{opt.id}.</span>
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={e => {
                          const newOpts = [...options]
                          newOpts[i].text = e.target.value
                          setOptions(newOpts)
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm bg-white"
                        placeholder={`Pilihan ${opt.id}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-sm">Batal</Button>
                <Button onClick={handleAddQuestion} className="bg-e17-navy text-white hover:bg-blue-900 text-sm">
                  <Save className="w-4 h-4 mr-2" /> Simpan Pertanyaan
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full border-dashed border-2 hover:bg-slate-50 hover:text-e17-navy font-bold">
              <Plus className="w-4 h-4 mr-2" /> Tambah Pertanyaan
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
