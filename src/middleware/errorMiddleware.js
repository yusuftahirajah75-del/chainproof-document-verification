import multer from "multer";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected internal server error occurred.";
  let details = err.details || null;

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `Uploaded file exceeds the maximum permitted limit of ${config.upload.maxFileSizeMb} MB.`;
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected field name for document upload. Use field name 'document'.";
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Handle PostgreSQL specific errors
  if (err.code === "23505") {
    // Unique violation
    statusCode = 409;
    message = "A resource with these unique attributes already exists.";
    if (err.detail) {
      details = { detail: err.detail };
    }
  } else if (err.code === "23503") {
    // Foreign key violation
    statusCode = 400;
    message = "Referenced resource does not exist.";
  } else if (err.code === "22P02") {
    // Invalid UUID / type
    statusCode = 400;
    message = "Invalid identifier or parameter format.";
  }

  // Handle Blockchain / Ethers errors
  if (err.code === "CALL_EXCEPTION") {
    statusCode = 502;
    message = `Blockchain contract call exception: ${err.reason || err.shortMessage || "Reverted"}`;
  } else if (err.code === "NETWORK_ERROR" || err.code === "SERVER_ERROR") {
    statusCode = 503;
    message = "Blockchain RPC node unreachable or timed out.";
  }

  // Log error (debug or full error stack depending on environment)
  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[Client Error] ${req.method} ${req.originalUrl} (${statusCode}): ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details !== null && { details }),
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
}

