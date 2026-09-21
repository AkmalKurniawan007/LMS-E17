"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, MessageCircle, BookOpen, Layers, Lock, Unlock, PlayCircle, Clock } from "lucide-react";
import { programs, formatPrice, getDiscountPercent, getWhatsAppUrl } from "@/components/marketing/data/marketing-data";

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const program = programs.find((p) => p.id === resolvedParams.id);
  const [isPaid, setIsPaid] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(program?.curriculum?.[0]?.id || "");

  if (!program) {
    notFound();
  }

  const discount = getDiscountPercent(program.originalPrice, program.price);
  const activeVideo = program.curriculum?.find(v => v.id === activeVideoId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-200 selection:text-slate-900 pb-24">
      {/* Top Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-white/10 h-[70px] flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* TOGGLE SIMULASI */}
            <button 
              onClick={() => setIsPaid(!isPaid)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border ${
                isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
              }`}
            >
              {isPaid ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isPaid ? "Simulasi: Sudah Bayar" : "Simulasi: Belum Bayar"}
            </button>
            <img src="/assets/logo-wide.png" alt="E17 Course Logo" className="h-7 w-auto object-contain hidden md:block" />
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* KONDISI B: SUDAH BAYAR (DASHBOARD BELAJAR / CURRICULUM VIEW)   */}
      {/* ------------------------------------------------------------- */}
      {isPaid ? (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">{program.name}</h1>
            <p className="text-slate-500 font-medium">Lanjutkan pembelajaran Anda.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Kiri: Video Player Utama */}
            <div className="flex-1">
              <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
                  <p className="text-white font-medium text-lg">Memutar: {activeVideo?.title}</p>
                </div>
              </div>
              
              {/* Info Video Saat Ini */}
              <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeVideo?.title}</h2>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 mb-6">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {activeVideo?.duration}</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">Video Materi</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {activeVideo?.description}
                </p>
              </div>
            </div>

            {/* Kanan: Playlist Kurikulum */}
            <div className="w-full lg:w-[400px] xl:w-[450px]">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-[100px] flex flex-col max-h-[calc(100vh-140px)]">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-lg">Kurikulum Modul</h3>
                  <p className="text-sm text-slate-500 font-medium">{program.curriculum?.length || 0} Video Pembelajaran</p>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                  {program.curriculum?.map((vid, idx) => (
                    <div 
                      key={vid.id}
                      onClick={() => setActiveVideoId(vid.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        activeVideoId === vid.id 
                          ? "bg-amber-50 border-amber-200 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 mt-1">
                          {activeVideoId === vid.id ? (
                            <PlayCircle className="w-6 h-6 text-amber-500" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-slate-300 group-hover:text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className={`font-bold mb-1 line-clamp-1 ${activeVideoId === vid.id ? "text-slate-900" : "text-slate-700"}`}>
                            {idx + 1}. {vid.title}
                          </p>
                          <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                            {vid.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                            <Clock className="w-3.5 h-3.5"/> {vid.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!program.curriculum || program.curriculum.length === 0) && (
                    <div className="text-center p-8 text-slate-500">
                      Belum ada video untuk program ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (

      /* ------------------------------------------------------------- */
      /* KONDISI A: BELUM BAYAR (MARKETING VIEW)                         */
      /* ------------------------------------------------------------- */
        <>
          {/* Hero Section */}
          <section className="bg-slate-900 text-white pt-16 pb-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
              
              <div className="flex-1 text-center md:text-left">
                {program.popular && (
                  <span className="inline-block bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase mb-6 shadow-lg shadow-amber-500/20">
                    Paling Populer
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                  {program.name}
                </h1>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-medium max-w-2xl mb-8">
                  {program.description}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <a 
                    href={getWhatsAppUrl(program.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-500 text-slate-900 px-8 py-4 rounded-full font-bold text-[15px] shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-1 hover:bg-amber-400 flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" /> Daftar Sekarang
                  </a>
                </div>
              </div>
              
            </div>
          </section>

          {/* Main Content Area (Overlap with Hero) */}
          <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Col: Video & Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Video Player */}
                <div className="bg-slate-900 rounded-3xl aspect-video overflow-hidden shadow-2xl relative border border-slate-800">
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:opacity-40 transition-opacity" />
                    <div className="text-center z-10">
                      <button className="w-20 h-20 bg-amber-500/90 hover:bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110 shadow-xl shadow-amber-500/30">
                        <Play className="w-8 h-8 text-slate-900 ml-1" />
                      </button>
                      <p className="text-white font-bold">Tonton Cuplikan Bootcamp</p>
                    </div>
                  </div>
                </div>

                {/* About Program */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Tentang Program Ini</h2>
                  <p className="text-slate-600 leading-relaxed font-medium text-[16px] mb-8">
                    Bootcamp {program.name} dirancang khusus untuk membawa Anda dari level fundamental hingga mahir. 
                    Anda tidak hanya akan mempelajari teori, tetapi langsung mempraktikkannya ke dalam studi kasus nyata 
                    di bawah bimbingan para mentor profesional. Lulus dari program ini, Anda akan memiliki portofolio kokoh 
                    yang siap dipresentasikan kepada perekrut.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900">{program.sessions}</p>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Sesi Live Mentoring</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900">{program.modules}</p>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Modul Materi & Tugas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Pricing & Features Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-[100px]">
                  <div className="mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-400 line-through font-bold text-sm">
                        {formatPrice(program.originalPrice)}
                      </span>
                      <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[12px] font-bold">
                        Hemat {discount}%
                      </span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-900 mb-6">
                      {formatPrice(program.price)}
                    </p>
                    <a 
                      href={getWhatsAppUrl(program.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-slate-900 text-white hover:bg-slate-800 py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5"
                    >
                      Daftar Sekarang
                    </a>
                    <p className="text-center text-[12px] font-medium text-slate-500 mt-3">
                      Pendaftaran dilayani melalui Admin via WhatsApp.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Yang akan Anda dapatkan:</h3>
                    <ul className="space-y-4">
                      {program.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span className="text-[14px] font-medium text-slate-700 leading-snug">{f}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-[14px] font-medium text-slate-700 leading-snug">Sertifikat Kelulusan Resmi</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-[14px] font-medium text-slate-700 leading-snug">Akses LMS & Materi Seumur Hidup</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </>
      )}
    </div>
  );
}
