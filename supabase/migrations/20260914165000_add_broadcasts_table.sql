-- Create broadcasts table
CREATE TABLE public.broadcasts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject text NOT NULL,
  message text NOT NULL,
  target text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.users(id),
  CONSTRAINT broadcasts_pkey PRIMARY KEY (id)
);

-- Mengaktifkan pengamanan RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert broadcasts" ON public.broadcasts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view broadcasts" ON public.broadcasts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );
