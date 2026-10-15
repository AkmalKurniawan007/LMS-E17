import * as React from "react"
import { Lock, ArrowUpRight, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export const UPGRADE_URL = "https://wa.me/6281399271717?text=Halo%20Admin%20E17%20Course,%20saya%20ingin%20upgrade%20ke%20Paket%203%20(Pro%20Bootcamp%20BNSP)"

interface BnspLockedBannerProps {
  className?: string
}

export function BnspLockedBanner({ className = "" }: BnspLockedBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 p-5 md:p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900">
                Fitur Terkunci
              </span>
              <span className="text-xs font-semibold text-amber-800">Khusus Paket Pro Bootcamp & Bootcamp Penuh</span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-800 leading-relaxed">
              Hak Ujian BNSP terkunci. Upgrade ke Paket 3 (Pro Bootcamp) untuk mengikuti ujian resmi BNSP.
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <a
            href={UPGRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Upgrade Paket
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
