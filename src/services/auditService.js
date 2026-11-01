import { query } from "../config/database.js";
import { logger } from "../utils/logger.js";

export class AuditService {
  /**
   * Log system activity
   * @param {object} params
   * @param {string|null} [params.userId=null]
   * @param {string} params.action
   * @param {string} params.entityType
   * @param {string|null} [params.entityId=null]
   * @param {string|null} [params.ipAddress=null]
   * @param {string|null} [params.userAgent=null]
   * @param {object} [params.details={}]
   */
  static async log({
    userId = null,
    action,
    entityType,
    entityId = null,
    ipAddress = null,
    userAgent = null,
    details = {},
  }) {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at;
      `;
      const res = await query(sql, [
        userId,
        action,
        entityType,
        entityId ? String(entityId) : null,
        ipAddress,
        userAgent,
        JSON.stringify(details),
      ]);
      return res.rows[0];
    } catch (err) {
      // Audit log failures should be logged but not crash the main business transaction
      logger.error(`[Audit Log Failed]: ${err.message}`, { action, entityType });
      return null;
    }
  }

  /**
   * Fetch audit logs with pagination and filters
   * @param {object} filter
   * @param {string} [filter.action]
   * @param {string} [filter.entityType]
   * @param {string} [filter.userId]
   * @param {number} [filter.page=1]
   * @param {number} [filter.limit=20]
   */
  static async getLogs({ action, entityType, userId, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const values = [];

    if (action) {
      values.push(action);
      whereClauses.push(`action = $${values.length}`);
    }
    if (entityType) {
      values.push(entityType);
      whereClauses.push(`entity_type = $${values.length}`);
    }
    if (userId) {
      values.push(userId);
      whereClauses.push(`user_id = $${values.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countRes = await query(`SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const queryValues = [...values, limit, offset];
    const dataSql = `
      SELECT a.*, u.email as user_email, u.full_name as user_full_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereSql}
      ORDER BY a.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataRes = await query(dataSql, queryValues);
    return { logs: dataRes.rows, total, page, limit };
  }
}

