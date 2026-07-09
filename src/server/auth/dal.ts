import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";

// The authoritative auth check. Proxy (src/proxy.ts) only does a cheap, optimistic
// redirect for UX -- Next.js's own docs warn a proxy matcher can silently stop
// covering a route, so every Server Action / Server Component that touches
// user data must call this itself rather than trusting the proxy ran.
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return { userId: session.user.id, session };
});

export const getOptionalSession = cache(async () => {
  const session = await auth();
  return session?.user?.id ? { userId: session.user.id, session } : null;
});

// Use on every page/action that assumes a completed profile exists (dashboard, plans,
// logging, quests) -- signup alone doesn't create a profile row, only finishing the
// onboarding wizard does. Does NOT call this from the onboarding route itself.
export const requireOnboardedProfile = cache(async () => {
  const { userId, session } = await verifySession();
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }
  return { userId, session, profile };
});
