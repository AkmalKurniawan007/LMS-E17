"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function VerifikasiForm() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/verify/${certId.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--color-muted)]" />
        </div>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Masukkan ID Sertifikat..."
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[var(--color-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:border-transparent transition-all backdrop-blur-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="px-8 py-4 bg-[var(--color-signal)] hover:bg-[var(--color-signal-hover)] text-[var(--color-ink)] font-bold rounded-2xl transition-all shadow-[var(--shadow-btn)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-ink)] focus:ring-[var(--color-signal)] whitespace-nowrap"
      >
        Cek Sertifikat
      </button>
    </form>
  );
}
