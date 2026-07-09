"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/server/actions/settings.actions";

export function DeleteAccountDialog({ accountEmail }: { accountEmail: string }) {
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction({ confirmEmail });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-900 text-red-400 hover:bg-red-950/40 hover:text-red-300">
          <Trash2 className="size-4" /> Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This permanently deletes your profile, plans, workout history, XP, quests, boss
          history, and achievements. There is no undo. Type your email address to confirm.
        </p>
        <div className="space-y-2">
          <Label htmlFor="confirm-email" className="text-xs">
            {accountEmail}
          </Label>
          <Input
            id="confirm-email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Type your email to confirm"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-red-900 text-red-400 hover:bg-red-950/40 hover:text-red-300"
            disabled={isPending || confirmEmail.toLowerCase().trim() !== accountEmail.toLowerCase()}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Permanently delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
