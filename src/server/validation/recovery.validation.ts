import { z } from "zod";

export const recoveryCheckinSchema = z.object({
  sleepHours: z.number().min(0).max(16),
  waterIntakeLiters: z.number().min(0).max(10),
  energyLevel: z.number().int().min(1).max(5),
  sorenessLevel: z.number().int().min(1).max(5),
  stressLevel: z.number().int().min(1).max(5),
  moodLevel: z.number().int().min(1).max(5),
});
