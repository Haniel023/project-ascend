"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { equipItemAction, unequipItemAction } from "@/server/actions/equipment.actions";
import type { EquipmentRarity, EquipmentSlot } from "@/server/db/schema/enums";

export type EquipmentEntry = {
  userEquipmentId: number;
  itemName: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  bonusCategory: string;
  bonusValue: number;
  loreText: string;
  isEquipped: boolean;
  expiresAt: string | null; // ISO string, null = never expires (Mythic) or unequipped
};

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "Weapon",
  head: "Head",
  chest: "Chest",
  legs: "Legs",
  feet: "Feet",
  trinket: "Trinket",
};

const SLOT_ORDER: EquipmentSlot[] = ["weapon", "head", "chest", "legs", "feet", "trinket"];

const RARITY_BORDER: Record<EquipmentRarity, string> = {
  common: "border-zinc-700",
  uncommon: "border-emerald-700",
  rare: "border-blue-700",
  epic: "border-purple-700",
  mythic: "border-amber-500",
};

const RARITY_TEXT: Record<EquipmentRarity, string> = {
  common: "text-zinc-300",
  uncommon: "text-emerald-300",
  rare: "text-blue-300",
  epic: "text-purple-300",
  mythic: "text-amber-300",
};

const BONUS_LABELS: Record<string, string> = {
  workout_xp: "Workout XP",
  quest_xp: "Quest XP",
  boss_damage: "Boss Damage",
  recovery_score: "Recovery Score",
};

function formatBonus(category: string, value: number): string {
  if (category === "recovery_score") return `+${value} Recovery`;
  return `+${Math.round(value * 1000) / 10}% ${BONUS_LABELS[category] ?? category}`;
}

function daysRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days <= 0 ? "Expiring soon" : `${days}d left`;
}

function ItemCard({
  entry,
  action,
  actionLabel,
}: {
  entry: EquipmentEntry;
  action: (id: number) => void;
  actionLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const remaining = entry.isEquipped ? daysRemaining(entry.expiresAt) : null;

  return (
    <Card className={`border ${RARITY_BORDER[entry.rarity]} bg-zinc-900`}>
      <CardContent className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-zinc-100">{entry.itemName}</p>
            <p className={`text-xs capitalize ${RARITY_TEXT[entry.rarity]}`}>{entry.rarity}</p>
          </div>
          <Button
            size="sm"
            variant={entry.isEquipped ? "outline" : "default"}
            disabled={isPending}
            onClick={() => startTransition(() => action(entry.userEquipmentId))}
          >
            {actionLabel}
          </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-400 italic">{entry.loreText}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-300">
          <Sparkles className="size-3.5" />
          {formatBonus(entry.bonusCategory, entry.bonusValue)}
          {remaining && <span className="text-muted-foreground">-- {remaining}</span>}
          {entry.isEquipped && entry.rarity === "mythic" && (
            <span className="text-muted-foreground">-- Permanent</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EquipmentGrid({ entries }: { entries: EquipmentEntry[] }) {
  const [error, setError] = useState<string | null>(null);

  async function handleEquip(id: number) {
    setError(null);
    const result = await equipItemAction({ userEquipmentId: id });
    if (result?.error) setError(result.error);
  }

  async function handleUnequip(id: number) {
    setError(null);
    const result = await unequipItemAction({ userEquipmentId: id });
    if (result?.error) setError(result.error);
  }

  const equippedBySlot = new Map(entries.filter((e) => e.isEquipped).map((e) => [e.slot, e]));
  const inventory = entries.filter((e) => !e.isEquipped);

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Equipped</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SLOT_ORDER.map((slot) => {
          const equipped = equippedBySlot.get(slot);
          if (!equipped) {
            return (
              <Card key={slot} className="border-dashed border-zinc-700 bg-zinc-900/50">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{SLOT_LABELS[slot]}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Empty</p>
                </CardContent>
              </Card>
            );
          }
          return <ItemCard key={equipped.userEquipmentId} entry={equipped} action={handleUnequip} actionLabel="Unequip" />;
        })}
      </div>

      <h2 className="mt-6 text-sm font-semibold tracking-wide text-zinc-400 uppercase">Inventory</h2>
      {inventory.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No unequipped items yet -- loot drops from dungeons, boss defeats, and achievements.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {inventory.map((entry) => (
            <ItemCard key={entry.userEquipmentId} entry={entry} action={handleEquip} actionLabel="Equip" />
          ))}
        </div>
      )}
    </div>
  );
}
