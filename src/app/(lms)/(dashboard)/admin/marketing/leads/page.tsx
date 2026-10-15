import Link from "next/link";
import { Users, Target, UserCheck } from "lucide-react";
import { getMarketingLeads } from "../leads-actions";
import { getActiveMarketingPrograms } from "../program-actions";
import { getAuthUsersList } from "./users-actions";
import LeadsClientPage from "./LeadsClientPage";
import UsersClientPage from "./UsersClientPage";

export const revalidate = 0;

export default async function MarketingUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; status?: string; program?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeTab = resolvedParams.tab === "users" ? "users" : "leads";

  const [leads, programs, users] = await Promise.all([
    getMarketingLeads({
      status: resolvedParams.status,
      program: resolvedParams.program,
    }),
    getActiveMarketingPrograms(),
    getAuthUsersList(),
  ]);

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {activeTab === "leads" ? "CRM Leads & Prospek" : "Pengguna Web"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {activeTab === "leads"
              ? "Kelola calon pembeli, pantau status follow-up via WhatsApp, dan lihat konversi pesanan."
              : "Kelola data pendaftar dan lihat riwayat login pengguna di website."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/60 shadow-xs">
          <Link
            href="/admin/marketing/leads?tab=leads"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "leads"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-blue-600" />
            CRM Leads & Prospek
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-extrabold">
              {leads.length}
            </span>
          </Link>

          <Link
            href="/admin/marketing/leads?tab=users"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Pengguna Web & Auth
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
              {users.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Konten Berdasarkan Tab Aktif */}
      {activeTab === "leads" ? (
        <LeadsClientPage 
          leads={leads} 
          programs={programs}
          currentStatus={resolvedParams.status}
          currentProgram={resolvedParams.program}
        />
      ) : (
        <UsersClientPage users={users} />
      )}
    </div>
  );
}
