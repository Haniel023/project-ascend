import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const { userId, session } = await verifySession();

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (profile?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return <OnboardingWizard defaultName={session.user.name ?? ""} />;
}
