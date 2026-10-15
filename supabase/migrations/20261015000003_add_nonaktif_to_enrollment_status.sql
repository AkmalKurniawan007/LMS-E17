-- ====================================================================
-- MIGRATION: 20261015000003_add_nonaktif_to_enrollment_status.sql
-- Menambahkan value 'nonaktif' ke enum enrollment_status untuk pembatalan order
-- ====================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'enrollment_status' AND e.enumlabel = 'nonaktif'
  ) THEN
    ALTER TYPE public.enrollment_status ADD VALUE 'nonaktif';
  END IF;
END $$;
