import { query } from "../config/database.js";
import { AuditService } from "../services/auditService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";

export class AdminController {
  /**
   * System overview metrics and integrity statistics
   */
  static async getSystemStats(req, res, next) {
    try {
      const [usersCount, docsCount, registeredCount, verifStats] = await Promise.all([
        query("SELECT COUNT(*) AS total FROM users"),
        query("SELECT COUNT(*) AS total FROM documents"),
        query("SELECT COUNT(*) AS total FROM documents WHERE status = 'REGISTERED'"),
        query(`
          SELECT verification_status, COUNT(*) as count 
          FROM verification_records 
          GROUP BY verification_status
        `),
      ]);

      const verificationBreakdown = {
        AUTHENTIC: 0,
        TAMPERED: 0,
        NOT_REGISTERED: 0,
      };

      verifStats.rows.forEach((row) => {
        if (verificationBreakdown[row.verification_status] !== undefined) {
          verificationBreakdown[row.verification_status] = parseInt(row.count, 10);
        }
      });

      return ApiResponse.success(res, "System statistics retrieved.", {
        users: { total: parseInt(usersCount.rows[0].total, 10) },
        documents: {
          total: parseInt(docsCount.rows[0].total, 10),
          registeredOnChain: parseInt(registeredCount.rows[0].total, 10),
        },
        verifications: {
          breakdown: verificationBreakdown,
          total: Object.values(verificationBreakdown).reduce((a, b) => a + b, 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all system users with filtering
   */
  static async listUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const offset = (page - 1) * limit;

      const values = [];
      const whereClauses = [];

      if (role) {
        values.push(role);
        whereClauses.push(`role = $${values.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, values);
      const total = parseInt(countRes.rows[0].total, 10);

      const dataValues = [...values, limit, offset];
      const dataRes = await query(
        `
        SELECT id, email, full_name, organization, role, is_active, created_at, updated_at
        FROM users
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `,
        dataValues
      );

      return ApiResponse.paginated(
        res,
        "Users retrieved.",
        dataRes.rows,
        total,
        parseInt(page, 10),
        parseInt(limit, 10)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status or update role
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, role } = req.body;

      if (id === req.user.id && isActive === false) {
        throw new AppError("Administrators cannot deactivate their own account.", 400);
      }

      const updates = [];
      const values = [];

      if (isActive !== undefined) {
        values.push(Boolean(isActive));
        updates.push(`is_active = $${values.length}`);
      }

      if (role) {
        if (!["USER", "ADMIN"].includes(role)) {
          throw new AppError("Invalid role. Must be 'USER' or 'ADMIN'.", 400);
        }
        values.push(role);
        updates.push(`role = $${values.length}`);
      }

      if (updates.length === 0) {
        throw new AppError("No update parameters provided.", 400);
      }

      values.push(id);
      const updateSql = `
        UPDATE users 
        SET ${updates.join(", ")}, updated_at = NOW() 
        WHERE id = $${values.length} 
        RETURNING id, email, full_name, role, is_active, updated_at;
      `;

      const result = await query(updateSql, values);
      if (result.rows.length === 0) {
        throw new AppError("User not found.", 404);
      }

      await AuditService.log({
        userId: req.user.id,
        action: "ADMIN_UPDATE_USER",
        entityType: "USER",
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { isActive, role },
      });

      return ApiResponse.success(res, "User updated successfully.", { user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve audit logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, action, entityType, userId } = req.query;

      const result = await AuditService.getLogs({
        action,
        entityType,
        userId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return ApiResponse.paginated(
        res,
        "Audit logs retrieved.",
        result.logs,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }
}

