import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")
    .max(255)
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(255)
    .transform((val) => val.trim()),
  organization: z
    .string()
    .max(255)
    .optional()
    .transform((val) => (val ? val.trim() : null)),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z.string({ required_error: "Password is required" }).min(1, "Password cannot be empty"),
});

