"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition, Suspense } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function MarketingLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const getRedirectUrl = () => {
    try {
      const url = new URL(next, window.location.origin);
      const program = searchParams.get('program');
      const tier = searchParams.get('tier');
      if (program) url.searchParams.set('program', program);
      if (tier) url.searchParams.set('tier', tier);
      return url.pathname + url.search;
    } catch {
      return next;
    }
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Email atau kata sandi salah.");
        return;
      }

      await supabase.rpc('ensure_marketing_profile');
      
      router.push(getRedirectUrl());
      router.refresh();
    });
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setError("");
    startTransition(async () => {
      if (!credentialResponse.credential) {
        setError("Gagal mendapatkan token dari Google.");
        return;
      }
      
      const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (signInError) {
        setError("Gagal login dengan Google: " + signInError.message);
        return;
      }

      await supabase.rpc('ensure_marketing_profile');
      
      router.push(getRedirectUrl());
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left: Branding Banner (Hidden on mobile) */}
      <div 
        className="hidden lg:flex lg:w-[45%] p-12 flex-col justify-between relative overflow-hidden bg-cover bg-center bg-[var(--color-ink)]"
        style={{ backgroundImage: "url('/assets/BG LOGIN 2.jpg')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink)]/95 via-[var(--color-ink)]/80 to-[var(--color-ink)]/40 mix-blend-multiply"></div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-signal)] opacity-20 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none"></div>
        <div aria-hidden className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <img src="/assets/logo-wide.png" alt="E17 Course" className="h-10 lg:h-12 object-contain" />
          </Link>
          <Link href="/" className="flex items-center text-white/80 hover:text-[var(--color-ink)] hover:bg-[var(--color-signal)] transition-colors text-[13px] font-bold uppercase tracking-widest gap-2 bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-sm border border-white/20">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>

        <div className="relative z-10 max-w-[460px] mt-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-6">
             <Sparkles className="w-3.5 h-3.5 text-[var(--color-signal)]" />
             <span className="text-[10px] font-black tracking-widest text-white uppercase">Portal Pembelajar</span>
          </div>
          
          <h1 className="font-display italic text-white text-[56px] lg:text-[64px] font-black mb-6 leading-[1] tracking-tight uppercase text-balance">
            Selamat datang <br/><span className="text-[var(--color-signal)]">kembali.</span>
          </h1>
          <p className="text-white/80 text-[17px] font-medium leading-relaxed mb-10 max-w-sm">
            Lanjutkan perjalanan belajar Anda. Akses materi, kumpulkan portfolio, dan capai karir impian di industri teknologi.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-signal)]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-signal)]/20 transition-colors duration-700"></div>
            
            <div className="flex -space-x-3 mb-5 relative z-10">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full bg-[var(--color-ink)] border-2 border-black/40 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}&backgroundColor=f8fafc`} alt="Avatar" />
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full bg-[var(--color-signal)] border-2 border-black/40 flex items-center justify-center text-[var(--color-ink)] text-xs font-black z-10">
                 +10k
               </div>
            </div>
            <p className="text-white/90 text-[14px] font-medium leading-snug relative z-10">
              Bergabung bersama ribuan alumni yang telah berkarir di tech company ternama.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-white/50 text-[13px] font-medium">
          © {new Date().getFullYear()} E17 Course. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12 relative bg-white">
        <Link href="/" className="absolute top-6 left-6 lg:hidden flex items-center justify-center w-10 h-10 bg-[var(--color-paper)] border border-[var(--color-cream-line)] rounded-full text-[var(--color-ink)] hover:bg-[var(--color-signal)] shadow-sm transition-all z-10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="w-full max-w-[400px] my-auto pt-8 pb-8">
          <div className="text-center mb-10 flex flex-col items-center">
            <Link href="/" className="inline-flex items-center gap-2 group transition-opacity hover:opacity-80 mb-8 lg:hidden">
              <span className="bg-[var(--color-signal)] text-[var(--color-ink)] font-black text-[18px] px-2 py-0.5 rounded italic">E17</span>
              <span className="text-[var(--color-ink)] font-display italic font-black text-2xl tracking-tight uppercase">Course</span>
            </Link>
            <h2 className="font-display italic uppercase text-[36px] lg:text-[40px] font-black text-[var(--color-ink)] mb-2 tracking-tight leading-[1]">
              Masuk Akun
            </h2>
            <p className="text-[var(--color-muted)] text-[16px] font-medium">Silakan masuk untuk melanjutkan.</p>
          </div>

          <div className="space-y-6">
            <div className="w-full flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setError("Gagal login dengan Google")}
                theme="outline"
                size="large"
                text="continue_with"
                width="400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-cream-line)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[var(--color-muted)] text-[11px] font-black uppercase tracking-widest">atau dengan email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 text-[14px] text-red-600 bg-red-50 border-l-4 border-red-500 font-bold rounded-r-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-2.5">
                <label className="text-[13px] font-black uppercase tracking-wider text-[var(--color-ink)]">Alamat Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" 
                  className="w-full h-[54px] px-4 rounded-xl border-2 border-[var(--color-cream-line)] bg-[var(--color-paper)] focus:bg-white focus:outline-none focus:border-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-ink)]/5 transition-all text-[var(--color-ink)] font-bold placeholder:text-[var(--color-muted-light)] placeholder:font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-black uppercase tracking-wider text-[var(--color-ink)]">Kata Sandi</label>
                  <Link href="/forgot-password" className="text-[13px] font-bold text-[var(--color-ink)] hover:text-[var(--color-signal)] hover:underline transition-colors">Lupa sandi?</Link>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-[54px] px-4 rounded-xl border-2 border-[var(--color-cream-line)] bg-[var(--color-paper)] focus:bg-white focus:outline-none focus:border-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-ink)]/5 transition-all text-[var(--color-ink)] font-bold placeholder:text-[var(--color-muted-light)] placeholder:font-medium" 
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-[54px] mt-6 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-white text-[15px] font-black rounded-full transition-all disabled:opacity-50 disabled:hover:scale-100 focus:ring-4 focus:ring-[var(--color-ink)]/20"
              >
                {isPending ? "Memproses..." : "Masuk ke Akun"}
              </Button>
            </form>

            <p className="text-center text-[15px] text-[var(--color-muted)] pt-6 font-medium">
              Belum punya akun?{" "}
              <Link href={`/pembeli/register?next=${next}`} className="font-bold text-[var(--color-ink)] hover:bg-[var(--color-signal)] hover:text-[var(--color-ink)] px-2 py-1 rounded transition-colors underline decoration-2 decoration-[var(--color-signal)]/50 underline-offset-4">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingLoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-signal)] border-t-transparent rounded-full"></div></div>}>
        <MarketingLoginForm />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
