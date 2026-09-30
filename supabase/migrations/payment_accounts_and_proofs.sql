-- ====================================================================
-- PAYMENT ACCOUNTS AND PAYMENT PROOFS
-- Run this migration after marketing_backend.sql and video_access.sql.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  method_type      text NOT NULL CHECK (method_type IN ('bank_transfer', 'ewallet')),
  provider_name    text NOT NULL,
  account_number   text NOT NULL,
  account_holder   text NOT NULL,
  instructions     text,
  is_active        boolean NOT NULL DEFAULT true,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamp with time zone NOT NULL DEFAULT now(),
  updated_at       timestamp with time zone NOT NULL DEFAULT now(),
  created_by       uuid REFERENCES public.users(id),
  CONSTRAINT payment_accounts_provider_account_unique UNIQUE (provider_name, account_number)
);

ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_accounts_public_read_active"
  ON public.payment_accounts FOR SELECT
  USING (is_active = true);

CREATE POLICY "payment_accounts_admin_all"
  ON public.payment_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_payment_accounts_updated_at
  BEFORE UPDATE ON public.payment_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.checkout_orders
  ADD COLUMN IF NOT EXISTS payment_account_id uuid REFERENCES public.payment_accounts(id),
  ADD COLUMN IF NOT EXISTS payment_proof_path text,
  ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_checkout_orders_user_status
  ON public.checkout_orders(user_id, status);

CREATE INDEX IF NOT EXISTS idx_checkout_orders_payment_account
  ON public.checkout_orders(payment_account_id);

-- Private bucket. Payment proofs are viewed with short-lived signed URLs only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png'];

CREATE POLICY "payment_proofs_user_upload_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_user_read_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_user_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
