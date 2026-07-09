import { and, eq, lte, isNotNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { equipmentItems, userEquipment } from "@/server/db/schema";
import type { EquipmentBonusCategory, EquipmentSource } from "@/server/db/schema/enums";
import { pickDeterministicIndex } from "@/server/game/shared/seededRandom";
import { EQUIPMENT_BONUS_CAPS, resolveEquippedBonus } from "./equipmentBonus";
import { rollDungeonDropChance, rollRarity } from "./lootDrop";

export type GrantedLoot = { name: string; rarity: string };

// Deletes this user's equipped rows that have passed their expiresAt -- this IS the
// "fully temporary" consumption model: no cron, the row just quietly disappears the
// next time anything touches this user's equipment. Mythic rows (expiresAt: null)
// are never matched by this query.
export async function pruneExpiredEquipment(userId: string): Promise<void> {
  await db
    .delete(userEquipment)
    .where(
      and(
        eq(userEquipment.userId, userId),
        eq(userEquipment.isEquipped, true),
        isNotNull(userEquipment.expiresAt),
        lte(userEquipment.expiresAt, new Date())
      )
    );
}

// source: "dungeon" gates on a separate 40% drop-chance roll; "boss"/"achievement"
// always attempt a roll (guaranteed drop). dropEventKey should uniquely identify the
// triggering event (e.g. `${userId}:dungeon:${dungeonRunId}`) so re-processing the
// same event is idempotent-in-spirit (deterministic, even if not literally re-checked).
export async function grantLoot(userId: string, source: EquipmentSource, dropEventKey: string): Promise<GrantedLoot | null> {
  if (source === "dungeon" && !rollDungeonDropChance(dropEventKey)) return null;

  const rarity = rollRarity(dropEventKey);
  const pool = await db.query.equipmentItems.findMany({ where: eq(equipmentItems.rarity, rarity) });
  if (pool.length === 0) return null;

  const item = pool[pickDeterministicIndex(`${dropEventKey}:item`, pool.length)];

  await db.insert(userEquipment).values({ userId, itemId: item.id, source });

  return { name: item.name, rarity: item.rarity };
}

// Prunes expired items first (so a stale row can never contribute), then sums the
// remaining equipped-and-active bonus for one category, capped.
export async function getActiveEquipmentBonus(userId: string, category: EquipmentBonusCategory): Promise<number> {
  await pruneExpiredEquipment(userId);

  const rows = await db
    .select({ bonusValue: equipmentItems.bonusValue, expiresAt: userEquipment.expiresAt })
    .from(userEquipment)
    .innerJoin(equipmentItems, eq(userEquipment.itemId, equipmentItems.id))
    .where(
      and(eq(userEquipment.userId, userId), eq(userEquipment.isEquipped, true), eq(equipmentItems.bonusCategory, category))
    );

  return resolveEquippedBonus(
    rows.map((r) => ({ bonusValue: r.bonusValue, isEquipped: true, expiresAt: r.expiresAt })),
    EQUIPMENT_BONUS_CAPS[category]
  );
}

export async function equipItem(userId: string, userEquipmentId: number): Promise<{ error?: string }> {
  const owned = await db.query.userEquipment.findFirst({
    where: and(eq(userEquipment.id, userEquipmentId), eq(userEquipment.userId, userId)),
    with: { item: true },
  });
  if (!owned) return { error: "Item not found." };

  await db.transaction(async (tx) => {
    // Unequip whatever else occupies this item's slot -- one equipped item per slot.
    const currentInSlot = await tx.query.userEquipment.findMany({
      where: and(eq(userEquipment.userId, userId), eq(userEquipment.isEquipped, true)),
      with: { item: true },
    });
    for (const row of currentInSlot) {
      if (row.item.slot === owned.item.slot) {
        await tx
          .update(userEquipment)
          .set({ isEquipped: false, equippedAt: null, expiresAt: null })
          .where(eq(userEquipment.id, row.id));
      }
    }

    const now = new Date();
    const expiresAt = owned.item.rarity === "mythic" ? null : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await tx
      .update(userEquipment)
      .set({ isEquipped: true, equippedAt: now, expiresAt })
      .where(eq(userEquipment.id, userEquipmentId));
  });

  return {};
}

export async function unequipItem(userId: string, userEquipmentId: number): Promise<{ error?: string }> {
  const owned = await db.query.userEquipment.findFirst({
    where: and(eq(userEquipment.id, userEquipmentId), eq(userEquipment.userId, userId)),
  });
  if (!owned) return { error: "Item not found." };

  await db
    .update(userEquipment)
    .set({ isEquipped: false, equippedAt: null, expiresAt: null })
    .where(eq(userEquipment.id, userEquipmentId));

  return {};
}
