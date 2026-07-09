import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { progressionEvents } from "@/server/db/schema";
import type { OverloadSuggestion } from "@/server/game/overload/progressiveOverload";
import { OverloadReview } from "./overload-review";

export default async function OverloadReviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId: eventIdParam } = await params;
  const eventId = Number(eventIdParam);
  const { userId } = await requireOnboardedProfile();

  if (!Number.isInteger(eventId)) notFound();

  const event = await db.query.progressionEvents.findFirst({ where: eq(progressionEvents.id, eventId) });
  if (!event || event.userId !== userId) notFound();

  const suggestions = (event.suggestedChangesJson as OverloadSuggestion[] | null) ?? [];

  return (
    <OverloadReview
      eventId={event.id}
      fromRank={event.fromRank}
      toRank={event.toRank}
      alreadyApplied={event.appliedByUser}
      suggestions={suggestions}
    />
  );
}
