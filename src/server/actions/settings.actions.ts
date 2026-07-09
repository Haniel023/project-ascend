"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { profiles, users } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { signIn, signOut } from "@/server/auth/auth";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateTimezoneSchema,
} from "@/server/validation/settings.validation";

type ActionResult = { error?: string; success?: true };

export async function changePasswordAction(input: unknown): Promise<ActionResult | undefined> {
  const { userId } = await verifySession();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return { error: "Account not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const newPasswordHash = await hashPassword(parsed.data.newPassword);
  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, sessionVersion: user.sessionVersion + 1 })
    .where(eq(users.id, userId));

  // Bumping sessionVersion invalidates every existing session, including this one's
  // cached JWT -- re-sign-in immediately so this device stays logged in while any
  // other device/tab gets forced out on its next request (see auth.ts's jwt callback).
  try {
    await signIn("credentials", {
      email: user.email,
      password: parsed.data.newPassword,
      redirectTo: "/settings?passwordChanged=1",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Password changed, but you'll need to log in again." };
    }
    throw err; // rethrow Next.js redirect signal
  }
}

export async function updateTimezoneAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = updateTimezoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db
    .update(profiles)
    .set({ timezone: parsed.data.timezone, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccountAction(input: unknown): Promise<ActionResult | undefined> {
  const { userId, session } = await verifySession();
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const accountEmail = session.user.email?.toLowerCase().trim();
  if (!accountEmail || parsed.data.confirmEmail.toLowerCase().trim() !== accountEmail) {
    return { error: "Email doesn't match your account." };
  }

  // Every domain table cascade-deletes back to `users` -- this one delete cleans
  // everything (profile, plans, logs, xp ledger, quests, bosses, achievements).
  await db.delete(users).where(eq(users.id, userId));

  await signOut({ redirectTo: "/" }); // throws Next.js redirect signal
}
