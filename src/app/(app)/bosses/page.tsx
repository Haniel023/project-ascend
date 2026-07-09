import Link from "next/link";
import { ChevronLeft, Skull, Swords } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { getWeekStartDate } from "@/lib/dates";
import { ensureWeeklyBoss } from "@/server/game/bosses/bossService";
import { getBossHistory } from "@/server/queries/bossData";
import { Card, CardContent } from "@/components/ui/card";
import { BossCard } from "@/components/rpg/BossCard";

export default async function BossHistoryPage() {
  const { userId, profile } = await requireOnboardedProfile();
  const currentWeekStart = getWeekStartDate(profile.timezone);

  const [currentBoss, history] = await Promise.all([
    ensureWeeklyBoss(userId, profile.timezone),
    getBossHistory(userId),
  ]);

  const pastWeeks = history.filter((b) => b.weekStartDate !== currentWeekStart);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
        <ChevronLeft className="size-3.5" /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Boss History</h1>

      <Card className="mt-4 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">This Week</h2>
          <BossCard boss={currentBoss} />
        </CardContent>
      </Card>

      <h2 className="mt-6 text-sm font-semibold tracking-wide text-zinc-400 uppercase">Past Weeks</h2>
      {pastWeeks.length === 0 ? (
        <Card className="mt-3 border-zinc-800 bg-zinc-900">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No past boss fights yet -- keep training week over week to build a history.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {pastWeeks.map((b) => (
            <Card key={b.id} className="border-zinc-800 bg-zinc-900">
              <CardContent className="flex items-center gap-3 py-3">
                {b.isDefeated ? (
                  <Skull className="size-5 shrink-0 text-emerald-400" />
                ) : (
                  <Swords className="size-5 shrink-0 text-zinc-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Week of {b.weekStartDate} -- Focus: {b.dayNameSnapshot}
                  </p>
                </div>
                <div className="text-right text-xs">
                  {b.isDefeated ? (
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 font-medium text-emerald-300">
                      Defeated
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {b.currentProgress} / {b.requiredSets} sets
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
