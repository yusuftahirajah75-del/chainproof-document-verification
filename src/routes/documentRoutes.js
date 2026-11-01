import { Router } from "express";
import { DocumentController } from "../controllers/documentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadSinglePdf, validatePdfMagicBytes } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { uploadDocumentSchema, documentQuerySchema } from "../validators/documentValidator.js";

const router = Router();

// All document management routes require authentication
router.use(authenticate);

// 1. Upload PDF without registering immediately
router.post(
  "/upload",
  uploadSinglePdf,
  validatePdfMagicBytes,
  validate(uploadDocumentSchema),
  DocumentController.upload
);

// 2. Register previously uploaded document on blockchain
router.post("/:id/register", DocumentController.register);

// 3. Upload & register atomically
router.post(
  "/upload-and-register",
  uploadSinglePdf,
  validatePdfMagicBytes,
  validate(uploadDocumentSchema),
  DocumentController.uploadAndRegister
);

// 4. List user's documents (with filtering & pagination)
router.get("/", validate(documentQuerySchema, "query"), DocumentController.list);

// 5. Get document details
router.get("/:id", DocumentController.getById);

export default router;

