"use client"

import * as React from "react"
import { Plus, Search, Shield, Edit, Trash2, GraduationCap, X, Loader2, AlertTriangle, BookOpen, Users as UsersIcon, LinkIcon, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { createInternalUser, updateUserRole, revokeUserAccess, getAdminAndMentorUsers, assignBatchesToMentor } from "./actions"
import Link from "next/link"

type User = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  is_suspended?: boolean
  batches?: any[]
  total_students?: number
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all") // all, admin, mentor
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Edit & Revoke state
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [revokeModalOpen, setRevokeModalOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [newRole, setNewRole] = React.useState("mentor")

  // Assign Batch state (for mentors)
  const [assignBatchModalOpen, setAssignBatchModalOpen] = React.useState(false)
  const [availableBatches, setAvailableBatches] = React.useState<any[]>([])
  const [selectedBatches, setSelectedBatches] = React.useState<string[]>([])

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const result = await getAdminAndMentorUsers()
    
    if (result.success && result.data) {
      setUsers(result.data)
    } else {
      console.error("Fetch users error:", result.message)
    }
    setIsLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await createInternalUser(formData)
    
    if (result.success) {
      alert(result.message)
      setIsModalOpen(false)
      fetchUsers()
    } else {
      alert(result.message)
    }
    
    setIsSubmitting(false)
  }

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setIsSubmitting(true)
    const result = await updateUserRole(selectedUser.id, newRole)
    alert(result.message)
    if (result.success) {
      setEditModalOpen(false)
      fetchUsers()
    }
    setIsSubmitting(false)
  }

  const handleRevokeSubmit = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    const result = await revokeUserAccess(selectedUser.id)
    alert(result.message)
    if (result.success) {
      setRevokeModalOpen(false)
      fetchUsers()
    }
    setIsSubmitting(false)
  }

  const handleOpenAssignBatchModal = async (user: User) => {
    setSelectedUser(user)
    setSelectedBatches(user.batches?.map(b => b.id) || [])
    
    // Fetch available batches
    const { data } = await supabase
      .from('batches')
      .select('id, name, programs(name)')
      .eq('status', 'berjalan')
    
    if (data) setAvailableBatches(data)
    setAssignBatchModalOpen(true)
  }

  const handleAssignBatches = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    const result = await assignBatchesToMentor(selectedUser.id, selectedBatches)
    alert(result.message)
    if (result.success) {
      setAssignBatchModalOpen(false)
      fetchUsers()
    }
    setIsSubmitting(false)
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Manajemen Pengguna (Staf)</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akses sistem untuk Admin dan Mentor.</p>
        </div>
        <div className="flex-shrink-0">
          <Button variant="orange" className="font-bold shadow-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Button>
        </div>
      </div>

      <div className="card-clean overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Cari nama atau email..." 
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                roleFilter === 'all' 
                  ? 'bg-e17-navy text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                roleFilter === 'admin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Admin ({users.filter(u => u.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('mentor')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                roleFilter === 'mentor' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mentor ({users.filter(u => u.role === 'mentor').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Peran (Role)</th>
                <th className="px-6 py-4 font-semibold">Tgl. Terdaftar</th>
                <th className="px-6 py-4 font-semibold">Statistik</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    Memuat data staf...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-e17-dark">{user.full_name}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1.5" />
                          Dicabut / Suspended
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          user.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1.5" /> : <GraduationCap className="w-3 h-3 mr-1.5" />}
                          {user.role === 'admin' ? 'Admin' : 'Mentor'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    {/* Additional column for statistics */}
                    <td className="px-6 py-4 text-slate-600">
                      {user.role === 'mentor' ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen className="h-3.5 w-3.5 text-orange-500" />
                            <span className="font-bold">{user.batches?.length || 0} batch</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UsersIcon className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-bold">{user.total_students || 0} siswa</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        {user.role === 'mentor' && !user.is_suspended && (
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50" 
                            title="Assign Batch"
                            onClick={() => handleOpenAssignBatchModal(user)}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-e17-navy hover:bg-slate-100" 
                          title="Edit Role"
                          onClick={() => { setSelectedUser(user); setNewRole(user.role); setEditModalOpen(true); }}
                          disabled={user.is_suspended}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" 
                          title="Cabut Akses (Suspend)"
                          onClick={() => { setSelectedUser(user); setRevokeModalOpen(true); }}
                          disabled={user.is_suspended}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-e17-dark">Tambah Pengguna (Staf)</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <Input name="name" required placeholder="Cth: Budi Santoso" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <Input name="email" type="email" required placeholder="Cth: budi@e17course.com" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                <select name="role" required className="w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy">
                  <option value="mentor">Mentor (Pengajar)</option>
                  <option value="admin">Admin (Pengelola)</option>
                </select>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-6">
                <p className="text-xs text-amber-800">
                  <strong>Penting:</strong> Sandi awal otomatis akan diatur menjadi <code className="font-bold bg-amber-100 px-1 py-0.5 rounded">password123</code>. Pengguna dapat mengubahnya sendiri nanti.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button type="submit" variant="orange" className="font-bold shadow-md" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan Akun
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-e17-dark">Edit Peran (Role)</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditRoleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Pengguna</label>
                <div className="px-3 py-2 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">{selectedUser.full_name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Peran Baru</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)} 
                  className="w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                >
                  <option value="mentor">Mentor (Pengajar)</option>
                  <option value="admin">Admin (Pengelola)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button type="submit" variant="orange" className="font-bold shadow-md" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Access Modal */}
      {revokeModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-red-100 bg-red-50">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" /> Cabut Akses Pengguna
              </h2>
              <button onClick={() => setRevokeModalOpen(false)} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Anda yakin ingin mencabut akses login untuk pengguna <strong>{selectedUser.full_name}</strong>?
              </p>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-xs text-amber-800">
                Pengguna ini akan ditandai sebagai <strong>Suspended</strong> dan tidak dapat lagi masuk ke sistem. Data yang telah dibuat oleh pengguna (seperti materi atau kuis) akan tetap dipertahankan.
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRevokeModalOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button onClick={handleRevokeSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Ya, Cabut Akses
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Batch Modal (for Mentors) */}
      {assignBatchModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-e17-dark">Assign Batch ke {selectedUser.full_name}</h2>
              <button onClick={() => setAssignBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm font-bold text-slate-700 mb-3">Pilih batch yang akan di-assign:</p>

              {availableBatches.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tidak ada batch berjalan yang tersedia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableBatches.map((batch: any) => (
                    <label key={batch.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(batch.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBatches([...selectedBatches, batch.id])
                          } else {
                            setSelectedBatches(selectedBatches.filter(id => id !== batch.id))
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-e17-navy focus:ring-e17-navy"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">{batch.name}</p>
                        <p className="text-xs text-slate-500">{batch.programs?.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setAssignBatchModalOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" variant="orange" className="font-bold shadow-md" disabled={isSubmitting} onClick={handleAssignBatches}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
