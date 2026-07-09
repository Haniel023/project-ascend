import { Crown, Dumbbell, Flame, Lock, Shield, Sparkles, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Sword> = {
  flame: Flame,
  sword: Sword,
  crown: Crown,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  shield: Shield,
};

export type AchievementBadgeData = {
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  unlockedAt: Date | null;
};

export function AchievementBadge({ achievement }: { achievement: AchievementBadgeData }) {
  const Icon = ICONS[achievement.iconKey] ?? Sparkles;
  const unlocked = achievement.unlockedAt != null;

  return (
    <div
      title={achievement.description}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
        unlocked ? "border-amber-400/30 bg-amber-400/10" : "border-white/10 bg-white/2 opacity-50"
      )}
    >
      <div className={cn("flex size-9 items-center justify-center rounded-full", unlocked ? "bg-amber-400/20 text-amber-300" : "bg-white/5 text-zinc-500")}>
        {unlocked ? <Icon className="size-4.5" /> : <Lock className="size-4" />}
      </div>
      <p className={cn("text-xs font-medium", unlocked ? "text-zinc-100" : "text-zinc-500")}>{achievement.title}</p>
    </div>
  );
}
