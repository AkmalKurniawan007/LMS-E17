"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { programs, formatPrice } from "@/components/marketing/data/marketing-data";
import { ShieldCheck, CheckCircle, ArrowLeft, CreditCard, Wallet, Building } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const programId = searchParams.get("program");
  const tierParam = searchParams.get("tier");
  
  const program = programs.find((p) => p.id === programId);
  
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Program tidak ditemukan</h2>
        <Link href="/siswa" className="text-orange-500 hover:underline">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const [selectedTierType, setSelectedTierType] = React.useState<string>(tierParam || 'bootcamp');
  
  const selectedTier = program.tiers?.find((t) => t.type === selectedTierType) || program.tiers?.[0];
  const price = selectedTier?.price || program.price;
  const originalPrice = selectedTier?.originalPrice || program.originalPrice;
  const isDiscounted = originalPrice > price;

  const [paymentMethod, setPaymentMethod] = React.useState('transfer');

  const handlePayment = () => {
    alert("Ini adalah Mockup UI. Pembayaran berhasil disimulasikan! Anda sekarang terdaftar.");
    window.location.href = "/siswa";
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      <Link href="/siswa" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Order Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Selesaikan Pendaftaran Anda</h1>
            <p className="text-slate-600">Pilih paket dan metode pembayaran untuk segera memulai kelas Anda.</p>
          </div>

          {/* Program Info */}
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

          {/* Tier Selection */}
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

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-4">Metode Pembayaran</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <Building className="w-5 h-5 ml-3 mr-2 text-slate-600" />
                  <span className="font-semibold text-slate-900 text-sm">Transfer Bank (VA)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <Wallet className="w-5 h-5 ml-3 mr-2 text-slate-600" />
                  <span className="font-semibold text-slate-900 text-sm">E-Wallet (Gopay/OVO)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <CreditCard className="w-5 h-5 ml-3 mr-2 text-slate-600" />
                  <span className="font-semibold text-slate-900 text-sm">Kartu Kredit</span>
                </label>
             </div>
          </div>
        </div>

        {/* Right Col: Summary */}
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

             <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-end">
                <span className="text-slate-300 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-white">{formatPrice(price)}</span>
             </div>

             <Button 
               onClick={handlePayment}
               className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold h-12 text-base rounded-lg"
             >
               Bayar Sekarang
             </Button>
             
             <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center">
               <ShieldCheck className="w-4 h-4 mr-1.5" /> Pembayaran aman dengan enkripsi SSL 256-bit
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
