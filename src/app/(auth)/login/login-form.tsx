"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Loader2, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/server/actions/auth.actions";
import { PasswordInput } from "../password-input";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="rounded-3xl border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40">
        <CardContent className="px-6 py-8">
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className="h-12 rounded-full pl-10 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                  Password
                </Label>
              </div>
              <PasswordInput id="password" name="password" autoComplete="current-password" />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="size-4 shrink-0" />
                {state.error}
              </div>
            )}

            <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Log in
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
