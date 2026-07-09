"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { updateProfileAction } from "@/server/actions/profile.actions";
import { HERO_CLASSES } from "../onboarding/onboarding-data";

export function EditProfileDialog({
  displayName,
  avatarKey,
  heightCm,
  weightKg,
}: {
  displayName: string;
  avatarKey: string;
  heightCm: number | null;
  weightKg: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(displayName);
  const [avatar, setAvatar] = useState(avatarKey);
  const [height, setHeight] = useState(heightCm ?? 170);
  const [weight, setWeight] = useState(weightKg ?? 70);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction({
        displayName: name,
        avatarKey: avatar,
        heightCm: height,
        weightKg: weight,
      });
      if (result?.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="size-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit character</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Display name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          </div>
          <div className="space-y-2">
            <Label>Class</Label>
            <div className="grid grid-cols-3 gap-2">
              {HERO_CLASSES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvatar(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs",
                    avatar === key
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-height">Height (cm)</Label>
              <Input id="edit-height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (kg)</Label>
              <Input id="edit-weight" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending || name.trim().length < 2}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
