import { z } from "zod";

export const verifyByHashSchema = z.object({
  hash: z
    .string({ required_error: "SHA-256 hash is required" })
    .regex(/^(0x)?[a-fA-F0-9]{64}$/, "Must be a 64-character SHA-256 hex string")
    .transform((val) => (val.startsWith("0x") ? val.slice(2).toLowerCase() : val.toLowerCase())),
  documentReference: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? val.trim() : null)),
});

export const verifyUploadSchema = z.object({
  documentReference: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? val.trim() : null)),
});

export const verificationHistoryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  status: z.enum(["AUTHENTIC", "TAMPERED", "NOT_REGISTERED"]).optional(),
});

