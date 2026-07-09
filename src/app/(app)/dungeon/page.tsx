import Link from "next/link";
import { ChevronLeft, Skull, Sparkles, Swords } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { getLocalDateString } from "@/lib/dates";
import { ensureTodayDungeon } from "@/server/game/dungeons/dungeonService";
import { db } from "@/server/db/client";
import { dailyQuestInstances } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Rank } from "@/server/db/schema/enums";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RANK_LABELS: Record<Rank, string> = {
  novice: "Novice",
  adept: "Adept",
  warrior: "Warrior",
  champion: "Champion",
  legend: "Legend",
};

export default async function DungeonPage() {
  const { userId, profile } = await requireOnboardedProfile();
  const today = getLocalDateString(profile.timezone);

  const dungeon = await ensureTodayDungeon(userId, profile.timezone, today);

  if (!dungeon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
          <ChevronLeft className="size-3.5" /> Back to dashboard
        </Link>
        <Card className="mt-4 border-zinc-800 bg-zinc-900">
          <CardContent className="py-8 text-center">
            <Swords className="mx-auto size-8 text-zinc-600" />
            <p className="mt-3 font-medium text-zinc-200">No dungeon available today</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dungeons are generated from an active plan split into days. Set one up, or just log a workout directly.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button asChild variant="outline">
                <Link href="/plans">Manage plans</Link>
              </Button>
              <Button asChild>
                <Link href="/log">Log a workout</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quest = dungeon.questInstanceId
    ? await db.query.dailyQuestInstances.findFirst({
        where: eq(dailyQuestInstances.id, dungeon.questInstanceId),
        with: { questTemplate: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
        <ChevronLeft className="size-3.5" /> Back to dashboard
      </Link>

      <div className="mt-4 flex items-center gap-2">
        {dungeon.isCompleted ? (
          <Skull className="size-6 text-emerald-400" />
        ) : (
          <Swords className="size-6 text-amber-400" />
        )}
        <h1 className="text-2xl font-bold">{dungeon.title}</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {RANK_LABELS[dungeon.difficulty]} dungeon -- Focus: {dungeon.dayNameSnapshot}
      </p>

      <Card className="mt-4 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <p className="text-sm text-zinc-300 italic">{dungeon.storyText}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="size-4" /> ~{dungeon.estimatedXp} estimated XP
            </span>
            {dungeon.includesBossEncounter && (
              <span className="flex items-center gap-1.5 text-red-300">
                <Swords className="size-4" /> Counts toward this week&apos;s boss
              </span>
            )}
          </div>

          {quest && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">Bonus objective</p>
              <p className="mt-1 text-sm font-medium text-zinc-100">{quest.questTemplate.title}</p>
              <p className="text-xs text-muted-foreground">{quest.questTemplate.description}</p>
              {quest.status === "completed" && (
                <p className="mt-1 text-xs font-medium text-emerald-400">Completed</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {dungeon.isCompleted ? (
        <Card className="mt-4 border-emerald-400/40 bg-emerald-400/10">
          <CardContent className="py-4 text-center text-emerald-200">
            Dungeon cleared! Come back tomorrow for a new one.
          </CardContent>
        </Card>
      ) : (
        <Button asChild size="lg" className="mt-4 w-full">
          <Link href={`/log?dungeonRunId=${dungeon.id}`}>Enter Dungeon</Link>
        </Button>
      )}
    </div>
  );
}
