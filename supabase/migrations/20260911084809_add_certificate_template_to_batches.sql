-- Add certificate_template_url to batches
ALTER TABLE public.batches ADD COLUMN certificate_template_url text;
