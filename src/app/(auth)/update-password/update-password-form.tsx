"use client"

import { useActionState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { updatePassword } from "./actions"
import { toast } from "sonner"

const initialState = {
  error: null as string | null,
  success: false,
}

export default function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  
  // Tangkap error dari URL jika Supabase menolak token saat di-klik
  const urlError = searchParams.get("error_description")

  useEffect(() => {
    if (state?.success) {
      toast.success("Kata sandi berhasil diperbarui!")
      router.push("/login")
    }
  }, [state, router])

  if (urlError) {
    return (
      <div className="mt-8 text-center animate-in fade-in">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm text-red-800 font-medium">Tautan ini sudah tidak berlaku.</p>
          <p className="text-xs text-red-600 mt-1">
            (Sistem mendeteksi: {urlError.replace(/\+/g, ' ')})
          </p>
        </div>
        <Button onClick={() => router.push('/forgot-password')} variant="outline" className="w-full">
          Minta Tautan Baru
        </Button>
      </div>
    )
  }

  return (
    <form className="mt-8 space-y-6" action={formAction}>
      <input type="hidden" name="code" value={code || ""} />
      
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Kata Sandi Baru
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Min. 6 karakter"
            minLength={6}
            disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Konfirmasi Kata Sandi Baru
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="Ketik ulang kata sandi"
            minLength={6}
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="orange"
          className="w-full h-11 text-base font-bold shadow-md"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Perbarui Kata Sandi"
          )}
        </Button>
      </div>
    </form>
  )
}
