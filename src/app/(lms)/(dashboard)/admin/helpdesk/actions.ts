"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAllTickets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from('helpdesk_tickets')
    .select(`
      id,
      subject,
      status,
      created_at,
      user_id,
      users ( full_name, email ),
      helpdesk_messages (
        id,
        sender_id,
        message,
        is_admin,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function replyToTicketAsAdmin(ticketId: string, messageText: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Insert message
  const { error: msgError } = await supabase
    .from('helpdesk_messages')
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      message: messageText,
      is_admin: true
    })

  if (msgError) {
    return { error: msgError.message }
  }

  // Update ticket status to In Progress if it's Open
  if (currentStatus === 'Open') {
    await supabase
      .from('helpdesk_tickets')
      .update({ status: 'In Progress', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
  } else {
    // Just update updated_at
    await supabase
      .from('helpdesk_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)
  }

  revalidatePath('/admin/helpdesk')
  return { success: true }
}

export async function resolveTicket(ticketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from('helpdesk_tickets')
    .update({ status: 'Resolved', updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/helpdesk')
  return { success: true }
}
