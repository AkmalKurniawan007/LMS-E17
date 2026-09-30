-- ====================================================================
-- VIDEO ACCESS MIGRATION
-- Tambahan untuk sistem akses tiered (Junior / Expert / Bootcamp)
-- Jalankan di Supabase SQL Editor SETELAH marketing_backend.sql
-- ====================================================================

-- 1. Tabel video_access
--    Mencatat hak akses video per user per program.
--    Junior = akses video basic saja
--    Expert = akses semua video (basic + expert)
--    Bootcamp = tidak butuh baris ini karena sudah via enrollments
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.video_access (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id   text NOT NULL,
  tier         text NOT NULL CHECK (tier IN ('junior', 'expert')),
  order_id     uuid REFERENCES public.checkout_orders(id),
  granted_by   uuid REFERENCES public.users(id),
  granted_at   timestamp with time zone DEFAULT now(),
  is_active    boolean DEFAULT true,
  notes        text,
  CONSTRAINT video_access_pkey PRIMARY KEY (id),
  CONSTRAINT video_access_user_program_unique UNIQUE (user_id, program_id)
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_video_access_user ON public.video_access(user_id);
CREATE INDEX IF NOT EXISTS idx_video_access_program ON public.video_access(program_id);

-- RLS
ALTER TABLE public.video_access ENABLE ROW LEVEL SECURITY;

-- User bisa baca akses miliknya sendiri
CREATE POLICY "video_access_user_read_own"
  ON public.video_access FOR SELECT
  USING (user_id = auth.uid());

-- Admin bisa semua operasi
CREATE POLICY "video_access_admin_all"
  ON public.video_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================================================
-- 2. Kolom tier_type di checkout_orders agar lebih terstruktur
--    (hanya update jika belum ada)
-- ====================================================================
ALTER TABLE public.checkout_orders
  ADD COLUMN IF NOT EXISTS access_granted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_granted_at timestamp with time zone;

-- ====================================================================
-- 3. Trigger auto-update updated_at untuk video_access
-- ====================================================================
CREATE TRIGGER update_video_access_updated_at
  BEFORE UPDATE ON public.video_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
