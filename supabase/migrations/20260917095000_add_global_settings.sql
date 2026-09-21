create table if not exists public.global_settings (
  id int primary key check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default settings row if it doesn't exist
insert into public.global_settings (id, data)
values (1, '{
  "institutionName": "E17 Course",
  "contactEmail": "info@e17course.com",
  "minAttendance": 80,
  "timezone": "Asia/Jakarta",
  "passingGrade": 70,
  "gracePeriodHours": 24,
  "maintenanceMode": false,
  "sessionTimeoutMinutes": 60,
  "maxActiveDevices": 2,
  "smtpHost": "",
  "smtpPort": 587,
  "smtpUser": "",
  "smtpPassword": "",
  "primaryColor": "#1e3a8a",
  "logoUrl": ""
}'::jsonb)
on conflict (id) do nothing;

-- Set up RLS
alter table public.global_settings enable row level security;

-- Admins can update global settings
create policy "Admins can update global settings" on public.global_settings
  for update using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- Everyone (or authenticated users) might need to read certain settings (like logo, colors, maintenance mode). 
-- For now, we will allow read access to authenticated users
create policy "Authenticated users can read global settings" on public.global_settings
  for select using (auth.role() = 'authenticated');
