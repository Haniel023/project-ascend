"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction } from "@/server/actions/auth.actions";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, undefined);

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hero name</Label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating your hero..." : "Start your journey"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
