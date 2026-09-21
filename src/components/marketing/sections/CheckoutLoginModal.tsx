"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";
import { formatPrice } from "../data/marketing-data";
import { useRouter } from "next/navigation";

interface CheckoutLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  program?: { id: string; name: string };
  tier?: { type: string; label: string; price: number };
}

export default function CheckoutLoginModal({ isOpen, onClose, program, tier }: CheckoutLoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onClose();
      if (program && tier) {
        router.push(`/checkout/${program.id}?tier=${tier.type}`);
      }
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            role="dialog"
            aria-modal="true"
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left: Order summary */}
            <div className="bg-slate-50 p-8 md:p-10 md:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                Ringkasan Pesanan
              </h3>

              {program && tier ? (
                <div className="bg-white p-6 rounded-xl border border-slate-100 mb-6">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                    {program.name}
                  </h4>
                  <p className="text-orange-600 font-semibold text-sm mb-4">
                    Paket: {tier.label}
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                    <span className="text-slate-500 text-sm">Total</span>
                    <span className="font-extrabold text-slate-900 text-xl">
                      {formatPrice(tier.price)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-slate-100 mb-6 text-center text-slate-500">
                  Tidak ada program terpilih.
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Pembayaran aman dan terenkripsi
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="p-8 md:p-10 md:w-7/12 flex flex-col justify-center">
              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5">
                  {mode === "login" ? "Login untuk lanjut" : "Buat akun baru"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {mode === "login"
                    ? "Masuk ke akun Anda untuk menyelesaikan pembayaran."
                    : "Daftar sekarang untuk memulai."}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-lg mb-7">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all outline-none text-sm"
                        placeholder="Nama lengkap Anda"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all outline-none text-sm"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all outline-none text-sm"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Masuk" : "Daftar"} dan lanjut bayar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs font-medium text-slate-400">ATAU</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <button
                type="button"
                className="mt-5 w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-3 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                Lanjutkan dengan Google
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
