"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import { signIn, signOut } from "@/server/auth/auth";
import { signupSchema, loginSchema } from "@/server/validation/auth.validation";

export type AuthActionState = { error?: string } | undefined;

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
    columns: { id: true },
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ name, email: normalizedEmail, passwordHash });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/onboarding",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw err; // rethrow Next.js redirect signal
  }
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  const callbackUrl = formData.get("callbackUrl");
  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err; // rethrow Next.js redirect signal
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
