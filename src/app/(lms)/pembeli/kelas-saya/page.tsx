"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { PlayCircle, Clock, CheckCircle } from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { NextIntlClientProvider } from "next-intl";

const dummyMessages = {
  Navbar: {
    program: "Program",
    kurikulum: "Kurikulum",
    verifikasi: "Verifikasi",
    tentang_kami: "Tentang Kami"
  }
};
import FooterSection from "@/components/marketing/sections/FooterSection";

export default function KelasSayaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMyClasses = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/pembeli/login?next=/pembeli/kelas-saya";
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("checkout_orders")
        .select(`
          id, program_id, program_name, tier_type, tier_label, status, created_at
        `)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchMyClasses();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] flex flex-col">
      <NextIntlClientProvider locale="id" messages={dummyMessages}>
        <MarketingHeader isLoggedIn={!!user} />
      </NextIntlClientProvider>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 lg:py-24">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Kelas Saya</h1>
          <p className="text-[var(--color-ink-muted)] text-lg">
            Akses semua paket video dan program yang telah Anda beli.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center border border-[var(--color-border)] shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Belum Ada Kelas</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Anda belum membeli paket apapun, atau pembayaran Anda sedang menunggu konfirmasi admin.
            </p>
            <Link 
              href="/programs" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold hover:brightness-110 transition-all"
            >
              Jelajahi Program
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-[20px] p-6 border border-[var(--color-border)] shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Aktif
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {order.tier_label}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {order.program_name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Dibeli: {new Date(order.created_at).toLocaleDateString('id-ID')}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link
                    href={`/programs/${order.program_id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Tonton Video
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
