-- ====================================================================
-- MIGRATION: 20261013000001_add_tier_system.sql
-- LMS Multi-Tier Access System & BNSP Progress Tracking
-- ====================================================================

-- 1. Tambah kolom tier ke tabel public.enrollments
ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'bootcamp';

-- Pastikan CHECK constraint untuk tier enrollments
ALTER TABLE public.enrollments 
  DROP CONSTRAINT IF EXISTS enrollments_tier_check;

ALTER TABLE public.enrollments 
  ADD CONSTRAINT enrollments_tier_check 
  CHECK (tier IN ('expert', 'complete', 'bootcamp'));

-- Backfill baris lama jika ada yang bernilai NULL
UPDATE public.enrollments 
SET tier = 'bootcamp' 
WHERE tier IS NULL;

-- 2. Tambah penanda konten BNSP pada quizzes dan tasks
ALTER TABLE public.quizzes 
  ADD COLUMN IF NOT EXISTS is_bnsp boolean NOT NULL DEFAULT false;

ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS is_bnsp boolean NOT NULL DEFAULT false;

-- 3. Buat tabel pelacakan lifecycle BNSP (public.bnsp_progress)
CREATE TABLE IF NOT EXISTS public.bnsp_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  theory_status text NOT NULL DEFAULT 'not_started' 
    CHECK (theory_status IN ('not_started', 'in_progress', 'passed', 'failed')),
  theory_score numeric(5,2) DEFAULT NULL,
  theory_passed_at timestamptz DEFAULT NULL,
  portfolio_status text NOT NULL DEFAULT 'not_started' 
    CHECK (portfolio_status IN ('not_started', 'uploaded', 'under_review', 'revision_needed', 'accepted')),
  portfolio_uploaded_at timestamptz DEFAULT NULL,
  assessor_status text NOT NULL DEFAULT 'pending' 
    CHECK (assessor_status IN ('pending', 'kompeten', 'belum_kompeten')),
  assessor_notes text DEFAULT NULL,
  assessed_at timestamptz DEFAULT NULL,
  assessed_by uuid REFERENCES public.users(id) DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bnsp_progress_enrollment_unique UNIQUE (enrollment_id)
);

CREATE INDEX IF NOT EXISTS idx_bnsp_progress_enrollment 
  ON public.bnsp_progress(enrollment_id);

-- Trigger auto-update updated_at pada bnsp_progress
CREATE OR REPLACE FUNCTION public.bnsp_progress_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bnsp_progress_updated_at ON public.bnsp_progress;
CREATE TRIGGER trg_update_bnsp_progress_updated_at
  BEFORE UPDATE ON public.bnsp_progress
  FOR EACH ROW EXECUTE FUNCTION public.bnsp_progress_set_updated_at();

-- 4. Aktifkan Row Level Security (RLS) pada bnsp_progress (Koreksi K3)
ALTER TABLE public.bnsp_progress ENABLE ROW LEVEL SECURITY;

-- 4.a Policy SELECT untuk Siswa Pemilik Enrollment
DROP POLICY IF EXISTS "bnsp_progress_owner_select" ON public.bnsp_progress;
CREATE POLICY "bnsp_progress_owner_select" ON public.bnsp_progress
  FOR SELECT TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- 4.b Policy ALL untuk Admin (menggunakan helper public.app_is_admin())
DROP POLICY IF EXISTS "bnsp_progress_admin_all" ON public.bnsp_progress;
CREATE POLICY "bnsp_progress_admin_all" ON public.bnsp_progress
  FOR ALL TO authenticated
  USING (
    public.app_is_admin()
  )
  WITH CHECK (
    public.app_is_admin()
  );

-- Catatan: TIDAK ada policy INSERT/UPDATE untuk siswa di tabel ini.
-- Seluruh mutasi data dilakukan lewat server actions dengan elevated client (Service Role),
-- dan penilaian asesor/mentor dilakukan via server action setelah verifikasi hak akses.
