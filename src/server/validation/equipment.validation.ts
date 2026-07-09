import { z } from "zod";

export const userEquipmentIdSchema = z.object({
  userEquipmentId: z.number().int().positive(),
});
