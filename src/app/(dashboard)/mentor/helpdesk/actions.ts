"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { logAction } from "@/utils/logger-actions"

export async function getMentorTickets() {
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
      helpdesk_messages (
        id,
        sender_id,
        message,
        is_admin,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createTicket(subject: string, messageText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('helpdesk_tickets')
    .insert({
      subject,
      user_id: user.id,
      status: 'Open'
    })
    .select()
    .single()

  if (ticketError) {
    return { error: ticketError.message }
  }

  // Create initial message
  const { error: msgError } = await supabase
    .from('helpdesk_messages')
    .insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: messageText,
      is_admin: false
    })

  if (msgError) {
    return { error: msgError.message }
  }

  await logAction('mentor', 'Pembuatan Tiket Helpdesk', `Membuat tiket baru: "${subject}"`, { user_id: user.id, target_id: ticket.id })

  revalidatePath('/mentor/helpdesk')
  return { success: true }
}

export async function replyToTicket(ticketId: string, messageText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from('helpdesk_messages')
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      message: messageText,
      is_admin: false
    })

  if (error) {
    return { error: error.message }
  }

  // Also update ticket updated_at
  await supabase
    .from('helpdesk_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  await logAction('mentor', 'Balasan Tiket Helpdesk', `Membalas tiket ID: ${ticketId}`, { user_id: user.id, target_id: ticketId })

  revalidatePath('/mentor/helpdesk')
  return { success: true }
}
