"use client";

import { motion } from "motion/react";

export function XpBar({
  level,
  xpIntoLevel,
  xpForNextLevel,
}: {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}) {
  const pct = xpForNextLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-zinc-100">Level {level}</span>
        <span className="text-muted-foreground">
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-amber-500 to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
