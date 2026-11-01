import { Router } from "express";
import { VerificationController } from "../controllers/verificationController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";
import { uploadSinglePdf, validatePdfMagicBytes } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { verificationLimiter } from "../middleware/rateLimiterMiddleware.js";
import {
  verifyByHashSchema,
  verifyUploadSchema,
  verificationHistoryQuerySchema,
} from "../validators/verificationValidator.js";

const router = Router();

// 1. Verify by SHA-256 hash string (public / optional auth)
router.post(
  "/verify-hash",
  verificationLimiter,
  optionalAuthenticate,
  validate(verifyByHashSchema),
  VerificationController.verifyByHash
);

// 2. Verify by PDF file upload (public / optional auth)
router.post(
  "/verify-file",
  verificationLimiter,
  uploadSinglePdf,
  validatePdfMagicBytes,
  optionalAuthenticate,
  validate(verifyUploadSchema),
  VerificationController.verifyByUpload
);

// 3. View verification history (authenticated)
router.get(
  "/history",
  authenticate,
  validate(verificationHistoryQuerySchema, "query"),
  VerificationController.getHistory
);

export default router;

