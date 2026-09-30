-- =========================================================================
-- 1. UPDATE MARKETING_CONTENT (Hero Section)
-- =========================================================================

/* 
-- [BACKUP & ROLLBACK MARKETING_CONTENT]
UPDATE marketing_content mc
SET data = backup.data
FROM marketing_content_backup_20260929 backup
WHERE mc.id = backup.id AND mc.section_key = 'hero';
*/

-- [EKSEKUSI] Menghapus stats_students dan stats_rating, serta mengubah subheadline.
UPDATE marketing_content 
SET data = '{
  "badge": "Bootcamp Intensif Berstandar Industri",
  "cta_primary": "Lihat Program",
  "subheadline": "Belajar dari praktisi industri lewat video terstruktur. Paket Komplit menambahkan kelas LMS dan bimbingan mentor.",
  "cta_secondary": "Tanya via WhatsApp",
  "headline_line1": "Dari Pemula",
  "headline_line2": "ke Profesional",
  "headline_line3": "dalam 3 Bulan.",
  "stats_sessions": "Live Mentoring"
}'::jsonb
WHERE section_key = 'hero';


-- =========================================================================
-- 2. UPDATE MARKETING_PROGRAM_TIERS (Features)
-- =========================================================================

/*
-- [BACKUP & ROLLBACK MARKETING_PROGRAM_TIERS]
UPDATE marketing_program_tiers mpt
SET features = backup.features
FROM marketing_program_tiers_backup_20260929 backup
WHERE mpt.id = backup.id AND mpt.tier_type IN ('junior', 'expert');
*/

-- [EKSEKUSI] Menghapus klaim "Sertifikat Digital" sepenuhnya dari tier junior & expert.
UPDATE marketing_program_tiers
SET features = features - 'Sertifikat Digital'
WHERE tier_type IN ('junior', 'expert')
  AND features::text LIKE '%"Sertifikat Digital"%';

-- Note: Update untuk typo "Materu awal" saya hapus dari sini, menunggu konfirmasi teks yang benar.
