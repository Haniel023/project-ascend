import Link from "next/link";
import { Skull, Sparkles, Swords } from "lucide-react";
import type { Rank } from "@/server/db/schema/enums";

export type DungeonCardData = {
  id: number;
  title: string;
  storyText: string;
  dayNameSnapshot: string;
  difficulty: Rank;
  estimatedXp: number;
  includesBossEncounter: boolean;
  isCompleted: boolean;
} | null;

const RANK_LABELS: Record<Rank, string> = {
  novice: "Novice",
  adept: "Adept",
  warrior: "Warrior",
  champion: "Champion",
  legend: "Legend",
};

export function DungeonCard({ dungeon }: { dungeon: DungeonCardData }) {
  if (!dungeon) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/2 p-5 text-center">
        <Swords className="mx-auto size-6 text-zinc-600" />
        <p className="mt-2 font-medium text-zinc-300">No dungeon available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Split your active plan into days to unlock a themed daily dungeon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {dungeon.isCompleted ? (
          <Skull className="size-5 text-emerald-400" />
        ) : (
          <Swords className="size-5 text-amber-400" />
        )}
        <div>
          <p className="font-semibold text-zinc-100">{dungeon.title}</p>
          <p className="text-xs text-muted-foreground">
            {RANK_LABELS[dungeon.difficulty]} -- Focus: {dungeon.dayNameSnapshot}
          </p>
        </div>
        {dungeon.isCompleted && (
          <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
            Cleared
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-zinc-400 italic">{dungeon.storyText}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="size-3.5 text-amber-400" /> ~{dungeon.estimatedXp} XP
        </span>
        {dungeon.includesBossEncounter && (
          <span className="flex items-center gap-1 text-red-300">
            <Swords className="size-3.5" /> Boss encounter
          </span>
        )}
      </div>
      {!dungeon.isCompleted && (
        <Link
          href="/dungeon"
          className="mt-3 block w-full rounded-lg bg-amber-400 py-2 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Enter Dungeon
        </Link>
      )}
    </div>
  );
}
