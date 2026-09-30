"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { programs, formatPrice } from "@/components/marketing/data/marketing-data";
import { ShieldCheck, CheckCircle, ArrowLeft, Building, Wallet, Upload, Loader2, Copy, Check, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createCheckoutOrder,
  getActivePaymentAccounts,
  uploadPaymentProof,
  type PaymentAccount,
} from "@/app/(dashboard)/admin/marketing/actions";
import { createClient } from "@/utils/supabase/client";
import { mapMarketingTierToAccessTier } from "@/utils/tier-mapping";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const programId = searchParams.get("program");
  const tierParam = searchParams.get("tier");
  
  const program = programs.find((p) => p.id === programId);
  
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);
  
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Program tidak ditemukan</h2>
        <Link href="/" className="text-orange-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-600">Memuat...</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    const currentPath = `/checkout?program=${programId}&tier=${tierParam || 'complete'}`;
    return (
      <div className="max-w-md mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Login Diperlukan
          </h2>
          <p className="text-slate-600 mb-6">
            Anda harus login terlebih dahulu untuk melanjutkan proses checkout dan pemesanan program <strong>{program.name}</strong>.
          </p>
          <div className="space-y-3">
            <Link 
              href={`/login?redirect=${encodeURIComponent(currentPath)}`}
              className="block w-full bg-e17-navy hover:bg-e17-navy/90 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Login Sekarang
            </Link>
            <Link 
              href={`/register?redirect=${encodeURIComponent(currentPath)}`}
              className="block w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Belum Punya Akun? Daftar
            </Link>
            <Link 
              href="/"
              className="block text-sm text-slate-500 hover:text-slate-700 mt-4"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [selectedTierType, setSelectedTierType] = React.useState<string>(tierParam || 'complete');
  const selectedTier = program.tiers?.find((t) => t.type === selectedTierType) || program.tiers?.[0];
  const price = selectedTier?.price || program.price;
  const originalPrice = selectedTier?.originalPrice || program.originalPrice;
  const isDiscounted = originalPrice > price;

  const [paymentAccounts, setPaymentAccounts] = React.useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [orderCreated, setOrderCreated] = React.useState(false);
  const [createdOrderId, setCreatedOrderId] = React.useState<string>("");
  
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    getActivePaymentAccounts().then(accounts => {
      setPaymentAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    });
  }, []);

  const handleCreateOrder = async () => {
    if (!selectedTier || !selectedAccountId) {
      setSubmitError("Pilih rekening tujuan terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createCheckoutOrder({
        programId: program.id,
        programName: program.name,
        tierType: mapMarketingTierToAccessTier(selectedTier.type),
        tierLabel: selectedTier.label,
        amount: selectedTier.price,
        paymentMethod: 'manual_transfer',
        paymentAccountId: selectedAccountId,
      });
      if (!result.success || !result.orderId) {
        setSubmitError(result.error ?? "Gagal membuat order. Coba lagi.");
        return;
      }
      setCreatedOrderId(result.orderId);
      setOrderCreated(true);
    } catch {
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !createdOrderId) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadPaymentProof(createdOrderId, proofFile);
      if (!result.success) {
        setUploadError(result.error ?? "Gagal upload bukti pembayaran.");
        return;
      }
      setUploadSuccess(true);
      setTimeout(() => {
        window.location.href = "/siswa?upload=success";
      }, 1500);
    } catch {
      setUploadError("Terjadi kesalahan saat upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selectedAccount = paymentAccounts.find(acc => acc.id === selectedAccountId);
  const bankAccounts = paymentAccounts.filter(a => a.method_type === 'bank_transfer');
  const ewalletAccounts = paymentAccounts.filter(a => a.method_type === 'ewallet');

  if (orderCreated && selectedAccount) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-screen">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-slate-600 text-center mb-8">
            Silakan transfer pembayaran ke rekening di bawah ini, lalu upload bukti pembayaran.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              {selectedAccount.method_type === 'bank_transfer' ? (
                <Building className="w-5 h-5 text-slate-600" />
              ) : (
                <Wallet className="w-5 h-5 text-slate-600" />
              )}
              <h2 className="text-lg font-bold text-slate-900">{selectedAccount.provider_name}</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {selectedAccount.method_type === 'bank_transfer' ? 'Nomor Rekening' : 'Nomor/ID'}
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200">
                  <span className="font-bold text-slate-900 text-lg">{selectedAccount.account_number}</span>
                  <button
                    onClick={() => handleCopy(selectedAccount.account_number, 'number')}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {copiedField === 'number' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Atas Nama
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200">
                  <span className="font-semibold text-slate-900">{selectedAccount.account_holder}</span>
                  <button
                    onClick={() => handleCopy(selectedAccount.account_holder, 'holder')}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {copiedField === 'holder' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Jumlah Transfer
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200">
                  <span className="font-bold text-slate-900 text-xl">{formatPrice(price)}</span>
                  <button
                    onClick={() => handleCopy(price.toString(), 'amount')}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {copiedField === 'amount' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {selectedAccount.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-4">
                  <p className="text-xs text-blue-900">{selectedAccount.instructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Upload Bukti Pembayaran
            </h3>
            
            {uploadSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-900 font-semibold">Bukti pembayaran berhasil diupload!</p>
                <p className="text-green-700 text-sm mt-1">Mengarahkan ke dashboard...</p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:font-semibold file:text-sm hover:file:bg-slate-800"
                />
                <p className="text-xs text-slate-500 mb-4">Format: JPG atau PNG, maksimal 5MB</p>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
                    {uploadError}
                  </div>
                )}

                <Button
                  onClick={handleUploadProof}
                  disabled={!proofFile || isUploading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Bukti Pembayaran
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Selesaikan Pendaftaran Anda</h1>
            <p className="text-slate-600">Pilih paket dan rekening tujuan untuk segera memulai kelas Anda.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">Program Terpilih</h2>
            <div className="flex flex-col md:flex-row gap-4 items-start">
               <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-8 h-8 text-orange-500" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-900">{program.name}</h3>
                 <p className="text-slate-600 text-sm mt-1">{program.description}</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">Pilih Paket Belajar</h2>
             <div className="space-y-3">
               {program.tiers?.map(tier => (
                 <label 
                   key={tier.type} 
                   className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                     selectedTierType === tier.type 
                     ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500' 
                     : 'border-slate-200 hover:border-slate-300 bg-white'
                   }`}
                 >
                   <input 
                     type="radio" 
                     name="tier" 
                     value={tier.type} 
                     checked={selectedTierType === tier.type}
                     onChange={(e) => setSelectedTierType(e.target.value)}
                     className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300"
                   />
                   <div className="ml-3 flex-1">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-slate-900">{tier.label}</span>
                       <span className="font-bold text-slate-900">{formatPrice(tier.price)}</span>
                     </div>
                     <ul className="mt-2 space-y-1">
                       {tier.features.slice(0, 3).map((feat, i) => (
                         <li key={i} className="text-xs text-slate-600 flex items-center">
                           <CheckCircle className="w-3 h-3 text-green-500 mr-1.5 shrink-0" /> {feat}
                         </li>
                       ))}
                     </ul>
                   </div>
                 </label>
               ))}
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">Pilih Rekening Tujuan Transfer</h2>
             {paymentAccounts.length === 0 ? (
               <p className="text-slate-500 text-sm">Memuat rekening pembayaran...</p>
             ) : (
               <div className="space-y-4">
                 {bankAccounts.length > 0 && (
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Transfer Bank</p>
                     <div className="space-y-2">
                       {bankAccounts.map(acc => (
                         <label
                           key={acc.id}
                           className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                             selectedAccountId === acc.id
                             ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                             : 'border-slate-200 hover:border-slate-300'
                           }`}
                         >
                           <input
                             type="radio"
                             name="account"
                             value={acc.id}
                             checked={selectedAccountId === acc.id}
                             onChange={(e) => setSelectedAccountId(e.target.value)}
                             className="mt-0.5 w-4 h-4 text-slate-900 focus:ring-slate-900"
                           />
                           <div className="ml-3 flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <Building className="w-4 h-4 text-slate-600" />
                               <span className="font-semibold text-slate-900">{acc.provider_name}</span>
                             </div>
                             <p className="text-xs text-slate-600">{acc.account_number} - {acc.account_holder}</p>
                           </div>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}

                 {ewalletAccounts.length > 0 && (
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">E-Wallet</p>
                     <div className="space-y-2">
                       {ewalletAccounts.map(acc => (
                         <label
                           key={acc.id}
                           className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                             selectedAccountId === acc.id
                             ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                             : 'border-slate-200 hover:border-slate-300'
                           }`}
                         >
                           <input
                             type="radio"
                             name="account"
                             value={acc.id}
                             checked={selectedAccountId === acc.id}
                             onChange={(e) => setSelectedAccountId(e.target.value)}
                             className="mt-0.5 w-4 h-4 text-slate-900 focus:ring-slate-900"
                           />
                           <div className="ml-3 flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <Wallet className="w-4 h-4 text-slate-600" />
                               <span className="font-semibold text-slate-900">{acc.provider_name}</span>
                             </div>
                             <p className="text-xs text-slate-600">{acc.account_number} - {acc.account_holder}</p>
                           </div>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-xl p-6 text-white sticky top-24 shadow-xl">
             <h2 className="text-lg font-bold mb-6 border-b border-white/10 pb-4">Ringkasan Pesanan</h2>
             
             <div className="space-y-4 mb-6">
               <div className="flex justify-between items-start">
                 <span className="text-slate-300 text-sm max-w-[70%]">{program.name} ({selectedTier?.label})</span>
                 <span className="font-semibold">{formatPrice(originalPrice)}</span>
               </div>
               
               {isDiscounted && (
                 <div className="flex justify-between items-center text-green-400">
                   <span className="text-sm">Diskon Spesial</span>
                   <span className="font-semibold">-{formatPrice(originalPrice - price)}</span>
                 </div>
               )}
             </div>

             <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
                <span className="text-slate-300 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-white">{formatPrice(price)}</span>
             </div>

             {submitError && (
               <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
                 <p className="text-red-300 text-sm">{submitError}</p>
               </div>
             )}

             <Button 
               onClick={handleCreateOrder}
               disabled={isSubmitting || !selectedAccountId}
               className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold h-12 text-base rounded-lg disabled:opacity-70"
             >
               {isSubmitting ? "Memproses..." : "Buat Pesanan & Lanjutkan"}
             </Button>
             
             <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center">
               <ShieldCheck className="w-4 h-4 mr-1.5" /> Data Anda aman dan terenkripsi
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">Memuat...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
