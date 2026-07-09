import { describe, expect, it } from "vitest";
import { getRequiredSetsForRank } from "../bosses/bossScaling";
import { pickBossName } from "../bosses/bossNames";
import type { Rank } from "@/server/db/schema/enums";

describe("getRequiredSetsForRank", () => {
  it("increases monotonically with rank", () => {
    const ranks: Rank[] = ["novice", "adept", "warrior", "champion", "legend"];
    const targets = ranks.map(getRequiredSetsForRank);
    for (let i = 1; i < targets.length; i++) {
      expect(targets[i]).toBeGreaterThan(targets[i - 1]);
    }
  });
});

describe("pickBossName", () => {
  it("is deterministic for the same user and week", () => {
    const a = pickBossName("user-1", "2026-01-05");
    const b = pickBossName("user-1", "2026-01-05");
    expect(a).toBe(b);
  });

  it("can differ across weeks or users", () => {
    const names = new Set([
      pickBossName("user-1", "2026-01-05"),
      pickBossName("user-1", "2026-01-12"),
      pickBossName("user-2", "2026-01-05"),
    ]);
    expect(names.size).toBeGreaterThan(1);
  });
});
