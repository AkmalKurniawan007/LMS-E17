-- ====================================================================
-- MIGRATION: 20261015000001_fix_junior_video_access_confirm_order.sql
-- Perbaikan Akses Video Paket Junior (Self-Paced) di confirm_checkout_order
-- ====================================================================

-- 1. Pastikan kolom pendukung di public.checkout_orders dan public.video_access sudah ada
ALTER TABLE public.checkout_orders
  ADD COLUMN IF NOT EXISTS access_granted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_granted_at timestamp with time zone;

ALTER TABLE public.video_access
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- 2. Hapus versi fungsi sebelumnya untuk menghindari duplikasi signature overloading
DROP FUNCTION IF EXISTS public.confirm_checkout_order(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.confirm_checkout_order(uuid, uuid, text, timestamptz);

-- 3. Definisikan ulang fungsi confirm_checkout_order dengan dukungan Paket Junior & Expiry Date
CREATE OR REPLACE FUNCTION public.confirm_checkout_order(
  p_order_id uuid,
  p_batch_id uuid DEFAULT NULL,
  p_admin_notes text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.checkout_orders;
  v_lms uuid;
  v_enroll uuid := NULL;
  v_old_tier text;
  v_old_rank int;
  v_new_rank int;
  v_video_tier text;
BEGIN
  -- 1. Validasi akses admin
  IF NOT public.app_is_admin() THEN 
    RAISE EXCEPTION 'Akses ditolak: hanya admin'; 
  END IF;

  -- 2. Ambil data order dan kunci baris untuk transaksi aman (FOR UPDATE)
  SELECT * INTO v_order 
  FROM public.checkout_orders 
  WHERE id = p_order_id 
  FOR UPDATE;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Pesanan tidak ditemukan'; 
  END IF;
  IF v_order.status <> 'pending' THEN 
    RAISE EXCEPTION 'Pesanan sudah diproses'; 
  END IF;
  IF v_order.user_id IS NULL THEN 
    RAISE EXCEPTION 'Pesanan tidak memiliki user'; 
  END IF;
  IF v_order.payment_proof_url IS NULL THEN 
    RAISE EXCEPTION 'Bukti bayar belum diunggah'; 
  END IF;

  -- 3. Validasi tier_type pesanan
  IF v_order.tier_type IS NULL OR v_order.tier_type NOT IN ('junior', 'expert', 'complete', 'bootcamp') THEN
    RAISE EXCEPTION 'Tipe tier tidak valid';
  END IF;

  -- 4. Penanganan Alur Mentoring / Bootcamp vs Junior (Self Paced)
  IF v_order.tier_type IN ('expert', 'complete', 'bootcamp') THEN
    -- Wajib menyertakan batch_id untuk paket live mentoring
    IF p_batch_id IS NULL THEN
      RAISE EXCEPTION 'Batch kelas harus dipilih untuk paket %', v_order.tier_type;
    END IF;

    -- Validasi pemetaan program marketing ke LMS
    SELECT lms_program_id INTO v_lms 
    FROM public.marketing_programs
    WHERE id::text = v_order.program_id;

    IF v_lms IS NULL THEN 
      RAISE EXCEPTION 'Paket belum dipetakan ke program LMS'; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.batches WHERE id = p_batch_id AND program_id = v_lms) THEN
      RAISE EXCEPTION 'Batch tidak sesuai dengan program yang dibeli';
    END IF;

    -- Update role user menjadi 'siswa' jika sebelumnya belum memiliki role
    UPDATE public.users 
    SET role = 'siswa'
    WHERE id = v_order.user_id AND role IS NULL;

    -- Cek apakah user sudah terdaftar di batch ini sebelumnya
    SELECT id, tier INTO v_enroll, v_old_tier 
    FROM public.enrollments
    WHERE user_id = v_order.user_id AND batch_id = p_batch_id;

    IF v_enroll IS NULL THEN
      -- Belum terdaftar: Buat enrollment baru
      INSERT INTO public.enrollments (
        user_id, batch_id, status, enrollment_source, checkout_order_id, tier
      ) VALUES (
        v_order.user_id, p_batch_id, 'aktif', 'marketing', p_order_id, v_order.tier_type
      )
      RETURNING id INTO v_enroll;
    ELSE
      -- Sudah terdaftar: Cek upgrade tier berdasarkan rank
      v_new_rank := CASE v_order.tier_type
                      WHEN 'expert' THEN 2
                      WHEN 'complete' THEN 3
                      WHEN 'bootcamp' THEN 4
                      ELSE 1
                    END;
      v_old_rank := CASE v_old_tier
                      WHEN 'expert' THEN 2
                      WHEN 'complete' THEN 3
                      WHEN 'bootcamp' THEN 4
                      ELSE 1
                    END;

      IF v_new_rank > v_old_rank THEN
        UPDATE public.enrollments
        SET tier = v_order.tier_type
        WHERE id = v_enroll;

        INSERT INTO public.audit_logs (
          user_id, action_type, entity_type, entity_id, old_values, new_values
        ) VALUES (
          auth.uid(),
          'tier_upgrade',
          'enrollment',
          v_enroll,
          jsonb_build_object('tier', v_old_tier),
          jsonb_build_object('tier', v_order.tier_type, 'order_id', p_order_id)
        );
      END IF;
    END IF;

    v_video_tier := 'expert';
  ELSE
    -- Paket Junior (Self Paced): Murni akses video, TIDAK membutuhkan batch atau enrollment LMS
    v_enroll := NULL;
    v_video_tier := 'junior';
  END IF;

  -- 5. Berikan Hak Akses Video di public.video_access (Berlaku untuk SEMUA paket)
  INSERT INTO public.video_access (
    user_id,
    program_id,
    tier,
    order_id,
    granted_by,
    granted_at,
    is_active,
    notes,
    expires_at
  ) VALUES (
    v_order.user_id,
    v_order.program_id,
    v_video_tier,
    p_order_id,
    auth.uid(),
    now(),
    true,
    'Akses otomatis saat konfirmasi pesanan (' || v_order.tier_type || ')',
    p_expires_at
  )
  ON CONFLICT (user_id, program_id) DO UPDATE SET
    tier = CASE 
      WHEN EXCLUDED.tier = 'expert' THEN 'expert' 
      ELSE public.video_access.tier 
    END,
    order_id = EXCLUDED.order_id,
    granted_by = EXCLUDED.granted_by,
    granted_at = now(),
    is_active = true,
    expires_at = COALESCE(EXCLUDED.expires_at, public.video_access.expires_at),
    notes = EXCLUDED.notes;

  -- 6. Update status order menjadi confirmed dan tandai access_granted = true
  UPDATE public.checkout_orders
  SET status = 'confirmed',
      confirmed_by = auth.uid(),
      confirmed_at = now(),
      admin_notes = p_admin_notes,
      access_granted = true,
      access_granted_at = now(),
      updated_at = now()
  WHERE id = p_order_id;

  -- 7. Update status marketing lead jika ada
  IF v_order.lead_id IS NOT NULL THEN
    UPDATE public.marketing_leads
    SET status = 'converted',
        converted_user_id = v_order.user_id,
        converted_at = now(),
        updated_at = now()
    WHERE id = v_order.lead_id;
  END IF;

  -- 8. Kirim notifikasi in-app sesuai tier pesanan
  IF v_order.tier_type = 'junior' THEN
    INSERT INTO public.in_app_notifications (user_id, title, message, action_url)
    VALUES (
      v_order.user_id,
      'Pembayaran Dikonfirmasi!',
      'Akses materi video pembelajaran Anda sudah aktif. Selamat belajar!',
      '/pembeli/kelas-saya'
    );
  ELSE
    INSERT INTO public.in_app_notifications (user_id, title, message, action_url)
    VALUES (
      v_order.user_id,
      'Pembayaran Dikonfirmasi & Batch Aktif',
      'Akun LMS Anda sudah aktif. Silakan masuk ke portal kelas untuk melihat jadwal sesi mentoring.',
      '/siswa'
    );
  END IF;

  -- 9. Catat ke audit_logs
  INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, new_values)
  VALUES (
    auth.uid(),
    'confirm',
    'checkout_order',
    p_order_id,
    jsonb_build_object(
      'batch_id', p_batch_id,
      'enrollment_id', v_enroll,
      'tier', v_order.tier_type,
      'video_tier', v_video_tier,
      'expires_at', p_expires_at
    )
  );

  RETURN v_enroll;
END $$;

REVOKE ALL ON FUNCTION public.confirm_checkout_order(uuid, uuid, text, timestamptz) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.confirm_checkout_order(uuid, uuid, text, timestamptz) TO authenticated;
