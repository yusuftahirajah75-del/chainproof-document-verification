import { VerificationService } from "../services/verificationService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";

export class VerificationController {
  /**
   * Verify document integrity by providing SHA-256 hash string directly
   */
  static async verifyByHash(req, res, next) {
    try {
      const { hash, documentReference } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await VerificationService.verify({
        calculatedHash: hash,
        documentReference,
        user: req.user || null,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(res, "Verification completed.", result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify document integrity by uploading the file
   */
  static async verifyByUpload(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("Please upload a PDF document to verify.", 400);
      }

      const { documentReference } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await VerificationService.verifyFile({
        file: req.file,
        documentReference,
        user: req.user || null,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(res, "Document verification analysis completed.", result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch verification audit history
   */
  static async getHistory(req, res, next) {
    try {
      const { page, limit, status } = req.query;

      const result = await VerificationService.getVerificationHistory({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        status,
        userId: req.user?.id,
        role: req.user?.role,
      });

      return ApiResponse.paginated(
        res,
        "Verification history retrieved.",
        result.history,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }
}

