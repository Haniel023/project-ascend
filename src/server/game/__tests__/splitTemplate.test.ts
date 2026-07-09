import { describe, expect, it } from "vitest";
import { getSplitTemplate } from "../onboarding/splitTemplate";

const ALL_GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core", "glutes", "calves"].sort();

describe("getSplitTemplate", () => {
  it("returns no split for 1-2 days/week", () => {
    expect(getSplitTemplate(1)).toEqual([]);
    expect(getSplitTemplate(2)).toEqual([]);
  });

  it.each([3, 4, 5, 6, 7])("covers every muscle group exactly once for %i days/week", (days) => {
    const template = getSplitTemplate(days);
    const allSlugs = template.flatMap((d) => d.muscleGroupSlugs);
    expect(allSlugs.sort()).toEqual(ALL_GROUPS);
    expect(new Set(allSlugs).size).toBe(allSlugs.length); // no duplicates across days
  });

  it.each([3, 4, 5, 6])("produces exactly %i days for %i days/week", (days) => {
    expect(getSplitTemplate(days)).toHaveLength(days);
  });
});
