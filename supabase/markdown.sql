## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `varchar` |  Unique |
| `full_name` | `varchar` |  |
| `role` | `user_role` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `username` | `text` |  Nullable Unique |
| `tagline` | `text` |  Nullable |
| `bio` | `text` |  Nullable |
| `portfolio_status` | `bool` |  Nullable |

## Table `programs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `description` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `batches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_id` | `uuid` |  Nullable |
| `name` | `varchar` |  |
| `start_date` | `date` |  Nullable |
| `end_date` | `date` |  Nullable |
| `timezone` | `varchar` |  Nullable |
| `quiz_weight` | `numeric` |  Nullable |
| `task_weight` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `status` | `varchar` |  |
| `certificate_template_url` | `text` |  Nullable |

## Table `batch_mentors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `batch_id` | `uuid` | Primary |
| `mentor_id` | `uuid` | Primary |

## Table `enrollments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `batch_id` | `uuid` |  Nullable |
| `status` | `enrollment_status` |  Nullable |
| `status_reason` | `text` |  Nullable |
| `final_grade` | `numeric` |  Nullable |
| `attendance_percentage` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `batch_id` | `uuid` |  Nullable |
| `order_number` | `int4` |  |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `format` | `session_format` |  |
| `scheduled_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `session_type` | `varchar` |  Nullable |
| `meeting_link` | `text` |  Nullable |
| `meeting_link_status` | `varchar` |  Nullable |
| `meeting_link_provider` | `varchar` |  Nullable |
| `status` | `text` |  Nullable |
| `start_time` | `time` |  Nullable |
| `end_time` | `time` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `ended_at` | `timestamptz` |  Nullable |

## Table `materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  Nullable |
| `title` | `varchar` |  |
| `type` | `material_type` |  |
| `content_url` | `text` |  |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `quizzes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  Nullable |
| `title` | `varchar` |  |
| `passing_grade` | `numeric` |  Nullable |
| `max_retries` | `int4` |  Nullable |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |
| `deadline` | `timestamptz` |  Nullable |

## Table `quiz_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `quiz_id` | `uuid` |  Nullable |
| `question_text` | `text` |  |
| `type` | `varchar` |  |
| `options` | `jsonb` |  Nullable |
| `correct_answer` | `text` |  |
| `order_number` | `int4` |  |

## Table `tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `deadline` | `timestamptz` |  |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |
| `is_final_project` | `bool` |  Nullable |

## Table `material_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `material_id` | `uuid` |  Nullable |
| `is_completed` | `bool` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `quiz_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `quiz_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `score` | `numeric` |  |
| `is_passed` | `bool` |  |
| `attempt_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `task_submissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `task_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `file_url` | `text` |  |
| `submitted_at` | `timestamptz` |  Nullable |
| `submission_type` | `varchar` |  |
| `feedback` | `text` |  Nullable |
| `feedback_by` | `uuid` |  Nullable |
| `feedback_at` | `timestamptz` |  Nullable |

## Table `manual_grades`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `enrollment_id` | `uuid` |  Nullable |
| `task_submission_id` | `uuid` |  Nullable |
| `component_name` | `varchar` |  |
| `score` | `numeric` |  |
| `weight_percentage` | `numeric` |  Nullable |
| `graded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `attendance_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  Nullable |
| `token` | `varchar` |  Unique |
| `expires_at` | `timestamptz` |  |
| `created_by` | `uuid` |  Nullable |

## Table `attendances`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `source` | `attendance_source` |  |
| `recorded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `certificates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `enrollment_id` | `uuid` |  Nullable Unique |
| `certificate_number` | `varchar` |  Unique |
| `verification_code` | `varchar` |  Unique |
| `pdf_url` | `text` |  |
| `issued_at` | `timestamptz` |  Nullable |
| `status` | `varchar` |  |
| `revoked_reason` | `text` |  Nullable |
| `revoked_by` | `uuid` |  Nullable |
| `revoked_at` | `timestamptz` |  Nullable |
| `manual_image_url` | `text` |  Nullable |

## Table `portfolios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable Unique |
| `portfolio_slug` | `varchar` |  Unique |
| `is_public` | `bool` |  Nullable |
| `display_preferences` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `bulk_import_jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `batch_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `status` | `varchar` |  |
| `log_details` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `action_type` | `varchar` |  |
| `entity_type` | `varchar` |  |
| `entity_id` | `uuid` |  |
| `old_values` | `jsonb` |  Nullable |
| `new_values` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `in_app_notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `title` | `varchar` |  |
| `message` | `text` |  |
| `action_url` | `text` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `batch_weight_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `batch_id` | `uuid` |  |
| `requested_by` | `uuid` |  |
| `proposed_quiz_weight` | `numeric` |  |
| `proposed_task_weight` | `numeric` |  |
| `status` | `weight_request_status` |  Nullable |
| `reason` | `text` |  Nullable |
| `resolved_by` | `uuid` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `program_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_id` | `uuid` |  |
| `order_number` | `int4` |  |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `format` | `session_format` |  |
| `created_at` | `timestamptz` |  Nullable |
| `order_index` | `int4` |  Nullable |

## Table `program_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_session_id` | `uuid` |  |
| `title` | `varchar` |  |
| `type` | `material_type` |  |
| `content_url` | `text` |  |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `program_quizzes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_session_id` | `uuid` |  |
| `title` | `varchar` |  |
| `passing_grade` | `numeric` |  Nullable |
| `max_retries` | `int4` |  Nullable |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `program_quiz_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_quiz_id` | `uuid` |  |
| `question_text` | `text` |  |
| `type` | `varchar` |  |
| `options` | `jsonb` |  Nullable |
| `correct_answer` | `text` |  |
| `order_number` | `int4` |  |

