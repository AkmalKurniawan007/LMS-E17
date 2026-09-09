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
    <form className="mt-8 space-y-6" action={formAction}>
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
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
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Kata Sandi
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
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
          className="w-full h-11 text-base font-bold shadow-md"
          disabled={isPending}
        >
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
      </div>
    </form>
  )
}
