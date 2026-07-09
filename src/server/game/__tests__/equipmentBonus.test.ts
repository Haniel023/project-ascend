import { describe, expect, it } from "vitest";
import { resolveEquippedBonus, type EquippedBonusRow } from "../equipment/equipmentBonus";

const NOW = new Date("2026-01-15T00:00:00Z");
const FUTURE = new Date("2026-01-20T00:00:00Z");
const PAST = new Date("2026-01-10T00:00:00Z");

describe("resolveEquippedBonus", () => {
  it("sums bonuses from equipped, unexpired rows", () => {
    const rows: EquippedBonusRow[] = [
      { bonusValue: 0.02, isEquipped: true, expiresAt: FUTURE },
      { bonusValue: 0.03, isEquipped: true, expiresAt: FUTURE },
    ];
    expect(resolveEquippedBonus(rows, 0.15, NOW)).toBeCloseTo(0.05);
  });

  it("excludes unequipped rows even if not expired", () => {
    const rows: EquippedBonusRow[] = [
      { bonusValue: 0.05, isEquipped: false, expiresAt: FUTURE },
      { bonusValue: 0.02, isEquipped: true, expiresAt: FUTURE },
    ];
    expect(resolveEquippedBonus(rows, 0.15, NOW)).toBeCloseTo(0.02);
  });

  it("excludes expired rows", () => {
    const rows: EquippedBonusRow[] = [
      { bonusValue: 0.05, isEquipped: true, expiresAt: PAST },
      { bonusValue: 0.02, isEquipped: true, expiresAt: FUTURE },
    ];
    expect(resolveEquippedBonus(rows, 0.15, NOW)).toBeCloseTo(0.02);
  });

  it("includes never-expiring (Mythic, expiresAt: null) rows regardless of how old they are", () => {
    const rows: EquippedBonusRow[] = [{ bonusValue: 0.07, isEquipped: true, expiresAt: null }];
    // Even evaluated far in the future, a null expiresAt never excludes the row.
    expect(resolveEquippedBonus(rows, 0.15, new Date("2030-01-01"))).toBeCloseTo(0.07);
  });

  it("clamps the total at the supplied cap", () => {
    const rows: EquippedBonusRow[] = [
      { bonusValue: 0.07, isEquipped: true, expiresAt: null },
      { bonusValue: 0.07, isEquipped: true, expiresAt: null },
      { bonusValue: 0.07, isEquipped: true, expiresAt: null },
    ];
    expect(resolveEquippedBonus(rows, 0.15, NOW)).toBe(0.15);
  });

  it("returns 0 for no rows", () => {
    expect(resolveEquippedBonus([], 0.15, NOW)).toBe(0);
  });

  it("treats expiresAt exactly equal to now as expired", () => {
    const rows: EquippedBonusRow[] = [{ bonusValue: 0.05, isEquipped: true, expiresAt: NOW }];
    expect(resolveEquippedBonus(rows, 0.15, NOW)).toBe(0);
  });
});
