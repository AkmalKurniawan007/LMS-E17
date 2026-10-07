CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  method_type text NOT NULL CHECK (method_type IN ('bank_transfer', 'ewallet')),
  provider_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  instructions text,
  is_active boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active payment accounts (needed for checkout page)
CREATE POLICY "Enable read access for all"
ON public.payment_accounts FOR SELECT
USING (true);

-- Allow admins to manage payment accounts
CREATE POLICY "Enable all access for authenticated users"
ON public.payment_accounts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
