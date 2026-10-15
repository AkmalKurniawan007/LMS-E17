-- Migration: 20261015000004_create_class_reminder_logs.sql
-- Keterangan: Tabel log riwayat pengiriman email pengingat kelas harian otomatis (07:00 WIB)
-- Mencegah duplikasi pengiriman email pada hari yang sama (idempotency).

CREATE TABLE IF NOT EXISTS public.class_reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.batches(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  mentor_recipients jsonb DEFAULT '[]'::jsonb,
  student_recipients jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT uq_session_reminder_date UNIQUE (session_id, reminder_date)
);

CREATE INDEX IF NOT EXISTS idx_class_reminder_logs_date ON public.class_reminder_logs(reminder_date);
CREATE INDEX IF NOT EXISTS idx_class_reminder_logs_session ON public.class_reminder_logs(session_id);

-- RLS
ALTER TABLE public.class_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on class_reminder_logs"
  ON public.class_reminder_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access on class_reminder_logs"
  ON public.class_reminder_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
