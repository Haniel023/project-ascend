import { describe, expect, it } from "vitest";
import { rankForLevel } from "../xp/ranks";

describe("rankForLevel", () => {
  it.each([
    [1, "novice"],
    [5, "novice"],
    [6, "adept"],
    [12, "adept"],
    [13, "warrior"],
    [22, "warrior"],
    [23, "champion"],
    [35, "champion"],
    [36, "legend"],
    [100, "legend"],
  ])("level %i -> %s", (level, expected) => {
    expect(rankForLevel(level)).toBe(expected);
  });
});
