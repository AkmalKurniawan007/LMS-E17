import BackgroundSlider from "./background-slider"
import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left side: Image/Branding (hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <BackgroundSlider />
        
        {/* Left Side Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 max-w-2xl text-white">
          <div className="pt-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image 
                src="/assets/logo-square.png" 
                alt="E17 Logo" 
                width={70} 
                height={70} 
                className="drop-shadow-2xl"
              />
            </Link>
          </div>
          
          <div className="space-y-6 pb-12">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                Tingkatkan Skil <br/> Bangun Karir Anda
              </h1>
              <p className="text-lg text-slate-200/90 max-w-md leading-relaxed drop-shadow">
                E17 Course memberikan pengalaman belajar interaktif dengan mentor profesional dan kurikulum berstandar industri.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 pt-6 border-t border-white/20">
              <div className="flex -space-x-3">
                {[11, 12, 15, 18].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-400 border-2 border-slate-900 overflow-hidden relative shadow-md">
                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="User avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-orange-400 text-sm">
                  {'★'.repeat(5)}
                </div>
                <p className="text-xs text-slate-200 font-medium mt-0.5">Bergabung dengan 10.000+ siswa lainnya</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-10 lg:px-20 xl:px-24 bg-white relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-10">
          <Link href="/">
             <Image 
                src="/assets/logo-square.png" 
                alt="E17 Logo" 
                width={48} 
                height={48}
                className="drop-shadow-sm"
              />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
