import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const updateTimezoneSchema = z.object({
  timezone: z.string().min(1, "Required."),
});

export const deleteAccountSchema = z.object({
  confirmEmail: z.email(),
});
