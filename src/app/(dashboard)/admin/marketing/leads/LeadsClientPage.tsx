"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Filter, MessageCircle, MoreVertical, ExternalLink, Calendar, User, Mail, Phone, ChevronDown, Save, Loader2, Trash2 } from "lucide-react";
import { MarketingLeadCrm, updateLeadStatus, updateLeadNotes, deleteLead } from "../leads-actions";

export default function LeadsClientPage({ 
  leads, 
  programs, 
  currentStatus, 
  currentProgram 
}: { 
  leads: MarketingLeadCrm[], 
  programs: any[],
  currentStatus?: string,
  currentProgram?: string
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeNotesId, setActiveNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const statusOptions = [
    { value: "new", label: "Baru Masuk", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "contacted", label: "Dihubungi", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "interested", label: "Tertarik", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { value: "converted", label: "Membeli (Converted)", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { value: "lost", label: "Batal / Lost", color: "bg-slate-100 text-slate-700 border-slate-200" },
  ];

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      setIsUpdating(leadId);
      await updateLeadStatus(leadId, newStatus);
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    try {
      setIsUpdating(leadId);
      await updateLeadNotes(leadId, notesValue);
      setActiveNotesId(null);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan catatan");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Yakin ingin menghapus data lead ini secara permanen?")) return;
    
    try {
      setIsUpdating(leadId);
      await deleteLead(leadId);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus lead");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  const filteredLeads = leads.filter(l => 
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.phone && l.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau no WA..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={currentStatus || "all"}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Semua Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={currentProgram || "all"}
              onChange={(e) => updateFilters("program", e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Semua Program</option>
              {programs.map(p => (
                <option key={p.slug} value={p.slug}>{p.short_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Calon Siswa (Lead)</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Program Minat</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status CRM</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal & Sumber</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data lead ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* COL 1: Info User */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">{lead.full_name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3.5 h-3.5" /> {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5" /> 
                            <a href={`https://wa.me/${lead.phone.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                        {lead.converted_user_id && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 w-fit">
                            <User className="w-3 h-3" /> Akun LMS Aktif
                          </span>
                        )}
                      </div>
                    </td>

                    {/* COL 2: Program */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">
                        {programs.find(p => p.slug === lead.program_interest)?.short_name || lead.program_interest || "-"}
                      </span>
                      {lead.latest_order_id && (
                        <div className="mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-100 text-xs">
                          <span className="font-bold text-amber-800 block">Ada Transaksi</span>
                          <span className="text-amber-600 block">{lead.latest_order_tier}</span>
                          <span className="text-amber-700 font-semibold mt-0.5 block">Rp {lead.latest_order_amount?.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </td>

                    {/* COL 3: Status CRM */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          disabled={isUpdating === lead.id}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`appearance-none font-bold text-xs px-3 py-1.5 pr-8 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors cursor-pointer disabled:opacity-50 ${
                            statusOptions.find(opt => opt.value === lead.status)?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 pointer-events-none" />
                      </div>
                    </td>

                    {/* COL 4: Meta */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {format(new Date(lead.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                        </div>
                        <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium w-fit">
                          {lead.source === 'web_register' ? 'Register Web' : 
                           lead.source === 'web_checkout_guest' ? 'Guest Checkout' : lead.source}
                        </span>
                      </div>
                    </td>

                    {/* COL 5: Aksi */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            if (activeNotesId === lead.id) {
                              setActiveNotesId(null);
                            } else {
                              setActiveNotesId(lead.id);
                              setNotesValue(lead.notes || "");
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${lead.notes ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                          title={lead.notes ? "Lihat/Edit Catatan" : "Tambah Catatan"}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20${lead.full_name},%20terima%20kasih%20telah%20menghubungi%20E17%20Course.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Chat WhatsApp"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {isUpdating === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Notes Popover */}
                      {activeNotesId === lead.id && (
                        <div className="absolute right-6 top-14 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-10 p-3 text-left">
                          <label className="block text-xs font-bold text-slate-700 mb-2">Catatan Admin:</label>
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[80px]"
                            placeholder="Tulis riwayat follow up di sini..."
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              onClick={() => setActiveNotesId(null)}
                              className="text-xs font-semibold text-slate-500 px-3 py-1.5 hover:bg-slate-50 rounded-md"
                            >
                              Batal
                            </button>
                            <button 
                              onClick={() => handleSaveNotes(lead.id)}
                              disabled={isUpdating === lead.id}
                              className="text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center gap-1 disabled:opacity-50"
                            >
                              {isUpdating === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              Simpan
                            </button>
                          </div>
                        </div>
                      )}
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
