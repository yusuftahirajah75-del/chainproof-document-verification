import { z } from "zod";

export const uploadDocumentSchema = z.object({
  title: z
    .string({ required_error: "Document title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .transform((v) => (v ? v.trim() : null)),
});

export const documentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().optional(),
  status: z.enum(["PENDING_REGISTRATION", "REGISTERED", "REVOKED", "FAILED"]).optional(),
});

