import { DocumentService } from "../services/documentService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";

export class DocumentController {
  /**
   * Upload PDF document without blockchain registration
   */
  static async upload(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("No PDF document was uploaded.", 400);
      }

      const { title, description } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const document = await DocumentService.uploadDocument({
        file: req.file,
        title,
        description,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(res, "Document uploaded and hashed successfully.", { document }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register previously uploaded document on blockchain
   */
  static async register(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await DocumentService.registerDocumentOnBlockchain({
        documentId: id,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(
        res,
        "Document hash successfully registered on blockchain ledger.",
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload and register in single atomic request
   */
  static async uploadAndRegister(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("No PDF document was uploaded.", 400);
      }

      const { title, description } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const document = await DocumentService.uploadAndRegister({
        file: req.file,
        title,
        description,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(
        res,
        "Document uploaded and registered on blockchain ledger successfully.",
        { document },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List documents with filtering and pagination
   */
  static async list(req, res, next) {
    try {
      const { page, limit, search, status } = req.query;

      const result = await DocumentService.listDocuments({
        userId: req.user.id,
        role: req.user.role,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        status,
      });

      return ApiResponse.paginated(
        res,
        "Documents retrieved successfully.",
        result.documents,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get document by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await DocumentService.getDocumentById(id, req.user);
      return ApiResponse.success(res, "Document details retrieved.", { document }, 200);
    } catch (error) {
      next(error);
    }
  }
}

