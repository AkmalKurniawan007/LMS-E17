-- Create Enum for Chat Room Type
CREATE TYPE chat_room_type AS ENUM ('direct', 'group');

-- 1. chat_rooms
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type chat_room_type NOT NULL,
  name TEXT, -- only used for groups, nullable
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE, -- nullable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. chat_participants
CREATE TABLE public.chat_participants (
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- 3. messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
-- A user can see a chat room if they are a participant in it
CREATE POLICY "Users can view rooms they are in" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for chat_participants
-- A user can see participants if they are in the same room
CREATE POLICY "Users can view participants of their rooms" ON public.chat_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.room_id = chat_participants.room_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to rooms (via server)" ON public.chat_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own last_read_at" ON public.chat_participants
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for messages
-- A user can read messages if they are in the room
CREATE POLICY "Users can read messages in their rooms" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = messages.room_id AND user_id = auth.uid()
    )
  );

-- A user can insert messages if they are in the room
CREATE POLICY "Users can send messages to their rooms" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = messages.room_id AND user_id = auth.uid()
    )
  );

-- REPLICA IDENTITY for Realtime (we need this to broadcast inserts)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Note: To enable realtime, the user MUST ALSO go to the Supabase Dashboard -> Database -> Replication -> Enable `messages` table for `supabase_realtime` publication.