## Table `session_unlocks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `mentor_id` | `uuid` |  |
| `student_id` | `uuid` |  |
| `session_id` | `uuid` |  Nullable |
| `quiz_id` | `uuid` |  Nullable |
| `reason` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `program_tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `program_session_id` | `uuid` |  |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `order_number` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `chat_rooms`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `type` | `chat_room_type` |  |
| `name` | `text` |  Nullable |
| `batch_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `chat_participants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `room_id` | `uuid` | Primary |
| `user_id` | `uuid` | Primary |
| `joined_at` | `timestamptz` |  Nullable |
| `last_read_at` | `timestamptz` |  Nullable |

## Table `messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `room_id` | `uuid` |  Nullable |
| `sender_id` | `uuid` |  Nullable |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `portfolio_projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `project_url` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `batch_id` | `uuid` |  Nullable |
| `feedback` | `text` |  Nullable |
| `validated_by` | `uuid` |  Nullable |
| `validated_at` | `timestamptz` |  Nullable |
| `is_showcase` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `broadcasts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `subject` | `text` |  |
| `message` | `text` |  |
| `target` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  Nullable |

## Table `helpdesk_tickets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `subject` | `text` |  |
| `user_id` | `uuid` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `helpdesk_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ticket_id` | `uuid` |  |
| `sender_id` | `uuid` |  Nullable |
| `message` | `text` |  |
| `is_admin` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Custom Types / Enums

### `question_type`

`multiple_choice` | `true_false` | `short_answer`

### `user_role`

`admin` | `mentor` | `siswa`

### `enrollment_status`

`aktif` | `lulus` | `tidak lulus` | `mengundurkan diri` | `tidak_lulus` | `mengundurkan_diri`

### `session_format`

`online` | `offline`

### `material_type`

`video` | `pdf` | `link` | `slide` | `image` | `video_embed` | `zip` | `youtube`

### `attendance_source`

`qr` | `manual` | `qr_scan` | `manual_override` | `roll_call_online`

### `weight_request_status`

`pending` | `approved` | `rejected`

### `certificate_status`

`valid` | `revoked`

### `chat_room_type`

`direct` | `group`

## RLS Policies

### `sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `Public read materials` | SELECT | public | PERMISSIVE | `true` | — |

### `quizzes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `quiz_questions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `tasks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `material_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `quiz_attempts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `task_submissions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `manual_grades`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `attendance_tokens`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `attendances`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `Public read attendances` | SELECT | public | PERMISSIVE | `true` | — |

### `certificates`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `portfolios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `bulk_import_jobs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Pengguna boleh melihat data profilnya sendiri` | SELECT | public | PERMISSIVE | `(auth.uid() = id)` | — |
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `programs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `batches`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `batch_mentors`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `enrollments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `audit_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `in_app_notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `batch_weight_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `program_sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `program_materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `program_quizzes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `program_quiz_questions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `session_unlocks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `program_tasks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow select for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow insert for authenticated users` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow update for authenticated users` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `Allow delete for authenticated users` | DELETE | authenticated | PERMISSIVE | `true` | — |

### `chat_rooms`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view rooms they are in` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM chat_participants   WHERE ((chat_participants.room_id = chat_rooms.id) AND (chat_participants.user_id = auth.uid()))))` | — |
| `Users can create rooms` | INSERT | public | PERMISSIVE | — | `(auth.uid() IS NOT NULL)` |

### `chat_participants`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can add themselves to rooms (via server)` | INSERT | public | PERMISSIVE | — | `(auth.uid() IS NOT NULL)` |
| `Users can update their own last_read_at` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can view all participants` | SELECT | public | PERMISSIVE | `true` | — |

### `messages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read messages in their rooms` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM chat_participants   WHERE ((chat_participants.room_id = messages.room_id) AND (chat_participants.user_id = auth.uid()))))` | — |
| `Users can send messages to their rooms` | INSERT | public | PERMISSIVE | — | `((sender_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM chat_participants   WHERE ((chat_participants.room_id = messages.room_id) AND (chat_participants.user_id = auth.uid())))))` |

### `portfolio_projects`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view portfolio_projects` | SELECT | public | PERMISSIVE | `((auth.uid() = user_id) OR (is_showcase = true) OR (status = 'validated'::text) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ((users.role = 'mentor'::user_role) OR (users.role = 'admin'::user_role))))))` | — |
| `Users can create their own portfolio_projects` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can delete their draft portfolio_projects` | DELETE | public | PERMISSIVE | `((auth.uid() = user_id) AND (status = 'draft'::text))` | — |
| `Users can update their portfolio_projects` | UPDATE | public | PERMISSIVE | `((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ((users.role = 'mentor'::user_role) OR (users.role = 'admin'::user_role))))))` | — |

### `helpdesk_tickets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view their own tickets` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users can create tickets` | INSERT | public | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can update their own tickets` | UPDATE | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Admins have full access to tickets` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::user_role))))` | — |

### `broadcasts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can insert broadcasts` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::user_role))))` |
| `Admins can view broadcasts` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::user_role))))` | — |

### `helpdesk_messages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view messages for their tickets` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM helpdesk_tickets   WHERE ((helpdesk_tickets.id = helpdesk_messages.ticket_id) AND (helpdesk_tickets.user_id = auth.uid()))))` | — |
| `Users can create messages for their tickets` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM helpdesk_tickets   WHERE ((helpdesk_tickets.id = helpdesk_messages.ticket_id) AND (helpdesk_tickets.user_id = auth.uid()))))` |
| `Admins have full access to messages` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::user_role))))` | — |

