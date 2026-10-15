-- ====================================================================
-- MIGRATION: 20261015000004_fix_ensure_marketing_profile_source.sql
-- Perbaikan Nilai 'source' pada ensure_marketing_profile()
-- Menyelaraskan string 'register' menjadi 'web_register' agar sesuai dengan
-- CHECK constraint (source IN ('web_register', 'web_checkout_guest', 'whatsapp_form', 'imported'))
-- ====================================================================

-- 1. Normalisasi data lama jika ada yang sempat tersimpan dengan source 'register'
UPDATE public.marketing_leads
SET source = 'web_register'
WHERE source = 'register';

-- 2. Perbarui fungsi ensure_marketing_profile()
CREATE OR REPLACE FUNCTION public.ensure_marketing_profile()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
  v_avatar text;
  v_role text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email,
         COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
         COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
  INTO v_email, v_name, v_avatar
  FROM auth.users
  WHERE id = v_uid;

  -- Buat profil di public.users jika belum ada. Role dibiarkan NULL untuk calon pembeli/guest
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (v_uid, v_email, v_name, v_avatar, NULL)
  ON CONFLICT (id) DO NOTHING;

  SELECT role::text INTO v_role FROM public.users WHERE id = v_uid;

  -- Lead hanya untuk calon pembeli (role NULL)
  -- Menggunakan 'web_register' agar valid sesuai CHECK constraint
  IF v_role IS NULL THEN
    INSERT INTO public.marketing_leads (full_name, email, source, status, last_activity)
    VALUES (v_name, v_email, 'web_register', 'new', now())
    ON CONFLICT (email) DO UPDATE SET last_activity = now();
  END IF;

  RETURN COALESCE(v_role, 'guest');
END $$;

REVOKE ALL ON FUNCTION public.ensure_marketing_profile() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.ensure_marketing_profile() TO authenticated;
