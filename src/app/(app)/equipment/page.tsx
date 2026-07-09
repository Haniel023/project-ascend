import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { userEquipment } from "@/server/db/schema";
import { pruneExpiredEquipment } from "@/server/game/equipment/equipmentService";
import { EquipmentGrid, type EquipmentEntry } from "./equipment-grid";

export default async function EquipmentPage() {
  const { userId } = await requireOnboardedProfile();

  await pruneExpiredEquipment(userId);

  const rows = await db.query.userEquipment.findMany({
    where: eq(userEquipment.userId, userId),
    with: { item: true },
    orderBy: desc(userEquipment.acquiredAt),
  });

  const entries: EquipmentEntry[] = rows.map((r) => ({
    userEquipmentId: r.id,
    itemName: r.item.name,
    slot: r.item.slot,
    rarity: r.item.rarity,
    bonusCategory: r.item.bonusCategory,
    bonusValue: r.item.bonusValue,
    loreText: r.item.loreText,
    isEquipped: r.isEquipped,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/profile" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
        <ChevronLeft className="size-3.5" /> Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Equipment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Equip one item per slot for a small, capped XP bonus. Common-Epic items expire 7 days after equipping;
        Mythic items are permanent once equipped.
      </p>

      <div className="mt-6">
        <EquipmentGrid entries={entries} />
      </div>
    </div>
  );
}
