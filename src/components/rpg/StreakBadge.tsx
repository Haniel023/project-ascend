import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakBadge({ currentStreak }: { currentStreak: number }) {
  const active = currentStreak > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        active ? "border-orange-700 bg-orange-950 text-orange-300" : "border-white/15 bg-white/10 text-zinc-400"
      )}
    >
      <Flame className={cn("size-4", active && "fill-orange-400")} />
      {currentStreak} day{currentStreak === 1 ? "" : "s"}
    </span>
  );
}
