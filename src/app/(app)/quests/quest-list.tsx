"use client";

import { useState, useTransition } from "react";
import { Check, Droplet, Feather, Moon, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeQuestAction } from "@/server/actions/quest.actions";

type Quest = {
  id: number;
  title: string;
  description: string;
  category: string;
  bonusXp: number;
  status: string;
};

const CATEGORY_ICON: Record<string, typeof Feather> = {
  stretch: Feather,
  mobility: Wind,
  cooldown: Wind,
  breathing: Wind,
  hydration: Droplet,
  sleep: Moon,
  other: Feather,
};

export function QuestList({ quests }: { quests: Quest[] }) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(quests.filter((q) => q.status === "completed").map((q) => q.id))
  );
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function complete(id: number) {
    setPendingId(id);
    startTransition(async () => {
      const result = await completeQuestAction(id);
      if (!result?.error) {
        setCompletedIds((prev) => new Set(prev).add(id));
      }
      setPendingId(null);
    });
  }

  if (quests.length === 0) {
    return (
      <Card className="border-dashed border-zinc-700 bg-zinc-900">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No quests available today.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map((quest) => {
        const isDone = completedIds.has(quest.id);
        const Icon = CATEGORY_ICON[quest.category] ?? Feather;
        return (
          <Card key={quest.id} className={isDone ? "border-emerald-800/60 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900"}>
            <CardContent className="flex items-start gap-3 py-4">
              <div className={isDone ? "text-emerald-400" : "text-amber-400"}>
                {isDone ? <Check className="size-5" /> : <Icon className="size-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-100">{quest.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{quest.description}</p>
                <p className="mt-1 text-xs font-medium text-amber-400">+{quest.bonusXp} XP</p>
              </div>
              <Button
                size="sm"
                disabled={isDone || (isPending && pendingId === quest.id)}
                onClick={() => complete(quest.id)}
              >
                {isDone ? "Done" : "Complete"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
