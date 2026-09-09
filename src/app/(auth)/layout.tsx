export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-e17-navy shadow-sm">
            <span className="text-2xl font-black text-e17-primary">E17</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Masuk ke E17 Course
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sistem Manajemen Pembelajaran Terpadu
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
