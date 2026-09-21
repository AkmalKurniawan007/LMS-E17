import BackgroundSlider from "./background-slider"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <BackgroundSlider />

      {/* Glassmorphism Container */}
      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-6">
            <Image 
              src="/assets/logo-square.png" 
              alt="E17 Logo" 
              width={80} 
              height={80} 
              className="drop-shadow-md"
            />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 drop-shadow-sm">
            Masuk ke E17 Course
          </h2>
          <p className="mt-2 text-sm text-slate-700 font-medium">
            Sistem Manajemen Pembelajaran Terpadu
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
