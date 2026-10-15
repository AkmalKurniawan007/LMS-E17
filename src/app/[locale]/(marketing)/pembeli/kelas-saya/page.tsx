"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Video, 
  GraduationCap, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  XCircle,
  MessageCircle,
  Calendar
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FooterSection from "@/components/marketing/sections/FooterSection";
import { cancelCheckoutOrder } from "@/app/(lms)/(dashboard)/admin/marketing/actions";

interface OrderItem {
  id: string;
  program_id: string;
  program_name: string;
  tier_type: string;
  tier_label: string;
  status: "pending" | "confirmed" | "paid" | "cancelled" | "rejected";
  payment_proof_url?: string | null;
  rejected_reason?: string | null;
  created_at: string;
  expires_at?: string | null;
  access_granted?: boolean;
  hasLmsBatch?: boolean;
}

export default function KelasSayaPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [hasLmsEnrollment, setHasLmsEnrollment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Pesanan yang dibatalkan tidak akan menumpuk di akun Anda.")) {
      return;
    }
    setCancellingId(orderId);
    try {
      const res = await cancelCheckoutOrder(orderId);
      if (res.success) {
        await fetchMyClasses();
      } else {
        alert(res.error || "Gagal membatalkan pesanan.");
      }
    } finally {
      setCancellingId(null);
    }
  };

  const fetchMyClasses = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = "/pembeli/login?next=/pembeli/kelas-saya";
      return;
    }
    setUser(user);

    try {
      // 1. Fetch checkout_orders (pending, confirmed, paid, rejected)
      const { data: coData } = await supabase
        .from("checkout_orders")
        .select(`
          id, program_id, program_name, tier_type, tier_label, status, payment_proof_url, rejected_reason, created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // 2. Fetch video_access (jika ada akses aktif langsung)
      const { data: rawVaData, error: vaErr } = await supabase
        .from("video_access")
        .select(`program_id, tier, granted_at, expires_at`)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (vaErr) {
        console.error("Error fetching video_access:", vaErr);
      }

      // 3. Fetch enrollments aktif di LMS
      const { data: enData, error: enErr } = await supabase
        .from("enrollments")
        .select(`
          id, 
          batch_id,
          checkout_order_id,
          batches (
            id,
            name,
            program_id
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "aktif");

      if (enErr) {
        console.error("Error fetching enrollments:", enErr);
      }

      const hasActiveLms = !!(enData && enData.length > 0);
      setHasLmsEnrollment(hasActiveLms);

      const enrolledLmsProgramIds = new Set<string>();
      if (enData) {
        enData.forEach((en: any) => {
          const batch = Array.isArray(en.batches) ? en.batches[0] : en.batches;
          if (batch?.program_id) enrolledLmsProgramIds.add(batch.program_id);
        });
      }

      // 4. Fetch marketing programs mapping to LMS programs
      const { data: allMpData } = await supabase
        .from("marketing_programs")
        .select("id, name, lms_program_id");
      const mpLmsMap = new Map((allMpData || []).map((m: any) => [m.id, m.lms_program_id]));

      const orderList: OrderItem[] = [];
      const seenProgramIds = new Set<string>();

      // Masukkan orders dari checkout_orders
      if (coData) {
        coData.forEach((o: any) => {
          const isLmsEligibleTier = o.tier_type === "expert" || o.tier_type === "complete" || o.tier_type === "bootcamp";
          const relatedLmsProgId = mpLmsMap.get(o.program_id);
          const hasBatch = isLmsEligibleTier && (
            (relatedLmsProgId && enrolledLmsProgramIds.has(relatedLmsProgId)) ||
            hasActiveLms
          );
          const matchingVa = rawVaData?.find(va => va.program_id === o.program_id);
          
          orderList.push({
            id: o.id,
            program_id: o.program_id,
            program_name: o.program_name || "Program Pelatihan",
            tier_type: o.tier_type || "junior",
            tier_label: o.tier_label || (o.tier_type === "junior" ? "Self Paced (Video Only)" : o.tier_type === "expert" ? "Mentoring Plus (4 Sesi)" : "Pro Bootcamp (BNSP + 4 Sesi)"),
            status: o.status,
            payment_proof_url: o.payment_proof_url,
            rejected_reason: o.rejected_reason,
            created_at: o.created_at,
            expires_at: matchingVa?.expires_at ?? null,
            hasLmsBatch: hasBatch,
          });
          seenProgramIds.add(o.program_id);
        });
      }

      // Masukkan video_access jika ada yang belum tercatat di orders
      if (rawVaData && rawVaData.length > 0) {
        rawVaData.forEach(va => {
          if (!seenProgramIds.has(va.program_id)) {
            const mp = (allMpData || []).find((m: any) => m.id === va.program_id);
            const relatedLmsProgId = mp?.lms_program_id;
            const isLmsTier = va.tier === "expert" || va.tier === "complete" || va.tier === "bootcamp";
            const hasBatch = isLmsTier && (
              (relatedLmsProgId && enrolledLmsProgramIds.has(relatedLmsProgId)) ||
              hasActiveLms
            );
            orderList.push({
              id: "va-" + va.program_id,
              program_id: va.program_id,
              program_name: mp?.name || "Program Pembelajaran",
              tier_type: va.tier || "junior",
              tier_label: va.tier === "junior" ? "Self Paced (Video Only)" : va.tier === "expert" ? "Mentoring Plus (4 Sesi)" : "Pro Bootcamp (BNSP + 4 Sesi)",
              status: "confirmed",
              created_at: va.granted_at || new Date().toISOString(),
              expires_at: va.expires_at ?? null,
              hasLmsBatch: hasBatch,
            });
            seenProgramIds.add(va.program_id);
          }
        });
      }

      setOrders(orderList);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const TIER_RANK: Record<string, number> = {
    junior: 1,
    self_paced: 1,
    expert: 2,
    mentoring: 2,
    complete: 3,
    bootcamp: 3,
  };

  const rawActiveOrders = orders.filter(o => o.status === "confirmed" || o.status === "paid");
  
  // Deduplikasi: 1 Program = 1 Kartu Kelas (Tampilkan Tier Tertinggi yang Aktif)
  const activeOrdersMap = new Map<string, OrderItem>();
  for (const o of rawActiveOrders) {
    const existing = activeOrdersMap.get(o.program_id);
    if (!existing) {
      activeOrdersMap.set(o.program_id, o);
    } else {
      const existingRank = TIER_RANK[existing.tier_type] || 1;
      const currentRank = TIER_RANK[o.tier_type] || 1;
      if (currentRank > existingRank) {
        activeOrdersMap.set(o.program_id, o);
      }
    }
  }
  const activeOrders = Array.from(activeOrdersMap.values());
  const pendingOrders = orders.filter(o => o.status === "pending");
  const rejectedOrders = orders.filter(o => o.status === "rejected");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const getTierBadgeStyle = (tier: string) => {
    if (tier === "junior" || tier === "self_paced") {
      return "bg-slate-100 text-slate-800 border-slate-200";
    }
    if (tier === "expert" || tier === "mentoring") {
      return "bg-sky-50 text-sky-800 border-sky-200";
    }
    return "bg-amber-50 text-amber-900 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] flex flex-col font-sans">
      <MarketingHeader isLoggedIn={!!user} hasLmsAccess={hasLmsEnrollment} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[var(--color-line-subtle)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-signal)]/15 text-[var(--color-ink)] text-xs font-bold mb-3 border border-[var(--color-signal)]/30">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-signal)]" />
              Area Belajar & Status Pesanan
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Kelas Saya</h1>
            <p className="text-[var(--color-ink-muted)] text-base md:text-lg mt-2">
              Pantau status verifikasi pembayaran, tonton materi video, dan akses sesi mentoring.
            </p>
          </div>

          <button
            onClick={fetchMyClasses}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-[var(--color-line-subtle)] hover:bg-slate-50 transition-colors shadow-sm"
            title="Muat Ulang Status"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Perbarui Status
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-28 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mb-4"></div>
            <p className="text-sm text-[var(--color-ink-muted)]">Memuat daftar kelas & status pembayaran...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[24px] p-12 text-center border border-[var(--color-border)] shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Belum Ada Kelas atau Pesanan</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Anda belum melakukan pembelian paket apapun. Pilih program yang Anda minati untuk mulai belajar bersama mentor profesional!
            </p>
            <Link 
              href="/programs" 
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold hover:brightness-110 transition-all shadow-[var(--shadow-btn)]"
            >
              Jelajahi Program Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* SEKSI PESANAN DITOLAK (PERLU PERHATIAN / RE-UPLOAD) */}
            {rejectedOrders.length > 0 && (
              <section className="bg-rose-50/70 border-2 border-rose-300 rounded-[24px] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <h2 className="text-xl font-bold text-rose-950">Pembayaran Perlu Perhatian</h2>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-200 text-rose-800 rounded-full">
                    {rejectedOrders.length} Ditolak Admin
                  </span>
                </div>
                <p className="text-xs text-rose-700 mb-6">
                  Pembayaran untuk pesanan berikut belum dapat kami terima karena alasan di bawah. Silakan periksa dan unggah bukti transfer yang sesuai.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rejectedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-[20px] p-6 border border-rose-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Bukti Ditolak
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getTierBadgeStyle(order.tier_type)}`}>
                            {order.tier_label}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {order.program_name}
                        </h3>

                        <p className="text-xs text-slate-500 mb-4">
                          Dipesan: {new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>

                        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-950 leading-relaxed mb-4">
                          <p className="font-bold text-rose-900 mb-1">Alasan Penolakan dari Admin:</p>
                          <p className="italic font-medium text-slate-800">
                            &ldquo;{order.rejected_reason || "Bukti transfer tidak sesuai nominal atau kurang terbaca."}&rdquo;
                          </p>
                          <p className="mt-2 text-rose-700 text-[11px]">
                            Silakan lakukan transfer ulang atau unggah bukti pembayaran yang valid.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <Link
                          href={`/pembeli/payment/${order.id}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Unggah Ulang Bukti Pembayaran
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Batalkan Pesanan Ini
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 1. SEKSI PESANAN PENDING (MENUNGGU PEMBAYARAN / VERIFIKASI) */}
            {pendingOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-bold">Menunggu Konfirmasi & Pembayaran</h2>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                    {pendingOrders.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingOrders.map((order) => {
                    const hasProof = !!order.payment_proof_url;
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-[20px] p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none" />

                        <div>
                          {/* Badge Status */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {hasProof ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                Menunggu Verifikasi Admin
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-rose-300">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Belum Upload Bukti
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getTierBadgeStyle(order.tier_type)}`}>
                              {order.tier_label}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {order.program_name}
                          </h3>

                          <p className="text-xs text-slate-500 mb-4">
                            Dibuat: {new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </p>

                          {/* Penjelasan Status */}
                          {hasProof ? (
                            <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed mb-6">
                              <p className="font-semibold mb-1">Bukti pembayaran telah berhasil dikirim!</p>
                              Tim admin kami sedang memverifikasi transfer Anda. Setelah di-ACC oleh admin, akses kelas akan otomatis aktif di sini.
                            </div>
                          ) : (
                            <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs text-rose-900 leading-relaxed mb-6">
                              <p className="font-semibold mb-1">Pesanan Anda telah dibuat.</p>
                              Silakan selesaikan pembayaran dan upload bukti transfer agar admin dapat mengonfirmasi pesanan Anda.
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
                          <Link
                            href={`/pembeli/payment/${order.id}`}
                            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                              hasProof
                                ? "bg-slate-900 hover:bg-slate-800 text-white"
                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                            }`}
                          >
                            {hasProof ? (
                              <>
                                <Clock className="w-4 h-4" />
                                Cek Rincian Bukti Pembayaran
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4" />
                                Upload Bukti Pembayaran Sekarang
                              </>
                            )}
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer disabled:opacity-50"
                          >
                            {cancellingId === order.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Batalkan Pesanan Ini
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. SEKSI KELAS AKTIF (SUDAH DI-ACC / LUNAS) */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">Kelas Aktif & Siap Belajar</h2>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  {activeOrders.length}
                </span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500">
                  <p className="text-sm">Belum ada kelas yang berstatus aktif saat ini.</p>
                  {pendingOrders.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Pesanan Anda di atas sedang menunggu konfirmasi verifikasi dari admin.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map((order) => {
                    const isVideoOnly = order.tier_type === "junior" || order.tier_type === "self_paced";
                    const isMentoringOrBootcamp = order.tier_type === "expert" || order.tier_type === "complete" || order.tier_type === "bootcamp";

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                      >
                        <div>
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Aktif
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getTierBadgeStyle(order.tier_type)}`}>
                              {order.tier_label}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                            {order.program_name}
                          </h3>

                          <p className="text-xs text-slate-500 mb-3">
                            Aktif sejak: {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                          </p>

                          {/* Masa Aktif Akses Video */}
                          {order.expires_at ? (
                            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/80 px-3 py-2 rounded-xl mb-4 font-medium">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                Masa Aktif: Hingga <strong>{new Date(order.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 rounded-xl mb-4 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Masa Aktif: <strong>Selamanya (Lifetime Access)</strong></span>
                            </div>
                          )}

                          {/* Info Akses Sesuai Paket */}
                          {isVideoOnly && (
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 mb-6 space-y-3">
                              <div className="flex items-start gap-2">
                                <Video className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                <span>
                                  <strong>Paket Self Paced (Video Only):</strong> Anda memiliki akses penuh ke seluruh video materi pembelajaran.
                                </span>
                              </div>
                              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-violet-700">Ingin bimbingan mentor?</span>
                                <Link
                                  href={`/checkout?program=${order.program_id}&tier=expert`}
                                  className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline"
                                >
                                  Upgrade ke Mentoring &rarr;
                                </Link>
                              </div>
                            </div>
                          )}

                          {isMentoringOrBootcamp && (
                            <div className="space-y-3 mb-6">
                              {/* Status Penempatan Batch LMS */}
                              <div className={`p-3.5 rounded-xl border text-xs ${
                                order.hasLmsBatch 
                                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900" 
                                  : "bg-amber-50/80 border-amber-200 text-amber-900"
                              }`}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <span className={`w-2 h-2 rounded-full ${order.hasLmsBatch ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                                    <span>{order.hasLmsBatch ? "Batch LMS Aktif & Terdaftar" : "Penjadwalan Batch Sedang Diproses"}</span>
                                  </div>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                                    4 Sesi Live
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {order.hasLmsBatch 
                                    ? "Akun Anda telah terdaftar dalam batch pembelajaran. Jadwal pertemuan Zoom, modul tugas, dan absensi dapat diakses langsung melalui portal LMS Siswa."
                                    : "Tim admin sedang mengalokasikan batch live mentoring terdekat untuk Anda. Hubungi admin atau gabung ke grup koordinasi untuk konfirmasi jadwal."}
                                </p>
                              </div>

                              {/* Roadmap Ringkas 4 Sesi Live Mentoring */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200 font-semibold text-slate-800">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                                    Roadmap 4 Sesi Live Mentoring
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-normal">Interaktif via Zoom</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-xs">
                                    <span className="font-bold text-sky-700 block text-[10px] uppercase">Sesi 1</span>
                                    <p className="text-slate-700 font-semibold">Kickoff & Roadmap Project</p>
                                    <p className="text-[10px] text-slate-500">Orientasi materi & setup environment</p>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-xs">
                                    <span className="font-bold text-sky-700 block text-[10px] uppercase">Sesi 2</span>
                                    <p className="text-slate-700 font-semibold">Deep Dive Architecture</p>
                                    <p className="text-[10px] text-slate-500">Bedah modul inti & best practice</p>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-xs">
                                    <span className="font-bold text-sky-700 block text-[10px] uppercase">Sesi 3</span>
                                    <p className="text-slate-700 font-semibold">Hands-on Live Coding</p>
                                    <p className="text-[10px] text-slate-500">Live review & studi kasus industri</p>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-xs">
                                    <span className="font-bold text-sky-700 block text-[10px] uppercase">Sesi 4</span>
                                    <p className="text-slate-700 font-semibold">Final Review & Q&A</p>
                                    <p className="text-[10px] text-slate-500">Evaluasi portfolio & konsultasi karir</p>
                                  </div>
                                </div>
                              </div>

                              {/* WhatsApp Koordinasi Group Button */}
                              <a
                                href={`https://wa.me/6281399271717?text=${encodeURIComponent(
                                  `Halo Admin E17 Course! Saya sudah terdaftar di ${order.program_name} (${order.tier_label}). Saya ingin konfirmasi jadwal 4 sesi live mentoring dan link grup koordinasi batch.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Gabung Grup WhatsApp Koordinasi Batch</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-slate-100 space-y-2.5">
                          {/* Tombol Portal LMS untuk Paket 2 & 3 jika sudah punya batch */}
                          {isMentoringOrBootcamp && order.hasLmsBatch && (
                            <Link
                              href="/siswa"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors shadow-sm text-sm"
                            >
                              <GraduationCap className="w-4 h-4 text-white" />
                              Masuk Portal LMS (Jadwal 4 Sesi & Zoom)
                            </Link>
                          )}

                          {/* Tombol Video Rekaman Mandiri (Semua paket dapat video) */}
                          <Link
                            href={`/kelas/${order.program_id}`}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm ${
                              isMentoringOrBootcamp && order.hasLmsBatch
                                ? "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            <PlayCircle className="w-4 h-4 text-[var(--color-signal)]" />
                            {isMentoringOrBootcamp && order.hasLmsBatch ? "Tonton Video Rekaman Mandiri" : "Lanjutkan Belajar (Video)"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. SEKSI RIWAYAT PESANAN DIBATALKAN */}
            {cancelledOrders.length > 0 && (
              <section className="pt-2">
                <details className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-700 text-sm">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      Riwayat Pesanan Dibatalkan ({cancelledOrders.length})
                    </span>
                    <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                    {cancelledOrders.map((co) => (
                      <div key={co.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 text-sm">{co.program_name}</span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-semibold">Dibatalkan</span>
                          </div>
                          <p className="text-slate-500">
                            {co.tier_label} • Dibatalkan pada {new Date(co.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                          </p>
                        </div>
                        <Link
                          href={`/checkout?program=${co.program_id}&tier=${co.tier_type}`}
                          className="inline-flex items-center gap-1 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg transition-colors w-fit shadow-xs"
                        >
                          Pesan Ulang
                        </Link>
                      </div>
                    ))}
                  </div>
                </details>
              </section>
            )}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
