import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { xpProgress } from "@/server/game/xp/leveling";
import { rankForLevel, RANK_BOUNDARIES } from "@/server/game/xp/ranks";
import { RANK_META } from "@/components/rpg/RankBadge";
import { Card, CardContent } from "@/components/ui/card";

const RANK_FLAVOR: Record<string, string> = {
  novice: "Your body is still learning the movements. Every session builds the neural pathways that make lifting feel natural.",
  adept: "Coordination has clicked -- now the muscle itself starts adapting. Growth becomes visible, not just felt.",
  warrior: "The easy gains are behind you. This is where consistency and smart progression separate the committed from the rest.",
  champion: "Advanced strength and power. Programming gets more deliberate -- deloads and periodization start to matter.",
  legend: "Elite conditioning and mastery. From here, it's about longevity, refinement, and staying sharp for the long haul.",
};

export default async function RanksPage() {
  const { profile } = await requireOnboardedProfile();
  const progress = xpProgress(profile.totalXp);
  const currentRank = rankForLevel(progress.level);

  // Displayed top (Legend) to bottom (Novice) -- a mountain to climb.
  const ranksDescending = [...RANK_BOUNDARIES].reverse();

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href="/profile" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-200">
        <ArrowLeft className="size-4" /> Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold">The Path to Legend</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your rank climbs as you level up, and each rank roughly tracks a real phase of
        training adaptation -- the fantasy is just a skin on genuine progress.
      </p>

      <div className="relative mt-8 space-y-4">
        <div className="absolute top-2 bottom-2 left-6 w-px bg-white/10" aria-hidden />

        {ranksDescending.map((boundary) => {
          const meta = RANK_META[boundary.rank];
          const Icon = meta.icon;
          const isCurrent = boundary.rank === currentRank;
          const isAchieved = progress.level >= boundary.minLevel;

          return (
            <div key={boundary.rank} className="relative flex gap-4 pl-0">
              <div
                className={
                  "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 " +
                  (isCurrent
                    ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                    : isAchieved
                      ? "border-white/30 bg-white/10 text-zinc-200"
                      : "border-white/10 bg-black/40 text-zinc-600")
                }
              >
                <Icon className="size-5" />
              </div>

              <Card
                className={
                  "flex-1 " +
                  (isCurrent
                    ? "border-amber-400/50 bg-amber-400/10"
                    : isAchieved
                      ? "border-zinc-800 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-950 opacity-60")
                }
              >
                <CardContent className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h2 className="font-semibold text-zinc-100">{meta.label}</h2>
                    <span className="text-xs text-muted-foreground">
                      {boundary.maxLevel ? `Levels ${boundary.minLevel}-${boundary.maxLevel}` : `Level ${boundary.minLevel}+`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-zinc-400 italic">{boundary.realWorldAnalog}</p>
                  <p className="mt-1.5 text-sm text-zinc-300">{RANK_FLAVOR[boundary.rank]}</p>
                  {isCurrent && (
                    <p className="mt-2 text-xs font-medium text-amber-300">
                      You are here -- level {progress.level}, {progress.xpIntoLevel}/{progress.xpForNextLevel} XP to next level
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
