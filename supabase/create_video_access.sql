-- Drop the incorrect table first
DROP TABLE IF EXISTS public.video_access CASCADE;

CREATE TABLE public.video_access (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  program_id text NOT NULL, -- MUST BE TEXT to store things like 'outsystems-developer'
  tier varchar NOT NULL,
  order_id uuid,
  granted_by uuid,
  granted_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  notes text,
  expires_at timestamptz,
  CONSTRAINT video_access_pkey PRIMARY KEY (id),
  CONSTRAINT video_access_user_program_key UNIQUE (user_id, program_id),
  CONSTRAINT va_user_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT va_order_fkey FOREIGN KEY (order_id) REFERENCES public.checkout_orders(id) ON DELETE SET NULL,
  CONSTRAINT va_granter_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Mengaktifkan keamanan tabel
ALTER TABLE public.video_access ENABLE ROW LEVEL SECURITY;

-- Memastikan siswa hanya bisa membaca akses videonya sendiri
CREATE POLICY "Users can read own video access" 
ON public.video_access 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
