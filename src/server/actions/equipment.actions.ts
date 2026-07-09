"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/server/auth/dal";
import { userEquipmentIdSchema } from "@/server/validation/equipment.validation";
import { equipItem, unequipItem } from "@/server/game/equipment/equipmentService";

type ActionResult = { error?: string; success?: true };

export async function equipItemAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = userEquipmentIdSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await equipItem(userId, parsed.data.userEquipmentId);
  if (result.error) return { error: result.error };

  revalidatePath("/equipment");
  return { success: true };
}

export async function unequipItemAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = userEquipmentIdSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await unequipItem(userId, parsed.data.userEquipmentId);
  if (result.error) return { error: result.error };

  revalidatePath("/equipment");
  return { success: true };
}
