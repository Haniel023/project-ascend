import { describe, expect, it } from "vitest";
import { pickWeightedIndex } from "../shared/seededRandom";
import { rollDungeonDropChance, rollRarity } from "../equipment/lootDrop";

describe("pickWeightedIndex", () => {
  it("is deterministic -- same key always returns the same index", () => {
    const a = pickWeightedIndex("user-1:2026-01-01:loot", [45, 35, 15, 4, 1]);
    const b = pickWeightedIndex("user-1:2026-01-01:loot", [45, 35, 15, 4, 1]);
    expect(a).toBe(b);
  });

  it("always returns a valid index in range", () => {
    for (let i = 0; i < 200; i++) {
      const index = pickWeightedIndex(`key-${i}`, [45, 35, 15, 4, 1]);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(5);
    }
  });

  it("respects weighting over a large sample, within a wide tolerance", () => {
    const counts = [0, 0, 0, 0, 0];
    const trials = 5000;
    for (let i = 0; i < trials; i++) {
      counts[pickWeightedIndex(`sample-${i}`, [45, 35, 15, 4, 1])]++;
    }
    // Loose tolerance bands (target 45/35/15/4/1 %) to avoid flakiness while still
    // catching a badly broken weighting (e.g. uniform instead of weighted).
    expect(counts[0] / trials).toBeGreaterThan(0.35);
    expect(counts[0] / trials).toBeLessThan(0.55);
    expect(counts[4] / trials).toBeLessThan(0.05);
  });

  it("returns index 0 for a single-weight array", () => {
    expect(pickWeightedIndex("any-key", [1])).toBe(0);
  });
});

describe("rollRarity", () => {
  it("is deterministic per key", () => {
    expect(rollRarity("user-1:dungeon-9")).toBe(rollRarity("user-1:dungeon-9"));
  });

  it("only ever returns a valid rarity", () => {
    const valid = new Set(["common", "uncommon", "rare", "epic", "mythic"]);
    for (let i = 0; i < 100; i++) {
      expect(valid.has(rollRarity(`k-${i}`))).toBe(true);
    }
  });
});

describe("rollDungeonDropChance", () => {
  it("is deterministic per key", () => {
    expect(rollDungeonDropChance("user-1:dungeon-9")).toBe(rollDungeonDropChance("user-1:dungeon-9"));
  });

  it("drops roughly 40% of the time over a large sample", () => {
    let drops = 0;
    const trials = 5000;
    for (let i = 0; i < trials; i++) {
      if (rollDungeonDropChance(`k-${i}`)) drops++;
    }
    expect(drops / trials).toBeGreaterThan(0.3);
    expect(drops / trials).toBeLessThan(0.5);
  });
});
