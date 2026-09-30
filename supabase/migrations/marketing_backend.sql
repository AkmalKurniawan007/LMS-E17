-- ====================================================================
-- MARKETING BACKEND MIGRATION
-- Tabel: marketing_content, checkout_orders
-- Jalankan di Supabase SQL Editor
-- ====================================================================

-- 1. Tabel marketing_content
--    Menyimpan konten yang bisa diedit admin untuk halaman marketing
CREATE TABLE IF NOT EXISTS public.marketing_content (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_key  text NOT NULL UNIQUE,
  label        text NOT NULL,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamp with time zone DEFAULT now(),
  updated_by   uuid REFERENCES public.users(id),
  CONSTRAINT marketing_content_pkey PRIMARY KEY (id)
);

-- Seed data default
INSERT INTO public.marketing_content (section_key, label, data) VALUES
(
  'hero',
  'Hero Section',
  '{
    "badge": "Bootcamp Intensif Berstandar Industri",
    "headline_line1": "Dari Pemula",
    "headline_line2": "ke Profesional",
    "headline_line3": "dalam 3 Bulan.",
    "subheadline": "Belajar langsung dari praktisi industri. Format live mentoring, bukan rekaman. Kurikulum update tiap batch.",
    "cta_primary": "Lihat Program",
    "cta_secondary": "Tanya via WhatsApp",
    "stats_students": "1.200+ Alumni",
    "stats_rating": "4.8/5 Rating",
    "stats_sessions": "Live Mentoring"
  }'::jsonb
),
(
  'promo',
  'Promo Banner',
  '{
    "is_active": true,
    "title": "Early Bird Batch 8",
    "description": "Daftar sebelum tanggal 30 dan hemat hingga 40% untuk semua program.",
    "deadline_label": "Penawaran berakhir",
    "deadline_date": "",
    "cta_text": "Daftar Sekarang",
    "badge_text": "TERBATAS"
  }'::jsonb
),
(
  'whatsapp',
  'Kontak WhatsApp',
  '{
    "number": "6281234567890",
    "greeting": "Halo, saya tertarik mendaftar bootcamp di E17 Course. Mohon info lebih lanjut."
  }'::jsonb
),
(
  'footer',
  'Footer',
  '{
    "tagline": "Bootcamp teknologi berstandar industri untuk generasi pelajar Indonesia.",
    "email": "hello@e17course.com",
    "instagram": "https://instagram.com/e17course",
    "linkedin": "https://linkedin.com/company/e17course",
    "copyright": "E17 Course. Hak cipta dilindungi."
  }'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

-- RLS: semua bisa baca, hanya admin yang bisa ubah
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_content_public_read"
  ON public.marketing_content FOR SELECT
  USING (true);

CREATE POLICY "marketing_content_admin_write"
  ON public.marketing_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================================================
-- 2. Tabel checkout_orders
--    Menyimpan setiap order dari halaman checkout marketing
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.checkout_orders (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES public.users(id),
  program_id      text NOT NULL,
  program_name    text NOT NULL,
  tier_type       text NOT NULL,
  tier_label      text NOT NULL,
  amount          numeric NOT NULL,
  payment_method  text NOT NULL DEFAULT 'transfer',
  status          text NOT NULL DEFAULT 'pending',
  notes           text,
  admin_notes     text,
  confirmed_by    uuid REFERENCES public.users(id),
  confirmed_at    timestamp with time zone,
  created_at      timestamp with time zone DEFAULT now(),
  updated_at      timestamp with time zone DEFAULT now(),
  CONSTRAINT checkout_orders_pkey PRIMARY KEY (id)
);

-- RLS untuk checkout_orders
ALTER TABLE public.checkout_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_user_read_own"
  ON public.checkout_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "orders_user_insert"
  ON public.checkout_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_admin_all"
  ON public.checkout_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================================================
-- 3. Trigger auto-update updated_at
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_checkout_orders_updated_at
  BEFORE UPDATE ON public.checkout_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_content_updated_at
  BEFORE UPDATE ON public.marketing_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
