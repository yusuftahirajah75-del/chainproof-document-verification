import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { config } from "../config/env.js";
import { AppError } from "../utils/appError.js";

// Ensure destination directory exists
const uploadDir = path.resolve(config.upload.storageDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage with UUID/randomized filenames to prevent path traversal & collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    cb(null, `${safeBaseName}-${uniqueSuffix}.pdf`);
  },
});

// File filter checking MIME type and extension
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type. Only PDF documents (.pdf) are allowed.", 400), false);
  }
};

const maxBytes = config.upload.maxFileSizeMb * 1024 * 1024;

export const uploadSinglePdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxBytes,
    files: 1,
  },
}).single("document");

/**
 * Secondary verification middleware to inspect magic bytes of uploaded PDF
 * PDF files strictly start with '%PDF-' (0x25 0x50 0x44 0x46 0x2D)
 */
export async function validatePdfMagicBytes(req, res, next) {
  if (!req.file) {
    return next(new AppError("No document file was uploaded.", 400));
  }

  const filePath = req.file.path;

  try {
    const buffer = Buffer.alloc(5);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);

    const magic = buffer.toString("utf8");
    if (magic !== "%PDF-") {
      // Clean up fraudulent file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return next(
        new AppError(
          "Security rejection: The uploaded file content does not conform to genuine PDF structure.",
          400
        )
      );
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return next(new AppError(`Error verifying file integrity: ${err.message}`, 500));
  }
}

