DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.chat_participants;

CREATE POLICY "Users can view all participants" ON public.chat_participants
  FOR SELECT USING (true);
