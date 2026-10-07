-- Tambahkan kolom access_tiers ke marketing_program_curriculum
ALTER TABLE public.marketing_program_curriculum 
ADD COLUMN IF NOT EXISTS access_tiers text[] DEFAULT '{junior,expert,bootcamp}'::text[];
