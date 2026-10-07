'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/utils/logger-actions'

export type ChatRoom = {
  id: string
  type: 'direct' | 'group'
  name: string | null
  batch_id: string | null
  lastMessage: string | null
  lastMessageTime: string | null
  unreadCount: number
  otherUser?: {
    id: string
    name: string
    avatar: string | null
    online: boolean
  }
}

export type ChatMessage = {
  id: string
  room_id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  isMe: boolean
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return []
  }
  
  const userId = authData.user.id

  // We need to fetch rooms where this user is a participant
  const { data: participations, error: pError } = await supabase
    .from('chat_participants')
    .select(`
      room_id,
      last_read_at,
      chat_rooms!inner (
        id,
        type,
        name,
        batch_id
      )
    `)
    .eq('user_id', userId)

  if (pError || !participations) {
    console.error("Error fetching participations:", pError)
    return []
  }

  const rooms: ChatRoom[] = []

  for (const p of participations) {
    const roomInfo = Array.isArray(p.chat_rooms) ? p.chat_rooms[0] : p.chat_rooms
    if (!roomInfo) continue

    // Fetch last message for this room
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content, created_at')
      .eq('room_id', roomInfo.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    // Fetch unread count (messages created after last_read_at)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomInfo.id)
      .gt('created_at', p.last_read_at || '1970-01-01T00:00:00Z')

    let otherUser = undefined
    
    // If it's a direct message, fetch the other participant's details
    if (roomInfo.type === 'direct') {
      const { data: otherParticipant } = await supabase
        .from('chat_participants')
        .select(`
          user_id,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomInfo.id)
        .neq('user_id', userId)
        .maybeSingle()
        
      if (otherParticipant && otherParticipant.users) {
        const u = otherParticipant.users as any
        otherUser = {
          id: otherParticipant.user_id,
          name: u.full_name || 'User',
          avatar: u.avatar_url || null,
          online: false // We can integrate a presence check later if needed
        }
      }
    }

    rooms.push({
      id: roomInfo.id,
      type: roomInfo.type,
      name: roomInfo.type === 'direct' && otherUser ? otherUser.name : (roomInfo.name || 'Grup'),
      batch_id: roomInfo.batch_id,
      lastMessage: lastMsg?.content || null,
      lastMessageTime: lastMsg?.created_at || null,
      unreadCount: unreadCount || 0,
      otherUser
    })
  }

  // Sort rooms by last message time (descending)
  rooms.sort((a, b) => {
    if (!a.lastMessageTime) return 1
    if (!b.lastMessageTime) return -1
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  })

  return rooms
}

export async function getRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return []
  }
  
  const userId = authData.user.id

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      room_id,
      sender_id,
      content,
      created_at,
      users:sender_id (
        full_name
      )
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error || !messages) {
    console.error("Error fetching messages:", error)
    return []
  }
  
  // Mark as read
  await supabase
    .from('chat_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', userId)

  return messages.map((m: any) => ({
    id: m.id,
    room_id: m.room_id,
    sender_id: m.sender_id,
    sender_name: m.users?.full_name || 'User',
    content: m.content,
    created_at: m.created_at,
    isMe: m.sender_id === userId
  }))
}

export async function sendMessage(roomId: string, content: string): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const userId = authData.user.id

  const { error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      sender_id: userId,
      content: content.trim()
    })

  if (error) {
    console.error("Error sending message:", error)
    return { success: false, error: error.message }
  }
  
  // Update last_read_at for sender so their own message doesn't count as unread
  await supabase
    .from('chat_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', userId)
    
  await logAction('mentor', 'Kirim Pesan', `Mengirim pesan ke ruang ID: ${roomId}`, { user_id: userId, target_id: roomId })
    
  return { success: true }
}

export async function getAvailableStudentsForMentor() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return []

  const userId = authData.user.id

  // 1. Get all batches mentor is in
  const { data: mentorBatches } = await supabase
    .from('batch_mentors')
    .select('batch_id')
    .eq('mentor_id', userId)

  if (!mentorBatches || mentorBatches.length === 0) return []
  
  const batchIds = mentorBatches.map(b => b.batch_id)

  // 2. Get all enrollments for these batches
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      user_id,
      users:user_id ( id, full_name, email, avatar_url )
    `)
    .in('batch_id', batchIds)
    .eq('status', 'aktif')

  if (!enrollments) return []

  const studentsMap = new Map()
  enrollments.forEach(e => {
    const user = Array.isArray(e.users) ? e.users[0] : e.users
    if (user && !studentsMap.has(user.id)) {
      studentsMap.set(user.id, user)
    }
  })

  return Array.from(studentsMap.values()).map((u: any) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    avatar: u.avatar_url
  }))
}

export async function createDirectMessageRoom(studentId: string): Promise<{roomId?: string, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'Unauthorized' }

  const userId = authData.user.id

  // Check if a direct room already exists
  // A direct room is one where type='direct' and participants exactly match [userId, studentId]
  // The simplest way to check is finding rooms where both are participants and type is direct.
  
  const { data: existingRooms } = await supabase
    .rpc('get_direct_room_id', { user1_id: userId, user2_id: studentId })
    .maybeSingle()
    
  // Since we don't have this RPC, let's just do it in code
  const { data: myRooms } = await supabase
    .from('chat_participants')
    .select('room_id, chat_rooms!inner(type)')
    .eq('user_id', userId)
    
  if (myRooms) {
    const directRoomIds = myRooms.filter((r: any) => r.chat_rooms?.type === 'direct').map(r => r.room_id)
    
    if (directRoomIds.length > 0) {
      const { data: commonRoom } = await supabase
        .from('chat_participants')
        .select('room_id')
        .in('room_id', directRoomIds)
        .eq('user_id', studentId)
        .limit(1)
        .maybeSingle()
        
      if (commonRoom) {
        return { roomId: commonRoom.room_id }
      }
    }
  }

  // Create new room
  const roomId = crypto.randomUUID()
  const { error: createErr } = await supabase
    .from('chat_rooms')
    .insert({ id: roomId, type: 'direct' })

  if (createErr) return { error: 'Gagal membuat ruang pesan' }

  // Insert participants
  await supabase
    .from('chat_participants')
    .insert([
      { room_id: roomId, user_id: userId },
      { room_id: roomId, user_id: studentId }
    ])

  return { roomId }
}
