// Pure sum-then-clamp math -- no framework or DB imports. Given the equipped rows for
// ONE bonus category (the caller has already filtered by category), returns the total
// active bonus, excluding unequipped or expired items and clamped at the category cap.
// `now` is an explicit param (not `new Date()` internally) so this stays deterministic
// and easy to test.

export type EquippedBonusRow = {
  bonusValue: number;
  isEquipped: boolean;
  expiresAt: Date | null;
};

export function resolveEquippedBonus(rows: EquippedBonusRow[], cap: number, now: Date = new Date()): number {
  const total = rows
    .filter((r) => r.isEquipped && (r.expiresAt == null || r.expiresAt > now))
    .reduce((sum, r) => sum + r.bonusValue, 0);
  return Math.min(total, cap);
}

// Per-category hard caps -- small and capped even for an all-Mythic loadout.
export const EQUIPMENT_BONUS_CAPS = {
  workout_xp: 0.15,
  quest_xp: 0.15,
  boss_damage: 0.15,
  recovery_score: 10,
} as const;
