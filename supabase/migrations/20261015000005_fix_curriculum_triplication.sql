-- ====================================================================
-- MIGRATION: 20261015000005_fix_curriculum_triplication.sql
-- Mengatasi Redudansi 3 Lapis Kurikulum (Data Triplication)
-- 1. Tambah Foreign Key program_session_id pada marketing_program_curriculum
-- 2. Tambah kolom video_url, preview_video_url, duration pada program_sessions
-- 3. Backfill relasi data yang sudah ada (OutSystems & React.JS)
-- 4. Trigger otomatis saat program_sessions diupdate -> marketing kurikulum ikut update
-- 5. Stored function sync_curriculum_lms_and_marketing untuk sinkronisasi 2 arah
-- ====================================================================

-- 1. Tambahkan Foreign Key pada marketing_program_curriculum
ALTER TABLE public.marketing_program_curriculum
ADD COLUMN IF NOT EXISTS program_session_id uuid REFERENCES public.program_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_marketing_curriculum_prog_sess_id
ON public.marketing_program_curriculum(program_session_id);

-- 2. Tambahkan kolom pendukung di program_sessions (Master Blueprint LMS)
ALTER TABLE public.program_sessions
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS preview_video_url text,
ADD COLUMN IF NOT EXISTS duration text;

-- 3. Rekonsiliasi & Backfill data yang sudah ada saat ini
-- Hubungkan marketing_program_curriculum dengan program_sessions berdasarkan urutan sesi
UPDATE public.marketing_program_curriculum mpc
SET program_session_id = ps.id
FROM public.marketing_programs mp
JOIN public.program_sessions ps ON ps.program_id = mp.lms_program_id
WHERE mpc.program_id = mp.id
  AND mpc.sort_order = ps.order_number
  AND mpc.program_session_id IS NULL;

-- Salin video_url, duration, dan judul asli dari marketing ke master blueprint program_sessions
UPDATE public.program_sessions ps
SET
  video_url = COALESCE(ps.video_url, mpc.video_url),
  preview_video_url = COALESCE(ps.preview_video_url, mpc.preview_video_url),
  duration = COALESCE(ps.duration, mpc.duration),
  title = CASE WHEN ps.title ~ '^Sesi [0-9]+$' AND mpc.title IS NOT NULL AND mpc.title <> '' THEN mpc.title ELSE ps.title END,
  description = CASE WHEN (ps.description IS NULL OR ps.description = '') AND mpc.description IS NOT NULL THEN mpc.description ELSE ps.description END
FROM public.marketing_program_curriculum mpc
WHERE mpc.program_session_id = ps.id;

-- 4. Trigger Otomatis: Update di program_sessions langsung merefleksikan perubahan ke marketing_program_curriculum
CREATE OR REPLACE FUNCTION public.sync_program_session_to_marketing()
RETURNS trigger AS $$
BEGIN
  UPDATE public.marketing_program_curriculum
  SET
    title = NEW.title,
    description = COALESCE(NEW.description, description),
    duration = COALESCE(NEW.duration, duration),
    video_url = COALESCE(NEW.video_url, video_url),
    preview_video_url = COALESCE(NEW.preview_video_url, preview_video_url),
    sort_order = NEW.order_number,
    updated_at = now()
  WHERE program_session_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_program_session_to_marketing ON public.program_sessions;
CREATE TRIGGER trg_sync_program_session_to_marketing
AFTER UPDATE OF title, description, order_number, video_url, preview_video_url, duration
ON public.program_sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_program_session_to_marketing();

-- 5. Stored Function: Sinkronisasi Kurikulum 2-Arah (LMS <-> Marketing)
CREATE OR REPLACE FUNCTION public.sync_curriculum_lms_and_marketing(
  p_marketing_program_id uuid,
  p_direction text DEFAULT 'pull_from_lms'
)
RETURNS jsonb AS $$
DECLARE
  v_lms_id uuid;
  v_count integer := 0;
  r_sess RECORD;
  r_curr RECORD;
