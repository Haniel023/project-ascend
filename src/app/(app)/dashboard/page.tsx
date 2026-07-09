import Link from "next/link";
import { Bell, Dumbbell, ListChecks, Sparkles, Trophy, TrendingUp, Medal, Gem } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { getLocalDateString, getLocalHour } from "@/lib/dates";
import { levelForXp, xpProgress } from "@/server/game/xp/leveling";
import { rankForLevel } from "@/server/game/xp/ranks";
import { getMuscleBalance, getWorkoutFrequency, getXpHistory, hasLoggedOnDate } from "@/server/queries/dashboardData";
import { getAchievementsForUser } from "@/server/queries/achievementsData";
import { ensureWeeklyBoss } from "@/server/game/bosses/bossService";
import { getTodayRecoveryCheckin } from "@/server/game/recovery/recoveryService";
import { getRecoveryTrend } from "@/server/queries/recoveryData";
import { ensureTodayDungeon } from "@/server/game/dungeons/dungeonService";
import { Card, CardContent } from "@/components/ui/card";
import { XpBar } from "@/components/rpg/XpBar";
import { RankBadge } from "@/components/rpg/RankBadge";
import { StreakBadge } from "@/components/rpg/StreakBadge";
import { MuscleBalanceRadar } from "@/components/rpg/MuscleBalanceRadar";
import { XpHistoryChart } from "@/components/rpg/XpHistoryChart";
import { WorkoutFrequencyChart } from "@/components/rpg/WorkoutFrequencyChart";
import { BossCard } from "@/components/rpg/BossCard";
import { AchievementBadge } from "@/components/rpg/AchievementBadge";
import { RecoveryCard } from "@/components/rpg/RecoveryCard";
import { RecoveryTrendChart } from "@/components/rpg/RecoveryTrendChart";
import { DungeonCard } from "@/components/rpg/DungeonCard";
import { NotificationsClient } from "@/components/pwa/NotificationsClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    xp?: string;
    leveledUp?: string;
    rankUp?: string;
    overloadEventId?: string;
    bossDefeated?: string;
    bossBonusXp?: string;
    achievementsUnlocked?: string;
    newPRs?: string;
    dungeonCleared?: string;
    lootDropped?: string;
    lootRarity?: string;
  }>;
}) {
  const { userId, session, profile } = await requireOnboardedProfile();
  const {
    xp,
    leveledUp,
    rankUp,
    overloadEventId,
    bossDefeated,
    bossBonusXp,
    achievementsUnlocked,
    newPRs,
    dungeonCleared,
    lootDropped,
  } = await searchParams;

  const today = getLocalDateString(profile.timezone);
  const progress = xpProgress(profile.totalXp);
  const rank = rankForLevel(levelForXp(profile.totalXp));

  const [
    muscleBalance7d,
    muscleBalance30d,
    xpHistory,
    frequency,
    boss,
    achievements,
    todayRecovery,
    recoveryTrend,
    loggedToday,
    dungeon,
  ] = await Promise.all([
    getMuscleBalance(userId, today, 7),
    getMuscleBalance(userId, today, 30),
    getXpHistory(userId, today, 30),
    getWorkoutFrequency(userId, today, 14),
    ensureWeeklyBoss(userId, profile.timezone),
    getAchievementsForUser(userId),
    getTodayRecoveryCheckin(userId, today),
    getRecoveryTrend(userId, today, 30),
    hasLoggedOnDate(userId, today),
    ensureTodayDungeon(userId, profile.timezone, today),
  ]);

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const isEvening = getLocalHour(profile.timezone) >= 18;
  const shouldNudgeLog = !loggedToday && isEvening;
  const shouldNudgeRecovery = !todayRecovery;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.displayName || session.user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every set moves your character forward.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ranks">
            <RankBadge rank={rank} />
          </Link>
          <StreakBadge currentStreak={profile.currentStreak} />
        </div>
      </div>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-5">
          <XpBar level={progress.level} xpIntoLevel={progress.xpIntoLevel} xpForNextLevel={progress.xpForNextLevel} />
        </CardContent>
      </Card>

      {xp && Number(xp) > 0 && (
        <Card className="mt-4 border-amber-400/40 bg-amber-400/10">
          <CardContent className="flex items-center gap-2 py-3 text-amber-200">
            <Sparkles className="size-4" />
            <span>+{xp} XP from your last workout{leveledUp === "true" ? " -- level up!" : ""}</span>
          </CardContent>
        </Card>
      )}

      {rankUp && overloadEventId && (
        <Card className="mt-3 border-violet-400/40 bg-violet-400/10">
          <CardContent className="flex items-center justify-between gap-2 py-3">
            <span className="flex items-center gap-2 text-violet-200">
              <TrendingUp className="size-4" />
              Rank up! You&apos;re now a {rankUp}.
            </span>
            <Link href={`/overload/${overloadEventId}`} className="text-sm font-medium text-violet-300 hover:underline">
              Review harder plan
            </Link>
          </CardContent>
        </Card>
      )}

      {bossDefeated && (
        <Card className="mt-3 border-emerald-400/40 bg-emerald-400/10">
          <CardContent className="flex items-center gap-2 py-3 text-emerald-200">
            <Trophy className="size-4" />
            <span>
              Boss defeated: {bossDefeated}! {bossBonusXp && `+${bossBonusXp} bonus XP`}
            </span>
          </CardContent>
        </Card>
      )}

      {achievementsUnlocked && (
        <Card className="mt-3 border-amber-400/40 bg-amber-400/10">
          <CardContent className="flex items-center gap-2 py-3 text-amber-200">
            <Trophy className="size-4" />
            <span>Achievement unlocked: {achievementsUnlocked.split(",").join(", ")}</span>
          </CardContent>
        </Card>
      )}

      {newPRs && (
        <Card className="mt-3 border-sky-400/40 bg-sky-400/10">
          <CardContent className="flex items-center gap-2 py-3 text-sky-200">
            <Medal className="size-4" />
            <span>New personal record: {newPRs.split(",").join(", ")}</span>
          </CardContent>
        </Card>
      )}

      {dungeonCleared && dungeon && (
        <Card className="mt-3 border-emerald-400/40 bg-emerald-400/10">
          <CardContent className="flex items-center gap-2 py-3 text-emerald-200">
            <Trophy className="size-4" />
            <span>Dungeon cleared: {dungeon.title}!</span>
          </CardContent>
        </Card>
      )}

      {lootDropped && (
        <Card className="mt-3 border-violet-400/40 bg-violet-400/10">
          <CardContent className="flex items-center justify-between gap-2 py-3">
            <span className="flex items-center gap-2 text-violet-200">
              <Gem className="size-4" />
              Loot found: {lootDropped.split(",").join(", ")}!
            </span>
            <Link href="/equipment" className="text-sm font-medium text-violet-300 hover:underline">
              View
            </Link>
          </CardContent>
        </Card>
      )}

      {shouldNudgeLog && (
        <Card className="mt-3 border-zinc-800 bg-zinc-900">
          <CardContent className="flex items-center justify-between gap-2 py-3">
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <Bell className="size-4 text-amber-400" />
              You haven&apos;t logged a workout today.
            </span>
            <Link href="/log" className="text-sm font-medium text-amber-300 hover:underline">
              Log now
            </Link>
          </CardContent>
        </Card>
      )}

      <NotificationsClient shouldNudgeLog={shouldNudgeLog} shouldNudgeRecovery={shouldNudgeRecovery} today={today} />

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Link
          href="/log"
          className="flex flex-col items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 transition-colors hover:border-amber-400/50"
        >
          <Dumbbell className="size-5 text-amber-400" />
          <span className="text-xs font-medium text-zinc-100">Log</span>
        </Link>
        <Link
          href="/quests"
          className="flex flex-col items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 transition-colors hover:border-amber-400/50"
        >
          <Sparkles className="size-5 text-amber-400" />
          <span className="text-xs font-medium text-zinc-100">Quests</span>
        </Link>
        <Link
          href="/plans"
          className="flex flex-col items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 transition-colors hover:border-amber-400/50"
        >
          <ListChecks className="size-5 text-amber-400" />
          <span className="text-xs font-medium text-zinc-100">Plans</span>
        </Link>
      </div>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">Today&apos;s Dungeon</h2>
          <DungeonCard dungeon={dungeon} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">Recovery</h2>
          <RecoveryCard checkin={todayRecovery ?? null} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">This Week&apos;s Boss</h2>
            <Link href="/bosses" className="text-xs text-muted-foreground hover:text-zinc-200">
              History
            </Link>
          </div>
          <BossCard boss={boss} />
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-4">
            <MuscleBalanceRadar data7d={muscleBalance7d} data30d={muscleBalance30d} />
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-4">
            <XpHistoryChart data={xpHistory} />
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-4">
            <WorkoutFrequencyChart data={frequency} />
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-4">
            <RecoveryTrendChart data={recoveryTrend} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Achievements</h2>
            <Link href="/profile" className="text-xs text-muted-foreground hover:text-zinc-200">
              {unlockedAchievements.length} / {achievements.length} unlocked
            </Link>
          </div>
          {unlockedAchievements.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No achievements unlocked yet -- keep training to earn your first badge.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {unlockedAchievements.slice(0, 5).map((a) => (
                <AchievementBadge key={a.slug} achievement={a} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
