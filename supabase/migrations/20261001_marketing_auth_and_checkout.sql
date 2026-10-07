-- ============ 0. Kolom & helper ============
ALTER TABLE public.marketing_programs
  ADD COLUMN IF NOT EXISTS lms_program_id uuid REFERENCES public.programs(id);

ALTER TABLE public.checkout_orders
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text;

CREATE OR REPLACE FUNCTION public.app_is_lms_member() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_my_role() IN ('admin','mentor','siswa')
$$;

-- ============ 1. ensure_marketing_profile ============
CREATE OR REPLACE FUNCTION public.ensure_marketing_profile()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text; v_name text; v_avatar text; v_role text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT email,
         COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email,'@',1)),
         COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
  INTO v_email, v_name, v_avatar
  FROM auth.users WHERE id = v_uid;

  -- Buat profil jika belum ada. Tidak pernah menyentuh role.
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (v_uid, v_email, v_name, v_avatar, NULL)
  ON CONFLICT (id) DO NOTHING;

  SELECT role::text INTO v_role FROM public.users WHERE id = v_uid;

  -- Lead hanya untuk calon pembeli (role NULL)
  IF v_role IS NULL THEN
    INSERT INTO public.marketing_leads (full_name, email, source, status, last_activity)
    VALUES (v_name, v_email, 'register', 'new', now())
    ON CONFLICT (email) DO UPDATE SET last_activity = now();
  END IF;

  RETURN COALESCE(v_role, 'guest');
END $$;

REVOKE ALL ON FUNCTION public.ensure_marketing_profile() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.ensure_marketing_profile() TO authenticated;

DROP TRIGGER IF EXISTS on_marketing_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_marketing_signup();

-- ============ 2. Storage bukti bayar ============
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs','payment-proofs', false, 5242880,
        ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all payment proofs" ON storage.objects;

CREATE POLICY "Users can upload their own payment proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs'
              AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs'
         AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can read all payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.app_is_admin());

-- ============ 3. Kunci tabel checkout_orders dari manipulasi client ============
-- User tidak boleh insert/update langsung. Semua lewat RPC.
DROP POLICY IF EXISTS "orders_user_insert" ON public.checkout_orders;
DROP POLICY IF EXISTS "orders_user_update_pending" ON public.checkout_orders;

-- ============ 4. create_checkout_order ============
CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_tier_id uuid, p_payment_method text, p_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text; v_lead uuid;
  v_prog_id text; v_prog_name text; v_tier_type text; v_tier_label text;
  v_amount numeric; v_order uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_payment_method IS NULL OR length(trim(p_payment_method)) = 0 THEN
    RAISE EXCEPTION 'Metode pembayaran wajib diisi';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  SELECT id INTO v_lead FROM public.marketing_leads WHERE email = v_email LIMIT 1;

  SELECT mpt.tier_type, mpt.label, mpt.price, mp.id::text, mp.name
  INTO v_tier_type, v_tier_label, v_amount, v_prog_id, v_prog_name
  FROM public.marketing_program_tiers mpt
  JOIN public.marketing_programs mp ON mp.id = mpt.program_id
  WHERE mpt.id = p_tier_id AND mpt.is_active AND mp.is_active;

  IF NOT FOUND THEN RAISE EXCEPTION 'Paket tidak tersedia'; END IF;

  IF EXISTS (SELECT 1 FROM public.checkout_orders
             WHERE user_id = v_uid AND program_id = v_prog_id
               AND tier_type = v_tier_type AND status = 'pending') THEN
    RAISE EXCEPTION 'Anda sudah memiliki pesanan yang menunggu verifikasi untuk paket ini';
  END IF;

  INSERT INTO public.checkout_orders
    (user_id, program_id, program_name, tier_type, tier_label,
     amount, payment_method, status, notes, lead_id)
  VALUES
    (v_uid, v_prog_id, v_prog_name, v_tier_type, v_tier_label,
     v_amount, p_payment_method, 'pending', p_notes, v_lead)
  RETURNING id INTO v_order;

  RETURN v_order;
END $$;

