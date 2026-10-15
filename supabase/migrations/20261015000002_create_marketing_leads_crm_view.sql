-- ====================================================================
-- MIGRATION: 20261015000002_create_marketing_leads_crm_view.sql
-- Membuat View marketing_leads_crm untuk Dashboard CRM Admin Marketing
-- ====================================================================

-- 1. Hapus view lama jika ada
DROP VIEW IF EXISTS public.marketing_leads_crm;

-- 2. Buat View marketing_leads_crm
--    Menggabungkan data calon pembeli (marketing_leads), status user terkonversi (users),
--    dan riwayat transaksi pesanan terbaru (checkout_orders).
CREATE OR REPLACE VIEW public.marketing_leads_crm AS
SELECT
  ml.id,
  ml.full_name,
  ml.email,
  ml.phone,
  ml.program_interest,
  ml.source,
  ml.status,
  ml.notes,
  ml.converted_user_id,
  ml.converted_at,
  ml.last_activity,
  ml.created_at,
  ml.updated_at,
  ord.latest_order_id,
  ord.latest_order_tier,
  ord.latest_order_amount,
  ord.latest_order_status,
  ord.order_created_at,
  u.full_name AS converted_user_name
FROM public.marketing_leads ml
LEFT JOIN public.users u 
  ON u.id = ml.converted_user_id
LEFT JOIN LATERAL (
  SELECT
    co.id AS latest_order_id,
    co.tier_type AS latest_order_tier,
    co.amount AS latest_order_amount,
    co.status AS latest_order_status,
    co.created_at AS order_created_at
  FROM public.checkout_orders co
  WHERE co.lead_id = ml.id 
     OR (ml.converted_user_id IS NOT NULL AND co.user_id = ml.converted_user_id)
  ORDER BY co.created_at DESC
  LIMIT 1
) ord ON true;

-- 3. Berikan hak akses pembacaan view ke authenticated users (admin) dan service_role
GRANT SELECT ON public.marketing_leads_crm TO authenticated, service_role;
