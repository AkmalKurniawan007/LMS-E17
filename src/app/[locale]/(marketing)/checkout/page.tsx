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
} from "@/app/(lms)/(dashboard)/admin/marketing/actions";
import { createClient } from "@/utils/supabase/client";
import { mapMarketingTierToAccessTier } from "@/utils/tier-mapping";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { useTranslations } from "next-intl";

function CheckoutForm() {
  const t = useTranslations("Checkout");
  const searchParams = useSearchParams();
  const router = useRouter();
  const programSlug = searchParams.get("program");
  const tierParam = searchParams.get("tier");
  
  const [program, setProgram] = React.useState<any>(null);
  const [isLoadingProgram, setIsLoadingProgram] = React.useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  const [selectedTierType, setSelectedTierType] = React.useState<string>(tierParam || 'complete');
  const [paymentAccounts, setPaymentAccounts] = React.useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProgram = async () => {
      if (!programSlug) {
        setIsLoadingProgram(false);
        return;
      }
      const supabase = createClient();
      let { data, error } = await supabase
        .from('marketing_programs')
        .select('*, tiers: marketing_program_tiers(*)')
        .eq('slug', programSlug)
        .single();
      
      if (error || !data) {
        const { data: idData, error: idError } = await supabase
          .from('marketing_programs')
          .select('*, tiers: marketing_program_tiers(*)')
          .eq('id', programSlug)
          .single();
        data = idData;
        error = idError;
      }

      if (data) {
        setProgram(data);
      }
      setIsLoadingProgram(false);
    };
    fetchProgram();
  }, [programSlug]);
  
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

  React.useEffect(() => {
    getActivePaymentAccounts().then(accounts => {
      setPaymentAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    });
  }, []);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-600">{t("loading")}</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    const currentPath = `/checkout?program=${programSlug}&tier=${tierParam || 'complete'}`;
    return (
      <div className="max-w-md mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            {t("login_required")}
          </h2>
          <p className="text-slate-600 mb-6">
            {t("login_desc")}
          </p>
          <div className="space-y-3">
            <Link 
              href={`/pembeli/login?next=${encodeURIComponent(currentPath)}`}
              className="block w-full bg-e17-navy hover:bg-e17-navy/90 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {t("login_now")}
            </Link>
            <Link 
              href={`/pembeli/register?next=${encodeURIComponent(currentPath)}`}
              className="block w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t("register")}
            </Link>
            <Link 
              href="/"
              className="block text-sm text-slate-500 hover:text-slate-700 mt-4"
            >
              {t("back_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProgram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-600">{t("loading")}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("not_found")}</h2>
        <Link href="/" className="text-orange-500 hover:underline">{t("back_home")}</Link>
      </div>
    );
  }

  // Map tier type appropriately (if old urls use bootcamp, map to complete)
  const mappedTierType = selectedTierType === 'bootcamp' ? 'complete' : selectedTierType;
  const selectedTier = program.tiers?.find((t: any) => t.tier_type === mappedTierType) || program.tiers?.[0];
  
  const price = selectedTier?.price || 0;
  const originalPrice = selectedTier?.original_price || 0;
  const isDiscounted = originalPrice > price;

  const bankAccounts = paymentAccounts.filter(a => a.method_type === 'bank_transfer');
  const ewalletAccounts = paymentAccounts.filter(a => a.method_type === 'ewallet');

  const handleCreateOrder = async () => {
    if (!selectedTier || !selectedAccountId) {
      setSubmitError(t("err_account"));
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createCheckoutOrder({
        programId: program.id, // This is the UUID
        tierType: selectedTier.tier_type,
        paymentMethod: 'manual_transfer',
        notes: `Selected account: ${selectedAccountId}`
      });
      if (!result.success || !result.orderId) {
        setSubmitError(result.error ?? t("err_order"));
        return;
      }
      
      // Redirect to dedicated payment page
      router.push(`/pembeli/payment/${result.orderId}`);
    } catch {
      setSubmitError(t("err_general"));
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t("title")}</h1>
            <p className="text-slate-600">{t("subtitle")}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">{t("selected_program")}</h2>
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
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">{t("select_tier")}</h2>
             <div className="space-y-3">
               {program.tiers?.map((tier: any) => (
                 <label 
                   key={tier.tier_type} 
                   className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                     selectedTierType === tier.tier_type || (selectedTierType === 'complete' && tier.tier_type === 'bootcamp') 
                     ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500' 
                     : 'border-slate-200 hover:border-slate-300 bg-white'
                   }`}
                 >
                   <input 
                     type="radio" 
                     name="tier" 
                     value={tier.tier_type} 
                     checked={selectedTierType === tier.tier_type || (selectedTierType === 'complete' && tier.tier_type === 'bootcamp')}
                     onChange={(e) => setSelectedTierType(e.target.value)}
                     className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300"
                   />
                   <div className="ml-3 flex-1">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-slate-900">{tier.label}</span>
                       <span className="font-bold text-slate-900">{formatPrice(tier.price)}</span>
                     </div>
                     <ul className="mt-2 space-y-1">
                       {tier.features?.slice(0, 3).map((feat: string, i: number) => (
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
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">{t("select_account")}</h2>
             {paymentAccounts.length === 0 ? (
               <p className="text-slate-500 text-sm">Memuat rekening pembayaran...</p>
             ) : (
               <div className="space-y-4">
                 {bankAccounts.length > 0 && (
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("bank_transfer")}</p>
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
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("ewallet")}</p>
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
             <h2 className="text-lg font-bold mb-6 border-b border-white/10 pb-4">{t("summary")}</h2>
             
             <div className="space-y-4 mb-6">
               <div className="flex justify-between items-start">
                 <span className="text-slate-300 text-sm max-w-[70%]">{program.name} ({selectedTier?.label})</span>
                 <span className="font-semibold">{formatPrice(originalPrice)}</span>
               </div>
               
               {isDiscounted && (
                 <div className="flex justify-between items-center text-green-400">
                   <span className="text-sm">{t("discount")}</span>
                   <span className="font-semibold">-{formatPrice(originalPrice - price)}</span>
                 </div>
               )}
             </div>

             <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
                <span className="text-slate-300 font-medium">{t("total")}</span>
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
               {isSubmitting ? t("processing") : t("checkout_btn")}
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
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">Memuat...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