REVOKE ALL ON FUNCTION public.create_checkout_order(uuid,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(uuid,text,text) TO authenticated;

-- ============ 5. attach_payment_proof (pengganti update langsung) ============
CREATE OR REPLACE FUNCTION public.attach_payment_proof(p_order_id uuid, p_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF split_part(p_path,'/',1) <> auth.uid()::text THEN
    RAISE EXCEPTION 'Path tidak valid';
  END IF;
  UPDATE public.checkout_orders
     SET payment_proof_url = p_path, updated_at = now()
   WHERE id = p_order_id AND user_id = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Pesanan tidak ditemukan atau sudah diproses'; END IF;
END $$;

REVOKE ALL ON FUNCTION public.attach_payment_proof(uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.attach_payment_proof(uuid,text) TO authenticated;

-- ============ 6. confirm_checkout_order ============
CREATE OR REPLACE FUNCTION public.confirm_checkout_order(
  p_order_id uuid, p_batch_id uuid, p_admin_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.checkout_orders;
  v_lms uuid; v_enroll uuid;
BEGIN
  IF NOT public.app_is_admin() THEN RAISE EXCEPTION 'Akses ditolak: hanya admin'; END IF;

  SELECT * INTO v_order FROM public.checkout_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'Pesanan sudah diproses'; END IF;
  IF v_order.user_id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak memiliki user'; END IF;
  IF v_order.payment_proof_url IS NULL THEN RAISE EXCEPTION 'Bukti bayar belum diunggah'; END IF;

  SELECT lms_program_id INTO v_lms FROM public.marketing_programs
  WHERE id::text = v_order.program_id;
  IF v_lms IS NULL THEN RAISE EXCEPTION 'Paket belum dipetakan ke program LMS'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.batches WHERE id = p_batch_id AND program_id = v_lms) THEN
    RAISE EXCEPTION 'Batch tidak sesuai dengan program yang dibeli';
  END IF;

  UPDATE public.users SET role = 'siswa'
  WHERE id = v_order.user_id AND role IS NULL;

  SELECT id INTO v_enroll FROM public.enrollments
  WHERE user_id = v_order.user_id AND batch_id = p_batch_id;

  IF v_enroll IS NULL THEN
    INSERT INTO public.enrollments (user_id, batch_id, status, enrollment_source, checkout_order_id)
    VALUES (v_order.user_id, p_batch_id, 'aktif', 'marketing', p_order_id)
    RETURNING id INTO v_enroll;
  END IF;

  UPDATE public.checkout_orders
     SET status='confirmed', confirmed_by=auth.uid(), confirmed_at=now(),
         admin_notes=p_admin_notes, updated_at=now()
   WHERE id = p_order_id;

  IF v_order.lead_id IS NOT NULL THEN
    UPDATE public.marketing_leads
       SET status='converted', converted_user_id=v_order.user_id,
           converted_at=now(), updated_at=now()
     WHERE id = v_order.lead_id;
  END IF;

  INSERT INTO public.in_app_notifications (user_id, title, message, action_url)
  VALUES (v_order.user_id, 'Pembayaran dikonfirmasi',
          'Akun LMS Anda sudah aktif. Silakan login ke LMS.', '/dashboard');

  INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, new_values)
  VALUES (auth.uid(), 'confirm', 'checkout_order', p_order_id,
          jsonb_build_object('batch_id', p_batch_id, 'enrollment_id', v_enroll));

  RETURN v_enroll;
END $$;

REVOKE ALL ON FUNCTION public.confirm_checkout_order(uuid,uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.confirm_checkout_order(uuid,uuid,text) TO authenticated;

-- ============ 7. Perbaikan Policy (dari jawaban sebelumnya) ============

-- 7.a. Perbaikan users_insert_own_or_admin (hanya role IS NULL)
DROP POLICY IF EXISTS "users_insert_own_or_admin" ON public.users;
CREATE POLICY "users_insert_own_or_admin" ON public.users
FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = id AND role IS NULL) 
  OR public.app_is_admin()
);

-- 7.b. Blok DO untuk mengganti policy Allow ... for authenticated users menjadi app_is_lms_member()
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT tablename, policyname, cmd
        FROM pg_policies
        WHERE schemaname = 'public' 
          AND policyname ILIKE 'Allow % for authenticated users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);
        
        IF rec.cmd = 'SELECT' THEN
            EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.app_is_lms_member())', rec.policyname, rec.tablename);
        ELSIF rec.cmd = 'INSERT' THEN
            EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.app_is_lms_member())', rec.policyname, rec.tablename);
        ELSIF rec.cmd = 'UPDATE' THEN
            EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.app_is_lms_member()) WITH CHECK (public.app_is_lms_member())', rec.policyname, rec.tablename);
        ELSIF rec.cmd = 'DELETE' THEN
            EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.app_is_lms_member())', rec.policyname, rec.tablename);
        ELSE
            EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.app_is_lms_member()) WITH CHECK (public.app_is_lms_member())', rec.policyname, rec.tablename);
        END IF;
    END LOOP;
END
$$;
