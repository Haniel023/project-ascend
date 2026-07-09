import { requireOnboardedProfile } from "@/server/auth/dal";
import { getLocalDateString } from "@/lib/dates";
import { ensureDailyQuests } from "@/server/game/quests/questService";
import { QuestList } from "./quest-list";

export default async function QuestsPage() {
  const { profile } = await requireOnboardedProfile();
  const today = getLocalDateString(profile.timezone);

  const instances = await ensureDailyQuests(profile.userId, today);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Today&apos;s Quests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Recovery-focused side quests -- stretching, mobility, and cooldown work. Each grants
        a flat XP bonus and counts toward your streak, without needing to hit the gym.
      </p>

      <div className="mt-6">
        <QuestList
          quests={instances.map((i) => ({
            id: i.id,
            title: i.questTemplate.title,
            description: i.questTemplate.description,
            category: i.questTemplate.category,
            bonusXp: i.questTemplate.bonusXp,
            status: i.status,
          }))}
        />
      </div>
    </div>
  );
}
