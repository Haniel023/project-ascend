import { z } from "zod";

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2, "At least 2 characters.").max(40),
  avatarKey: z.string().min(1),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
