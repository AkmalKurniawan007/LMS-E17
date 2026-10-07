import { getAuthUsersList } from "./users-actions"
import UsersClientPage from "./UsersClientPage"

export const revalidate = 0;

export default async function MarketingUsersPage() {
  const users = await getAuthUsersList();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pengguna Web</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Kelola data pendaftar dan lihat riwayat login pengguna di website.
          </p>
        </div>
      </div>

      <UsersClientPage users={users} />
    </div>
  )
}
