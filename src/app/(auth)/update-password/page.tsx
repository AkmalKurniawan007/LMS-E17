import { Suspense } from 'react'
import UpdatePasswordForm from './update-password-form'

export default function UpdatePasswordPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 drop-shadow-sm">
          Perbarui Kata Sandi
        </h2>
        <p className="text-sm text-slate-700 mt-2 font-medium">
          Masukkan kata sandi baru untuk akun Anda.
        </p>
      </div>
      <Suspense fallback={<div className="text-center text-sm mt-8 text-slate-500">Memuat...</div>}>
        <UpdatePasswordForm />
      </Suspense>
    </>
  )
}
