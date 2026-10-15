/**
 * src/lib/access-tier.ts
 * Pure configuration & helper module for LMS E17 tier system.
 * DILARANG mengimpor modul server-only, Supabase, atau admin client di file ini.
 * File ini aman diimpor oleh client component (seperti Sidebar).
 */

export type Tier = 'junior' | 'expert' | 'complete' | 'bootcamp';

export type Capability =
  | 'video_materi'
  | 'live_session'
  | 'bnsp_exam'
  | 'bnsp_certificate'
  | 'bootcamp_full';

export type CapabilityAccess = 'granted' | 'locked' | 'hidden';

export type TierConfig = Record<Capability, CapabilityAccess>;

// Hirarki level untuk penentuan resolusi tier tertinggi
export const TIER_RANK: Record<Tier, number> = {
  junior: 1,
  expert: 2,
  complete: 3,
  bootcamp: 4,
};

// Label resmi sesuai marketing_program_tiers
export const TIER_LABELS: Record<Tier, string> = {
  junior: 'Self Paced',
  expert: 'Mentoring Plus',
  complete: 'Pro Bootcamp (BNSP)',
  bootcamp: 'Bootcamp (Kelas Penuh)',
};

// Matriks Hak Akses Utama
export const TIER_MATRIX: Record<Tier, TierConfig> = {
  junior: {
    video_materi: 'granted',
    live_session: 'hidden',
    bnsp_exam: 'hidden',
    bnsp_certificate: 'hidden',
    bootcamp_full: 'hidden',
  },
  expert: {
    video_materi: 'granted',
    live_session: 'granted',
    bnsp_exam: 'locked',        // Tampil dengan gembok & tombol upgrade
    bnsp_certificate: 'locked',
    bootcamp_full: 'hidden',
  },
  complete: {
    video_materi: 'granted',
    live_session: 'granted',
    bnsp_exam: 'granted',
    bnsp_certificate: 'granted',
    bootcamp_full: 'hidden',
  },
  bootcamp: {
    video_materi: 'granted',
    live_session: 'granted',
    bnsp_exam: 'granted',
    bnsp_certificate: 'granted',
    bootcamp_full: 'granted',
  },
};

export function getCapabilityAccess(tier: Tier, cap: Capability): CapabilityAccess {
  return TIER_MATRIX[tier]?.[cap] ?? 'hidden';
}

export function hasCapability(tier: Tier, cap: Capability): boolean {
  return getCapabilityAccess(tier, cap) === 'granted';
}

export function isLocked(tier: Tier, cap: Capability): boolean {
  return getCapabilityAccess(tier, cap) === 'locked';
}

export function isHidden(tier: Tier, cap: Capability): boolean {
  return getCapabilityAccess(tier, cap) === 'hidden';
}

export function isEqualOrHigher(tierA: Tier, tierB: Tier): boolean {
  return TIER_RANK[tierA] >= TIER_RANK[tierB];
}

/**
 * Memilih tier dengan rank tertinggi dari kumpulan tier.
 * Digunakan saat siswa memiliki lebih dari satu enrollment aktif (misal di sidebar/layout).
 */
export function getHighestTier(tiers: (Tier | string | null | undefined)[]): Tier {
  let highestTier: Tier = 'junior';
  for (const t of tiers) {
    if (!t) continue;
    const normalized = t.toLowerCase() as Tier;
    if (normalized in TIER_RANK) {
      if (TIER_RANK[normalized] > TIER_RANK[highestTier]) {
        highestTier = normalized;
      }
    }
  }
  return highestTier;
}

/**
 * Memetakan tier pembelian menjadi tier akses video.
 * 'complete' dan 'bootcamp' mendapatkan akses video level 'expert'.
 * Selain itu (mis. 'junior', 'expert') tetap sesuai nilai aslinya.
 */
export function getVideoTier(tier: Tier | string): string {
  if (tier === 'complete' || tier === 'bootcamp') {
    return 'expert';
  }
  return tier;
}

/**
 * Menentukan apakah tier memerlukan enrollment ke batch LMS aktif.
 * 'expert', 'complete', dan 'bootcamp' bernilai true; 'junior' bernilai false.
 */
export function requiresEnrollment(tier: Tier | string): boolean {
  return tier === 'expert' || tier === 'complete' || tier === 'bootcamp';
}

