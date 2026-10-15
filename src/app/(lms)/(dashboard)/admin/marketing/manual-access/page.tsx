"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function ManualAccessPage() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace("/admin/marketing/orders")
  }, [router])

  return (
    <div className="p-8 text-center text-slate-500">
      Mengalihkan ke halaman Order Pendaftaran...
    </div>
  )
}
