"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Clock, RefreshCw, Users, Sparkles } from "lucide-react";
import { 
  getTodayScheduledClassesWithStatus, 
  sendDailyClassReminders,
  DailyReminderSummary
} from "@/app/actions/class-reminder-actions";
import { Button } from "@/components/ui/button";

export default function ClassReminderControl() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<{ targetDate: string; sessions: any[] } | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTodayScheduledClassesWithStatus();
      setData(res);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendReminder = async (force: boolean = false) => {
    if (!confirm(
      force 
        ? "Kirim ulang pengingat email sekarang ke seluruh mentor dan siswa untuk kelas hari ini?" 
        : "Kirim email pengingat kelas hari ini sekarang?"
    )) {
      return;
    }

    setSending(true);
    setResultMessage(null);
    try {
      const res: DailyReminderSummary = await sendDailyClassReminders({ forceResend: force });
      if (res.success) {
        if (res.totalSessions === 0) {
          setResultMessage({
            type: 'success',
            text: `Tidak ada sesi kelas yang dijadwalkan untuk hari ini (${res.targetDate}). Tidak ada email yang perlu dikirim.`
          });
        } else {
          setResultMessage({
            type: 'success',
            text: `Berhasil memproses ${res.totalSessions} sesi kelas hari ini. Total ${res.totalEmailsSent} email & notifikasi telah dikirimkan ke mentor & siswa!`
          });
        }
        await fetchData();
      } else {
        setResultMessage({
          type: 'error',
          text: res.error || "Gagal mengirimkan pengingat kelas."
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err?.message || "Terjadi kesalahan saat memicu pengingat kelas."
      });
    } finally {
      setSending(false);
    }
  };

  const sessions = data?.sessions || [];
  const anySent = sessions.some((s) => s.reminderSent);
  const allSent = sessions.length > 0 && sessions.every((s) => s.reminderSent);

  return (
    <div className="card-clean p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Pengingat Kelas Harian Otomatis</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  07:00 WIB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Mengirim email & notifikasi pengingat ke mentor dan seluruh siswa setiap jam 07:00 pagi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs h-9"
              title="Perbarui data"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Muat Ulang
            </Button>

            <Button
              size="sm"
              onClick={() => handleSendReminder(allSent)}
              disabled={sending || loading || sessions.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 shadow-sm"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {allSent ? "Kirim Ulang Sekarang" : "Kirim Pengingat Sekarang"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {resultMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 animate-in fade-in duration-200 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{resultMessage.text}</p>
          </div>
        )}

        {/* Status Konten */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-slate-400" />
            Memeriksa jadwal kelas hari ini...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-5 px-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Tidak ada jadwal kelas untuk hari ini</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tanggal: {data?.targetDate || "Hari Ini"}. Cron jam 07:00 WIB akan otomatis memeriksa dan mengirimkan email jika terdapat kelas.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-700/60 px-3 py-1 rounded-full">
              Standby
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Terdeteksi {sessions.length} sesi kelas dijadwalkan hari ini:
              </span>
              <span className="text-[11px] text-slate-400">
                {allSent ? "Semua pengingat telah terkirim" : anySent ? "Sebagian telah terkirim" : "Belum dipicu"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 truncate max-w-[200px]">
                        {s.programName} • {s.batchName}
                      </span>
                      {s.reminderSent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Terkirim ({s.totalRecipients})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                          <Clock className="w-3 h-3" /> Menunggu 07:00
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                      Sesi {s.orderNumber}: {s.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{s.startTime ? `${s.startTime.slice(0, 5)} - ${s.endTime ? s.endTime.slice(0, 5) : ''} WIB` : 'Jadwal hari ini'}</span>
                      <span>•</span>
                      <span className="uppercase">{s.sessionType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
