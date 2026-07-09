import { z } from "zod";
import { EQUIPMENT_TYPES, TRACKING_TYPES } from "@/server/db/schema/enums";

export const planSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters.").max(60),
  description: z.string().trim().max(300).optional(),
});

export const planDaySchema = z.object({
  name: z.string().trim().min(1, "Required.").max(40),
});

const planExerciseTargets = z.object({
  targetSets: z.number().int().min(1).max(10),
  targetRepsMin: z.number().int().min(1).max(100).nullable(),
  targetRepsMax: z.number().int().min(1).max(100).nullable(),
  targetWeightKg: z.number().min(0).max(500).nullable(),
  targetDurationSeconds: z.number().int().min(1).max(3600).nullable(),
  notes: z.string().trim().max(300).optional(),
  planDayId: z.number().int().positive().nullable(),
});

export const planExerciseSchema = planExerciseTargets.extend({
  exerciseId: z.number().int().positive(),
});

export const planExerciseUpdateSchema = planExerciseTargets;

export const customExerciseSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters.").max(60),
  equipment: z.enum(EQUIPMENT_TYPES),
  trackingType: z.enum(TRACKING_TYPES),
  muscleGroupId: z.number().int().positive(),
});
