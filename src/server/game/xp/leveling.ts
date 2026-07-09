// Cumulative XP required to REACH a given level, starting from level 1 at 0 XP.
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.6));
}

export function levelForXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

export type XpProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

export function xpProgress(totalXp: number): XpProgress {
  const level = levelForXp(totalXp);
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  return {
    level,
    totalXp,
    xpIntoLevel: totalXp - currentLevelXp,
    xpForNextLevel: nextLevelXp - currentLevelXp,
  };
}
