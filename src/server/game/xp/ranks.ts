import type { Rank } from "@/server/db/schema/enums";

// Ranks are thematic, but their boundaries are deliberately aligned to real
// resistance-training adaptation phases -- the fantasy layer tracks genuine progress.
export const RANK_BOUNDARIES: {
  rank: Rank;
  minLevel: number;
  maxLevel: number | null;
  realWorldAnalog: string;
}[] = [
  { rank: "novice", minLevel: 1, maxLevel: 5, realWorldAnalog: "Neural adaptation (first 4-8 weeks)" },
  { rank: "adept", minLevel: 6, maxLevel: 12, realWorldAnalog: "Early hypertrophy" },
  { rank: "warrior", minLevel: 13, maxLevel: 22, realWorldAnalog: "Hypertrophy & strength consolidation" },
  { rank: "champion", minLevel: 23, maxLevel: 35, realWorldAnalog: "Advanced strength & power" },
  { rank: "legend", minLevel: 36, maxLevel: null, realWorldAnalog: "Elite conditioning & mastery" },
];

export function rankForLevel(level: number): Rank {
  const match = RANK_BOUNDARIES.find(
    (b) => level >= b.minLevel && (b.maxLevel === null || level <= b.maxLevel)
  );
  return match?.rank ?? "legend";
}
