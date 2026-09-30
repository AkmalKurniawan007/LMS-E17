"use client"

import * as React from "react"
import {
  CreditCard, Wallet, Plus, Edit2, Trash2, Save, X, Loader2, 
  Building, CheckCircle, AlertCircle, ChevronDown, Eye, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAllPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  type PaymentAccount,
} from "../actions"

const METHOD_ICONS = {
  bank_transfer: <Building className="w-4 h-4" />,
  ewallet: <Wallet className="w-4 h-4" />,
}

const METHOD_LABELS = {
  bank_transfer: "Transfer Bank",
  ewallet: "E-Wallet",
}

function AccountForm({
  account,
  onClose,
  onRefresh,
}: {
  account?: PaymentAccount
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const [methodType, setMethodType] = React.useState<'bank_transfer' | 'ewallet'>(
    account?.method_type ?? 'bank_transfer'
  )
  const [providerName, setProviderName] = React.useState(account?.provider_name ?? '')
  const [accountNumber, setAccountNumber] = React.useState(account?.account_number ?? '')
  const [accountHolder, setAccountHolder] = React.useState(account?.account_holder ?? '')
  const [instructions, setInstructions] = React.useState(account?.instructions ?? '')
  const [sortOrder, setSortOrder] = React.useState(account?.sort_order ?? 0)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = async () => {
    if (!providerName || !accountNumber || !accountHolder) {
      setError('Provider, nomor rekening, dan nama pemegang wajib diisi.')
      return
    }

    setIsSaving(true)
    setError(null)

    const result = account
      ? await updatePaymentAccount(account.id, {
          providerName,
          accountNumber,
          accountHolder,
          instructions,
          sortOrder,
        })
      : await createPaymentAccount({
          methodType,
          providerName,
          accountNumber,
          accountHolder,
          instructions,
          sortOrder,
        })

    if (result.success) {
      await onRefresh()
      onClose()
    } else {
      setError(result.error ?? 'Gagal menyimpan.')
    }
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <h3 className="text-white font-bold">{account ? 'Edit Rekening' : 'Tambah Rekening Baru'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!account && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Tipe Metode Pembayaran
              </label>
              <div className="relative">
                <select
                  value={methodType}
                  onChange={(e) => setMethodType(e.target.value as 'bank_transfer' | 'ewallet')}
                  className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {methodType === 'bank_transfer' ? 'Nama Bank' : 'Provider E-Wallet'}
            </label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder={methodType === 'bank_transfer' ? 'BCA, Mandiri, BRI, dll.' : 'GoPay, OVO, DANA, dll.'}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {methodType === 'bank_transfer' ? 'Nomor Rekening' : 'Nomor Telepon/ID'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Nama Pemegang
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="PT E17 Course Indonesia"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Instruksi Tambahan (Opsional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Catatan untuk user, misal: transfer sebelum jam 3 sore"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Urutan Tampil
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentAccountsPage() {
  const [accounts, setAccounts] = React.useState<PaymentAccount[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [editingAccount, setEditingAccount] = React.useState<PaymentAccount | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getAllPaymentAccounts()
    setAccounts(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleActive = async (account: PaymentAccount) => {
    await updatePaymentAccount(account.id, { isActive: !account.is_active })
    loadData()
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('Yakin ingin menghapus rekening ini?')) return
    await deletePaymentAccount(accountId)
    loadData()
  }

  const bankAccounts = accounts.filter(a => a.method_type === 'bank_transfer')
  const ewalletAccounts = accounts.filter(a => a.method_type === 'ewallet')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Rekening Pembayaran
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola rekening bank dan e-wallet untuk menerima pembayaran dari siswa.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rekening
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bank Transfer */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Transfer Bank</h2>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                Belum ada rekening bank.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map(acc => (
                  <div
                    key={acc.id}
                    className={`bg-white border rounded-xl p-5 shadow-sm ${
                      acc.is_active ? 'border-slate-200' : 'border-slate-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {METHOD_ICONS[acc.method_type]}
                        <span className="font-bold text-slate-900">{acc.provider_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(acc)}
                          className="text-slate-400 hover:text-slate-900"
                          title={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {acc.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingAccount(acc)}
                          className="text-slate-400 hover:text-slate-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-semibold">Rekening:</span> {acc.account_number}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold">A/N:</span> {acc.account_holder}
                    </p>
                    {acc.instructions && (
                      <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        {acc.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* E-Wallet */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">E-Wallet</h2>
            </div>
            {ewalletAccounts.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                Belum ada akun e-wallet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ewalletAccounts.map(acc => (
                  <div
                    key={acc.id}
                    className={`bg-white border rounded-xl p-5 shadow-sm ${
                      acc.is_active ? 'border-slate-200' : 'border-slate-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {METHOD_ICONS[acc.method_type]}
                        <span className="font-bold text-slate-900">{acc.provider_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(acc)}
                          className="text-slate-400 hover:text-slate-900"
                          title={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {acc.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingAccount(acc)}
                          className="text-slate-400 hover:text-slate-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-semibold">Nomor:</span> {acc.account_number}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold">A/N:</span> {acc.account_holder}
                    </p>
                    {acc.instructions && (
                      <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        {acc.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isCreating && (
        <AccountForm onClose={() => setIsCreating(false)} onRefresh={loadData} />
      )}

      {editingAccount && (
        <AccountForm
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}
