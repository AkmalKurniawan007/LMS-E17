"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Mail, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import { resetPassword } from "./actions"

const initialState = {
  error: null as string | null,
  success: false,
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState("")

  const validateEmail = (value: string) => {
    if (!value) return "Email wajib diisi."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid."
    return ""
  }

  // ── State: Berhasil Terkirim ──────────────────────────────────────────────
  if (state?.success) {
    return (
      <div className="mt-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-e17-dark mb-2">Email Terkirim!</h2>
        <p className="text-sm text-slate-600 mb-2 leading-relaxed">
          Kami telah mengirimkan tautan reset kata sandi ke:
        </p>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 mb-6">
          <Mail className="h-4 w-4 text-e17-navy shrink-0" />
          <span className="text-sm font-bold text-e17-dark">{email}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-xs">
          Tautan berlaku selama <strong>60 menit</strong> dan hanya dapat digunakan satu kali. Periksa folder <em>Spam</em> jika email tidak muncul dalam beberapa menit.
        </p>
        <Link href="/login">
          <Button variant="orange" className="font-bold shadow-md w-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Halaman Masuk
          </Button>
        </Link>
        <button
          onClick={() => { window.location.reload() }}
          className="mt-4 text-xs text-e17-navy hover:underline font-medium"
        >
          Kirim ulang ke email berbeda
        </button>
      </div>
    )
  }

  // ── State: Form (Idle / Loading) ──────────────────────────────────────────
  return (
    <form className="mt-8 space-y-6" action={formAction}>
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-slate-600 text-center mb-4 leading-relaxed">
          Masukkan alamat email Anda yang terdaftar dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
        </p>
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
            Alamat Email
          </label>
          <Input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(validateEmail(e.target.value))
            }}
            className={emailError ? "border-red-400 focus-visible:ring-red-400" : ""}
            disabled={isPending}
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-1 font-medium">{emailError}</p>
          )}
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
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Tautan Reset"
          )}
        </Button>
      </div>

      <div className="text-center mt-4">
        <Link href="/login" className="text-sm font-medium text-e17-navy hover:text-e17-navy-hover transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Halaman Masuk
        </Link>
      </div>
    </form>
  )
}
