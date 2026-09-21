import { getMentorTickets } from "./actions"
import MentorHelpdeskClient from "./client"

export default async function MentorHelpdeskPage() {
  const { data: tickets, error } = await getMentorTickets()

  if (error) {
    return <div className="p-8 text-center text-red-500">Gagal memuat tiket: {error}</div>
  }

  return <MentorHelpdeskClient initialTickets={tickets || []} />
}
