import { z } from "zod";
import {
  EQUIPMENT_TYPES,
  PRIMARY_GOALS,
  STARTING_FITNESS_LEVELS,
} from "@/server/db/schema/enums";

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2, "At least 2 characters.").max(40),
  avatarKey: z.string().min(1),
  heightCm: z.number().min(100, "Enter a realistic height.").max(250),
  weightKg: z.number().min(30, "Enter a realistic weight.").max(300),
  startingFitnessLevel: z.enum(STARTING_FITNESS_LEVELS),
  primaryGoal: z.enum(PRIMARY_GOALS),
  availableEquipment: z.array(z.enum(EQUIPMENT_TYPES)).min(1, "Pick at least one."),
  daysPerWeekTarget: z.number().int().min(2).max(6),
  timezone: z.string().min(1),
  acceptedDisclaimer: z.literal(true, "You must accept this to continue."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
