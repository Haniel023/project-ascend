"use client";

import { motion } from "motion/react";
import { Skull, Swords } from "lucide-react";

export type BossCardData = {
  title: string;
  dayNameSnapshot: string;
  currentProgress: number;
  requiredSets: number;
  isDefeated: boolean;
};

export function BossCard({ boss }: { boss: BossCardData | null }) {
  if (!boss) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/2 p-5 text-center">
        <Swords className="mx-auto size-6 text-zinc-600" />
        <p className="mt-2 font-medium text-zinc-300">No boss this week</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Split your active plan into days to unlock weekly boss fights.
        </p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((boss.currentProgress / boss.requiredSets) * 100));

  return (
    <div className={boss.isDefeated ? "opacity-80" : ""}>
      <div className="flex items-center gap-2">
        {boss.isDefeated ? (
          <Skull className="size-5 text-emerald-400" />
        ) : (
          <Swords className="size-5 text-red-400" />
        )}
        <div>
          <p className="font-semibold text-zinc-100">{boss.title}</p>
          <p className="text-xs text-muted-foreground">Focus: {boss.dayNameSnapshot}</p>
        </div>
        {boss.isDefeated && (
          <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
            Defeated
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>Damage dealt</span>
          <span>
            {boss.currentProgress} / {boss.requiredSets} sets
          </span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className={
              boss.isDefeated
                ? "h-full rounded-full bg-emerald-500"
                : "h-full rounded-full bg-linear-to-r from-red-600 to-red-400"
            }
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
