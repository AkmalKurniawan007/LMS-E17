export type MarketingTier = 'junior' | 'expert' | 'complete';
export type AccessTier = 'junior' | 'expert' | 'complete';

/**
 * Maps a tier name from the marketing database (`marketing_program_tiers`) 
 * to the actual access tier used by the LMS system (`user_package_access`).
 * 
 * Always use this function when transitioning a user from Marketing/Checkout
 * into an enrolled student to prevent future schema mismatches.
 */
export function mapMarketingTierToAccessTier(marketingTier: string): AccessTier {
  const mapping: Record<string, AccessTier> = {
    'junior': 'junior',
    'expert': 'expert',
    'complete': 'complete',
    // Fallback for old hardcoded values just in case
    'bootcamp': 'complete', 
  };

  const normalized = (marketingTier || '').trim().toLowerCase();
  const mapped = mapping[normalized];
  
  if (!mapped) {
    console.warn(`[Tier Mapping] Unknown marketing tier: "${marketingTier}", defaulting to junior`);
    return 'junior'; // Safe fallback
  }
  
  return mapped;
}
