-- ==========================================
-- MIGRATION: UPDATE MARKETING CONTENT PHASE 2
-- ==========================================
-- Script ini membuat backup dan menerapkan pembaruan teks.

-- 1. Buat tabel backup jika belum ada (Bisa digunakan untuk rollback)
CREATE TABLE IF NOT EXISTS marketing_content_backup_phase2 AS SELECT * FROM marketing_content;
CREATE TABLE IF NOT EXISTS marketing_program_tiers_backup_phase2 AS SELECT * FROM marketing_program_tiers;

-- 2. Update marketing_content menggunakan INSERT ... ON CONFLICT
INSERT INTO marketing_content (section_key, label, data)
VALUES 
(
  'hero', 
  'Hero Section', 
  '{
    "headline": "Bangun Karir IT Pertamamu dengan Portofolio Nyata.",
    "subheadline": "Belajar coding dari mentor praktisi. Kerjakan proyek sungguhan dan persiapkan dirimu untuk menembus seleksi kerja di industri teknologi.",
    "ctaPrimaryText": "Lihat Pilihan Paket",
    "ctaSecondaryText": "Lihat Story",
    "microcopy": "Akses dibuka setelah pembayaran dikonfirmasi admin."
  }'::jsonb
),
(
  'use_cases',
  'Story Section',
  '{
    "headline": "Teori Saja Seringkali Belum Cukup untuk Melamar Kerja.",
    "subheadline": ""
  }'::jsonb
),
(
  'final_cta',
  'Final CTA Section',
  '{
    "headline": "Berhenti Ragu, Mulai Langkah Pertamamu Hari Ini.",
    "subheadline": "Sekarang giliranmu untuk upgrade skill dan bangun portofolio profesional bersama E17 Course.",
    "ctaPrimaryText": "Daftar Sekarang",
    "ctaSecondaryText": "Konsultasi Gratis",
    "riskReducer": "Masih bingung paket mana yang cocok? Hubungi tim kami untuk rekomendasi gratis tanpa komitmen."
  }'::jsonb
),
(
  'whatsapp',
  'WhatsApp FAB',
  '{
    "phone": "6280000000000",
    "message": "Halo Tim E17, saya masih pemula dan ingin konsultasi paket mana yang paling cocok untuk tujuan belajar saya. Bisa dibantu?",
    "tooltip": "Butuh bantuan memilih paket?"
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE 
SET data = EXCLUDED.data;

-- 3. Update marketing_program_tiers
UPDATE marketing_program_tiers
SET description = 'Pahami dasar fundamentalnya dari nol. Cocok untuk perkenalan awal sebelum mendalami materi kompleks.',
    features = '["Akses video materi level Junior (6 bulan)", "Belajar mandiri kapan saja"]'::jsonb
WHERE tier_type = 'junior';

UPDATE marketing_program_tiers
SET description = 'Kuasai materi lanjutan untuk mulai membuat aplikasi fungsional secara mandiri.',
    features = '["Akses video materi level Expert (6 bulan)", "Belajar mandiri kapan saja"]'::jsonb
WHERE tier_type = 'expert';

UPDATE marketing_program_tiers
SET description = 'Paket intensif dengan bimbingan mentor untuk membantu mempersiapkan dirimu menembus dunia kerja.',
    features = '["Semua rekaman video (1 tahun)", "Kelas bootcamp LMS E17", "Bimbingan mentor", "Pembuatan portofolio"]'::jsonb
WHERE tier_type = 'complete';

-- ==========================================
-- ROLLBACK SCRIPT (JANGAN DIJALANKAN, HANYA REFERENSI)
-- ==========================================
/*
-- Kembalikan data marketing_content dari backup
UPDATE marketing_content m
SET data = b.data
FROM marketing_content_backup_phase2 b
WHERE m.section_key = b.section_key;

-- Kembalikan data marketing_program_tiers dari backup
UPDATE marketing_program_tiers m
SET description = b.description,
    features = b.features
FROM marketing_program_tiers_backup_phase2 b
WHERE m.id = b.id;

-- Hapus tabel backup jika diinginkan
-- DROP TABLE marketing_content_backup_phase2;
-- DROP TABLE marketing_program_tiers_backup_phase2;
*/
