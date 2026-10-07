"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition, Suspense } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function MarketingRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        }
      });

      if (signUpError) {
        setError(signUpError.message || "Gagal mendaftar. Silakan coba lagi.");
        return;
      }

      setSuccess("Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi atau langsung login jika tidak ada verifikasi.");
      
      // Delay to let them read the message, then redirect to login
      setTimeout(() => {
         const currentParams = searchParams.toString();
         router.push(`/pembeli/login${currentParams ? `?${currentParams}` : ''}`);
      }, 3000);
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
        setError("Gagal daftar dengan Google: " + signInError.message);
        return;
      }

      await supabase.rpc('ensure_marketing_profile');
      
      setSuccess("Pendaftaran dengan Google berhasil! Mengalihkan...");
      setTimeout(() => {
         router.push(getRedirectUrl());
      }, 3000);
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
            Mulai karir <br/><span className="text-[var(--color-signal)]">impianmu.</span>
          </h1>
          <p className="text-white/80 text-[17px] font-medium leading-relaxed mb-10 max-w-sm">
            Daftar sekarang dan bergabunglah dengan ribuan siswa yang sudah berhasil meraih karir di industri teknologi.
          </p>
        </div>
        
        <div className="relative z-10 text-white/50 text-[13px] font-medium">
          © {new Date().getFullYear()} E17 Course. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12 relative bg-white overflow-y-auto">
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
              Daftar Akun
            </h2>
            <p className="text-[var(--color-muted)] text-[16px] font-medium">Buat akun baru untuk memulai perjalanan.</p>
          </div>

          <div className="space-y-6">
            <div className="w-full flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setError("Gagal mendaftar dengan Google")}
                theme="outline"
                size="large"
                text="signup_with"
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

            <form className="space-y-5" onSubmit={handleRegister}>
              {error && (
                <div className="p-4 text-[14px] text-red-600 bg-red-50 border-l-4 border-red-500 font-bold rounded-r-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 text-[14px] text-[var(--color-ink)] bg-[var(--color-signal)]/20 border-l-4 border-[var(--color-signal)] font-bold rounded-r-lg">
                  {success}
                </div>
              )}
              
              <div className="space-y-2.5">
                <label className="text-[13px] font-black uppercase tracking-wider text-[var(--color-ink)]">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso" 
                  className="w-full h-[54px] px-4 rounded-xl border-2 border-[var(--color-cream-line)] bg-[var(--color-paper)] focus:bg-white focus:outline-none focus:border-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-ink)]/5 transition-all text-[var(--color-ink)] font-bold placeholder:text-[var(--color-muted-light)] placeholder:font-medium" 
                  required 
                />
              </div>

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
                <label className="text-[13px] font-black uppercase tracking-wider text-[var(--color-ink)]">Kata Sandi</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-[54px] px-4 rounded-xl border-2 border-[var(--color-cream-line)] bg-[var(--color-paper)] focus:bg-white focus:outline-none focus:border-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-ink)]/5 transition-all text-[var(--color-ink)] font-bold placeholder:text-[var(--color-muted-light)] placeholder:font-medium" 
                  required
                  minLength={6}
                />
                <p className="text-xs text-[var(--color-muted-light)] font-medium">Minimal 6 karakter.</p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-[54px] mt-6 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-white text-[15px] font-black rounded-full transition-all disabled:opacity-50 disabled:hover:scale-100 focus:ring-4 focus:ring-[var(--color-ink)]/20"
              >
                {isPending ? "Memproses..." : "Daftar Akun"}
              </Button>
            </form>

            <p className="text-center text-[15px] text-[var(--color-muted)] pt-6 font-medium">
              Sudah punya akun?{" "}
              <Link href={`/pembeli/login?next=${next}`} className="font-bold text-[var(--color-ink)] hover:bg-[var(--color-signal)] hover:text-[var(--color-ink)] px-2 py-1 rounded transition-colors underline decoration-2 decoration-[var(--color-signal)]/50 underline-offset-4">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingRegisterPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-signal)] border-t-transparent rounded-full"></div></div>}>
        <MarketingRegisterForm />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