BEGIN
  -- Ambil ID program LMS terkait
  SELECT lms_program_id INTO v_lms_id
  FROM public.marketing_programs
  WHERE id = p_marketing_program_id;

  IF v_lms_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Program marketing belum dipetakan ke program LMS (lms_program_id kosong)');
  END IF;

  IF p_direction = 'pull_from_lms' THEN
    -- Tarik dari program_sessions ke marketing_program_curriculum
    FOR r_sess IN
      SELECT id, title, description, order_number, video_url, preview_video_url, duration
      FROM public.program_sessions
      WHERE program_id = v_lms_id
      ORDER BY order_number ASC
    LOOP
      IF EXISTS (SELECT 1 FROM public.marketing_program_curriculum WHERE program_id = p_marketing_program_id AND (program_session_id = r_sess.id OR sort_order = r_sess.order_number)) THEN
        UPDATE public.marketing_program_curriculum
        SET
          program_session_id = r_sess.id,
          title = r_sess.title,
          description = COALESCE(r_sess.description, description),
          duration = COALESCE(r_sess.duration, duration),
          video_url = COALESCE(r_sess.video_url, video_url),
          preview_video_url = COALESCE(r_sess.preview_video_url, preview_video_url),
          sort_order = r_sess.order_number,
          updated_at = now()
        WHERE program_id = p_marketing_program_id
          AND (program_session_id = r_sess.id OR sort_order = r_sess.order_number);
      ELSE
        INSERT INTO public.marketing_program_curriculum (
          program_id,
          program_session_id,
          title,
          description,
          duration,
          video_url,
          preview_video_url,
          sort_order,
          access_tiers
        ) VALUES (
          p_marketing_program_id,
          r_sess.id,
          r_sess.title,
          r_sess.description,
          COALESCE(r_sess.duration, '15:00'),
          r_sess.video_url,
          r_sess.preview_video_url,
          r_sess.order_number,
          ARRAY['junior', 'expert', 'bootcamp']::text[]
        );
      END IF;
      v_count := v_count + 1;
    END LOOP;

  ELSIF p_direction = 'push_to_lms' THEN
    -- Dorong dari marketing_program_curriculum ke program_sessions
    FOR r_curr IN
      SELECT id, title, description, sort_order, video_url, preview_video_url, duration, program_session_id
      FROM public.marketing_program_curriculum
      WHERE program_id = p_marketing_program_id
      ORDER BY sort_order ASC
    LOOP
      IF r_curr.program_session_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.program_sessions WHERE id = r_curr.program_session_id) THEN
        UPDATE public.program_sessions
        SET
          title = r_curr.title,
          description = COALESCE(r_curr.description, description),
          duration = COALESCE(r_curr.duration, duration),
          video_url = COALESCE(r_curr.video_url, video_url),
          preview_video_url = COALESCE(r_curr.preview_video_url, preview_video_url),
          order_number = r_curr.sort_order
        WHERE id = r_curr.program_session_id;
      ELSIF EXISTS (SELECT 1 FROM public.program_sessions WHERE program_id = v_lms_id AND order_number = r_curr.sort_order) THEN
        UPDATE public.program_sessions
        SET
          title = r_curr.title,
          description = COALESCE(r_curr.description, description),
          duration = COALESCE(r_curr.duration, duration),
          video_url = COALESCE(r_curr.video_url, video_url),
          preview_video_url = COALESCE(r_curr.preview_video_url, preview_video_url)
        WHERE program_id = v_lms_id AND order_number = r_curr.sort_order;

        -- Hubungkan kembali id session ke marketing
        UPDATE public.marketing_program_curriculum
        SET program_session_id = (SELECT id FROM public.program_sessions WHERE program_id = v_lms_id AND order_number = r_curr.sort_order LIMIT 1)
        WHERE id = r_curr.id;
      ELSE
        INSERT INTO public.program_sessions (
          program_id,
          order_number,
          title,
          description,
          format,
          video_url,
          preview_video_url,
          duration
        ) VALUES (
          v_lms_id,
          r_curr.sort_order,
          r_curr.title,
          r_curr.description,
          'online',
          r_curr.video_url,
          r_curr.preview_video_url,
          r_curr.duration
        ) RETURNING id INTO r_sess.id;

        UPDATE public.marketing_program_curriculum
        SET program_session_id = r_sess.id
        WHERE id = r_curr.id;
      END IF;
      v_count := v_count + 1;
    END LOOP;
  END IF;

  -- Perbarui sessions_count di marketing_programs
  UPDATE public.marketing_programs
  SET
    sessions_count = (SELECT COUNT(*) FROM public.marketing_program_curriculum WHERE program_id = p_marketing_program_id),
    updated_at = now()
  WHERE id = p_marketing_program_id;

  RETURN jsonb_build_object(
    'success', true,
    'direction', p_direction,
    'synced_count', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
