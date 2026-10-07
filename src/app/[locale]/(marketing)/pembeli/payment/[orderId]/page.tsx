"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Building, Wallet, Upload, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActivePaymentAccounts,
  uploadPaymentProof,
  getOrderForPayment,
  type PaymentAccount,
} from "@/app/(lms)/(dashboard)/admin/marketing/actions";
import Link from "next/link";

export default function PaymentWaitingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId;

  const [order, setOrder] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [paymentAccounts, setPaymentAccounts] = React.useState<PaymentAccount[]>([]);
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrder = async () => {
      const result = await getOrderForPayment(orderId);
      
      if (result.success && result.order) {
        setOrder(result.order);
      }
      setIsLoading(false);
    };
    fetchOrder();
    
    getActivePaymentAccounts().then(accounts => {
      setPaymentAccounts(accounts);
    });
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-ink)] mb-4" />
        <p className="text-[var(--color-muted)]">Memuat detail pembayaran...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Pesanan tidak ditemukan</h2>
      </div>
    );
  }

  // extract account id from notes
  const notesStr = order.notes || "";
  let selectedAccountId = "";
  if (notesStr.startsWith("Selected account: ")) {
    selectedAccountId = notesStr.replace("Selected account: ", "").trim();
  }
  
  const selectedAccount = paymentAccounts.find(acc => acc.id === selectedAccountId) || paymentAccounts[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUploadProof = async () => {
    if (!proofFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      const result = await uploadPaymentProof(order.id, formData);
      if (!result.success) {
        setUploadError(result.error ?? "Gagal upload bukti pembayaran.");
        return;
      }
      setUploadSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      setUploadError("Terjadi kesalahan saat upload.");
    } finally {
      setIsUploading(false);
    }
  };

  if (order.status === 'confirmed' || order.status === 'paid') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-screen">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Pembayaran Berhasil!
          </h1>
          <p className="text-slate-600 mb-8">
            Pesanan Anda telah dikonfirmasi dan lunas. Terima kasih telah melakukan pembayaran.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-screen">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">
            Pesanan Dibatalkan
          </h1>
          <p className="text-slate-600 mb-8">
            Pesanan ini telah dibatalkan.
          </p>
          <Link href="/checkout" className="text-blue-600 font-semibold hover:underline">
            Buat Pesanan Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--color-signal)]/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--color-signal-hover)] animate-spin" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
          Menunggu Pembayaran
        </h1>
        <p className="text-slate-600 text-center mb-8">
          Silakan transfer pembayaran ke rekening di bawah ini, lalu upload bukti pembayaran. Atau Anda bisa <Link href="/" className="text-blue-600 font-semibold hover:underline">Kembali ke Beranda</Link>.
        </p>

        {selectedAccount && (
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nomor Rekening</label>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                  <span className="font-mono font-bold text-lg text-slate-800">{selectedAccount.account_number}</span>
                  <button 
                    onClick={() => handleCopy(selectedAccount.account_number, 'account')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Copy Nomor Rekening"
                  >
                    {copiedField === 'account' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Atas Nama</label>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                  <span className="font-bold text-slate-700">{selectedAccount.account_holder}</span>
                  <button 
                    onClick={() => handleCopy(selectedAccount.account_holder, 'name')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Copy Nama Pemilik"
                  >
                    {copiedField === 'name' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Jumlah Transfer</label>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                  <span className="font-bold text-lg text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(order.amount)}
                  </span>
                  <button 
                    onClick={() => handleCopy(order.amount.toString(), 'amount')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Copy Jumlah"
                  >
                    {copiedField === 'amount' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {selectedAccount.instructions && (
                <div className="mt-4 p-4 bg-[var(--color-signal)]/10 border border-[var(--color-signal)]/20 rounded-lg text-sm text-[var(--color-signal-active)]">
                  <strong className="block mb-1">Instruksi Tambahan:</strong>
                  <p>{selectedAccount.instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Upload Bukti Pembayaran</label>
          
          {uploadSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold mb-1">Bukti pembayaran berhasil diupload!</p>
              <p className="text-sm opacity-80">Mengarahkan ke dashboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full border border-[var(--color-cream-line)] rounded-xl p-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-ink)] file:text-white hover:file:bg-[var(--color-ink-2)]"
                disabled={isUploading}
              />
              <p className="text-xs text-slate-500">Format: JPG, PNG, atau PDF maksimal 5MB</p>
              
              {uploadError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}

              <Button
                onClick={handleUploadProof}
                disabled={!proofFile || isUploading}
                className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Bukti Pembayaran
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
