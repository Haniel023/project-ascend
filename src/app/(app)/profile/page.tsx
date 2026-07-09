import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { getLocalDateString } from "@/lib/dates";
import { xpProgress } from "@/server/game/xp/leveling";
import { rankForLevel } from "@/server/game/xp/ranks";
import { getMuscleBalance } from "@/server/queries/dashboardData";
import { getAchievementsForUser } from "@/server/queries/achievementsData";
import { getBodyStatsHistory } from "@/server/queries/recordsData";
import { Card, CardContent } from "@/components/ui/card";
import { XpBar } from "@/components/rpg/XpBar";
import { RankBadge } from "@/components/rpg/RankBadge";
import { StreakBadge } from "@/components/rpg/StreakBadge";
import { MuscleBalanceRadar } from "@/components/rpg/MuscleBalanceRadar";
import { AchievementBadge } from "@/components/rpg/AchievementBadge";
import { BodyStatsChart } from "@/components/rpg/BodyStatsChart";
import { HERO_CLASSES, FITNESS_LEVELS, PRIMARY_GOAL_OPTIONS } from "../onboarding/onboarding-data";
import { EditProfileDialog } from "./edit-profile-dialog";

export default async function ProfilePage() {
  const { userId, profile } = await requireOnboardedProfile();
  const today = getLocalDateString(profile.timezone);

  const [balance7d, balance30d, achievements, bodyStatsHistory] = await Promise.all([
    getMuscleBalance(userId, today, 7),
    getMuscleBalance(userId, today, 30),
    getAchievementsForUser(userId),
    getBodyStatsHistory(userId, today, 90),
  ]);

  const progress = xpProgress(profile.totalXp);
  const rank = rankForLevel(progress.level);
  const heroClass = HERO_CLASSES.find((c) => c.key === profile.avatarKey);
  const Icon = heroClass?.icon;
  const levelLabel = FITNESS_LEVELS.find((l) => l.key === profile.startingFitnessLevel)?.label;
  const goalLabel = PRIMARY_GOAL_OPTIONS.find((g) => g.key === profile.primaryGoal)?.label;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
            {Icon && <Icon className="size-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-muted-foreground">{heroClass?.label ?? "Adventurer"}</p>
          </div>
        </div>
        <EditProfileDialog
          displayName={profile.displayName}
          avatarKey={profile.avatarKey}
          heightCm={profile.heightCm}
          weightKg={profile.weightKg}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <RankBadge rank={rank} />
        <StreakBadge currentStreak={profile.currentStreak} />
        <div className="ml-auto flex items-center gap-3">
          <Link href="/equipment" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
            Equipment <ChevronRight className="size-3.5" />
          </Link>
          <Link href="/ranks" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
            View ranks <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <Card className="mt-4 border-zinc-800 bg-zinc-900">
        <CardContent className="py-5">
          <XpBar level={progress.level} xpIntoLevel={progress.xpIntoLevel} xpForNextLevel={progress.xpForNextLevel} />
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Height", profile.heightCm ? `${profile.heightCm} cm` : "--"],
          ["Weight", profile.weightKg ? `${profile.weightKg} kg` : "--"],
          ["Longest streak", `${profile.longestStreak}d`],
          ["Total XP", profile.totalXp],
        ].map(([label, value]) => (
          <Card key={label} className="border-zinc-800 bg-zinc-900">
            <CardContent className="py-3 text-center">
              <p className="text-lg font-bold text-zinc-100">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {levelLabel && (
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="py-3 text-center">
              <p className="text-sm font-semibold text-zinc-100">{levelLabel}</p>
              <p className="text-xs text-muted-foreground">Origin</p>
            </CardContent>
          </Card>
        )}
        {goalLabel && (
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="py-3 text-center">
              <p className="text-sm font-semibold text-zinc-100">{goalLabel}</p>
              <p className="text-xs text-muted-foreground">Path</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-3 text-center">
            <p className="text-sm font-semibold text-zinc-100">{profile.daysPerWeekTarget ?? "--"} / week</p>
            <p className="text-xs text-muted-foreground">Tempo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <MuscleBalanceRadar data7d={balance7d} data30d={balance30d} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <BodyStatsChart data={bodyStatsHistory} />
          <Link
            href="/progress"
            className="mt-3 flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200"
          >
            View PRs & exercise progress <ChevronRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Achievements</h2>
            <span className="text-xs text-muted-foreground">
              {achievements.filter((a) => a.unlockedAt).length} / {achievements.length}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {achievements.map((a) => (
              <AchievementBadge key={a.slug} achievement={a} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
