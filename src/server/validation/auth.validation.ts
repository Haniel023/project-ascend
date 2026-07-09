import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(50),
  email: z.email("Enter a valid email address."),
  // bcrypt silently truncates beyond 72 bytes, so cap input there.
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
