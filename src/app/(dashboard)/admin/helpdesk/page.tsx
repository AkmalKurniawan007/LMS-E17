import { getAllTickets } from "./actions"
import AdminHelpdeskClient from "./client"

export default async function HelpdeskPage() {
  const { data: tickets, error } = await getAllTickets()

  if (error) {
    return <div className="p-8 text-center text-red-500">Gagal memuat tiket: {error}</div>
  }

  return <AdminHelpdeskClient initialTickets={(tickets as any) || []} />
}
