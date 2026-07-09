import { Crown, Flame, Shield, Sparkles, Sword } from "lucide-react";
import type { Rank } from "@/server/db/schema/enums";
import { cn } from "@/lib/utils";

export const RANK_META: Record<Rank, { label: string; icon: typeof Sword; className: string }> = {
  novice: { label: "Novice", icon: Shield, className: "border-white/20 bg-white/10 text-zinc-200" },
  adept: { label: "Adept", icon: Sword, className: "border-sky-700 bg-sky-950 text-sky-300" },
  warrior: { label: "Warrior", icon: Flame, className: "border-orange-700 bg-orange-950 text-orange-300" },
  champion: { label: "Champion", icon: Crown, className: "border-amber-600 bg-amber-950 text-amber-300" },
  legend: { label: "Legend", icon: Sparkles, className: "border-violet-600 bg-violet-950 text-violet-300" },
};

export function RankBadge({ rank, size = "md" }: { rank: Rank; size?: "sm" | "md" }) {
  const meta = RANK_META[rank];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        meta.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-4"} />
      {meta.label}
    </span>
  );
}
