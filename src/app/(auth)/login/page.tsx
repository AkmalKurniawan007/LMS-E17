"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "./actions"

const initialState = {
  error: null as string | null,
  success: false,
  redirectUrl: null as string | null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      router.push(state.redirectUrl)
    }
  }, [state, router])

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Selamat Datang Kembali
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Masuk ke akun Anda untuk melanjutkan pembelajaran.
        </p>
      </div>

      <form className="space-y-6" action={formAction}>
        {state?.error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="email-address" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Alamat Email
          </label>
          <Input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
            className="h-11"
          />
        </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-11"
            />
          </div>
        </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-e17-navy focus:ring-e17-navy"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
            Ingat saya
          </label>
        </div>

        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-e17-navy hover:text-e17-navy-hover transition-colors">
            Lupa kata sandi?
          </Link>
        </div>
      </div>

        <div>
          <Button 
            type="submit" 
            variant="orange" 
            className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
            disabled={isPending}
          >
            {isPending ? "Memproses..." : "Masuk ke Dashboard"}
          </Button>
        </div>
      </form>
    </div>
  )
}
