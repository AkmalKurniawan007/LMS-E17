"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Mail, Key, User, Calendar, LogIn } from "lucide-react";
import { AuthUserList } from "./users-actions";

export default function UsersClientPage({ users }: { users: AuthUserList[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u) => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.user_metadata?.full_name && u.user_metadata.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Pengguna</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Login Menggunakan</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Terakhir Login</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Paket Dibeli</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal Mendaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* COL 1: Info User */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">
                          {user.user_metadata?.full_name || "Tanpa Nama"}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3.5 h-3.5" /> {user.email}
                        </div>
                      </div>
                    </td>

                    {/* COL 2: Provider */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 w-fit capitalize">
                        {user.provider === 'google' ? (
                          <>
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                          </>
                        ) : (
                          <>
                            <Key className="w-3 h-3" />
                            Email / Password
                          </>
                        )}
                      </span>
                    </td>

                    {/* COL 3: Last Sign In */}
                    <td className="px-6 py-4">
                      {user.last_sign_in_at ? (
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <LogIn className="w-3.5 h-3.5 text-amber-500" /> 
                            {format(new Date(user.last_sign_in_at), "dd MMM yyyy, HH:mm", { locale: id })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum pernah login</span>
                      )}
                    </td>

                    {/* COL 4: Pembelian */}
                    <td className="px-6 py-4">
                      {user.purchases && user.purchases.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {user.purchases.map((p, idx) => (
                            <div key={idx} className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-xs">
                              <span className="font-bold text-emerald-800 block">{p.programName}</span>
                              <span className="text-emerald-600 block uppercase tracking-wider text-[10px] font-bold mt-0.5">{p.tier}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum ada pembelian</span>
                      )}
                    </td>

                    {/* COL 5: Created At */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {format(new Date(user.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
