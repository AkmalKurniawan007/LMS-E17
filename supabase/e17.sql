-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  role USER-DEFINED DEFAULT 'siswa'::user_role,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  username text UNIQUE,
  tagline text,
  bio text,
  portfolio_status boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.batches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_id uuid,
  name character varying NOT NULL,
  start_date date,
  end_date date,
  timezone character varying DEFAULT 'WIB'::character varying,
  quiz_weight numeric DEFAULT 50.00,
  task_weight numeric DEFAULT 50.00,
  created_at timestamp with time zone DEFAULT now(),
  status character varying NOT NULL DEFAULT 'akan_datang'::character varying,
  certificate_template_url text,
  CONSTRAINT batches_pkey PRIMARY KEY (id),
  CONSTRAINT batches_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.batch_mentors (
  batch_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  CONSTRAINT batch_mentors_pkey PRIMARY KEY (batch_id, mentor_id),
  CONSTRAINT batch_mentors_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT batch_mentors_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  batch_id uuid,
  status USER-DEFINED DEFAULT 'aktif'::enrollment_status,
  status_reason text,
  final_grade numeric,
  attendance_percentage numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT enrollments_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid,
  order_number integer NOT NULL CHECK (order_number >= 1 AND order_number <= 10),
  title character varying NOT NULL,
  description text,
  format USER-DEFINED NOT NULL,
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  session_type character varying DEFAULT 'offline'::character varying,
  meeting_link text,
  meeting_link_status character varying DEFAULT 'pending'::character varying,
  meeting_link_provider character varying DEFAULT 'admin'::character varying,
  status text DEFAULT 'not_started'::text,
  start_time time without time zone,
  end_time time without time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  title character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  content_url text NOT NULL,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materials_pkey PRIMARY KEY (id),
  CONSTRAINT materials_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  title character varying NOT NULL,
  passing_grade numeric DEFAULT 70.00,
  max_retries integer DEFAULT 3,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  deadline timestamp with time zone,
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quiz_id uuid,
  question_text text NOT NULL,
  type character varying NOT NULL,
  options jsonb,
  correct_answer text NOT NULL,
  order_number integer NOT NULL,
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  deadline timestamp with time zone NOT NULL,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_final_project boolean DEFAULT false,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.material_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  material_id uuid,
  is_completed boolean DEFAULT true,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT material_progress_pkey PRIMARY KEY (id),
  CONSTRAINT material_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT material_progress_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quiz_id uuid,
  user_id uuid,
  score numeric NOT NULL,
  is_passed boolean NOT NULL,
  attempt_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.task_submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  submission_type character varying NOT NULL DEFAULT 'file_upload'::character varying,
  feedback text,
  feedback_by uuid,
  feedback_at timestamp with time zone,
  CONSTRAINT task_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT ts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT ts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT task_submissions_feedback_by_fkey FOREIGN KEY (feedback_by) REFERENCES public.users(id)
);
CREATE TABLE public.manual_grades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  enrollment_id uuid,
  task_submission_id uuid,
  component_name character varying NOT NULL,
  score numeric NOT NULL,
  weight_percentage numeric DEFAULT 100.00,
  graded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT manual_grades_pkey PRIMARY KEY (id),
  CONSTRAINT manual_grades_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id),
  CONSTRAINT mg_task_submission_fkey FOREIGN KEY (task_submission_id) REFERENCES public.task_submissions(id),
  CONSTRAINT manual_grades_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.users(id)
);
CREATE TABLE public.attendance_tokens (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_by uuid,
  CONSTRAINT attendance_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT attendance_tokens_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.attendances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  user_id uuid,
  source USER-DEFINED NOT NULL,
  recorded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendances_pkey PRIMARY KEY (id),
  CONSTRAINT attendances_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT attendances_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  enrollment_id uuid UNIQUE,
  certificate_number character varying NOT NULL UNIQUE,
  verification_code character varying NOT NULL UNIQUE,
  pdf_url text NOT NULL,
  issued_at timestamp with time zone DEFAULT now(),
  status character varying NOT NULL DEFAULT 'valid'::character varying,
  revoked_reason text,
  revoked_by uuid,
  revoked_at timestamp with time zone,
  manual_image_url text,
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id),
  CONSTRAINT certificates_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id)
);
CREATE TABLE public.portfolios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  portfolio_slug character varying NOT NULL UNIQUE,
  is_public boolean DEFAULT true,
  display_preferences jsonb DEFAULT '{"show_grades": true, "show_attendance": true, "show_failed_batches": false}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.bulk_import_jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid,
  created_by uuid,
  status character varying NOT NULL,
  log_details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bulk_import_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT bulk_import_jobs_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT bulk_import_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action_type character varying NOT NULL,
  entity_type character varying NOT NULL,
  entity_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.in_app_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title character varying NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT in_app_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.batch_weight_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  proposed_quiz_weight numeric NOT NULL,
  proposed_task_weight numeric NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::weight_request_status,
  reason text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT batch_weight_requests_pkey PRIMARY KEY (id),
  CONSTRAINT bwr_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT bwr_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id),
  CONSTRAINT bwr_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id)
);
CREATE TABLE public.program_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_id uuid NOT NULL,
  order_number integer NOT NULL CHECK (order_number >= 1 AND order_number <= 10),
  title character varying NOT NULL,
  description text,
  format USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  order_index integer DEFAULT 0,
  CONSTRAINT program_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT program_sessions_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.program_materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_session_id uuid NOT NULL,
  title character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  content_url text NOT NULL,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_materials_pkey PRIMARY KEY (id),
  CONSTRAINT program_materials_session_id_fkey FOREIGN KEY (program_session_id) REFERENCES public.program_sessions(id)
);
CREATE TABLE public.program_quizzes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_session_id uuid NOT NULL,
  title character varying NOT NULL,
  passing_grade numeric DEFAULT 70.00,
  max_retries integer DEFAULT 3,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT program_quizzes_session_id_fkey FOREIGN KEY (program_session_id) REFERENCES public.program_sessions(id)
);
CREATE TABLE public.program_quiz_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_quiz_id uuid NOT NULL,
  question_text text NOT NULL,
  type character varying NOT NULL,
  options jsonb,
  correct_answer text NOT NULL,
  order_number integer NOT NULL,
  CONSTRAINT program_quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT program_quiz_questions_quiz_id_fkey FOREIGN KEY (program_quiz_id) REFERENCES public.program_quizzes(id)
);
CREATE TABLE public.session_unlocks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  mentor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_id uuid,
  quiz_id uuid,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT session_unlocks_pkey PRIMARY KEY (id),
  CONSTRAINT session_unlocks_mentor_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id),
  CONSTRAINT session_unlocks_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT session_unlocks_session_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT session_unlocks_quiz_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.program_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_session_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  order_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT program_tasks_session_fkey FOREIGN KEY (program_session_id) REFERENCES public.program_sessions(id)
);
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type USER-DEFINED NOT NULL,
  name text,
  batch_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT chat_rooms_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.chat_participants (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_participants_pkey PRIMARY KEY (room_id, user_id),
  CONSTRAINT chat_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id),
  CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  sender_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.portfolio_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  project_url text,
  status text DEFAULT 'draft'::text,
  batch_id uuid,
  feedback text,
  validated_by uuid,
  validated_at timestamp with time zone,
  is_showcase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolio_projects_pkey PRIMARY KEY (id),
  CONSTRAINT portfolio_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT portfolio_projects_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT portfolio_projects_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.users(id)
);
CREATE TABLE public.broadcasts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject text NOT NULL,
  message text NOT NULL,
  target text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT broadcasts_pkey PRIMARY KEY (id),
  CONSTRAINT broadcasts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.helpdesk_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'Open'::text CHECK (status = ANY (ARRAY['Open'::text, 'In Progress'::text, 'Resolved'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT helpdesk_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT helpdesk_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.helpdesk_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  sender_id uuid,
  message text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT helpdesk_messages_pkey PRIMARY KEY (id),
  CONSTRAINT helpdesk_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.helpdesk_tickets(id),
  CONSTRAINT helpdesk_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);