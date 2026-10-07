import { getMentorTickets as getSiswaTickets } from "./actions"
import SiswaHelpdeskClient from "./client"

export default async function SiswaHelpdeskPage() {
  const { data: tickets, error } = await getSiswaTickets()

  if (error) {
    return <div className="p-8 text-center text-red-500">Gagal memuat tiket: {error}</div>
  }

  return <SiswaHelpdeskClient initialTickets={tickets || []} />
}
