import pg from "pg";
import { config } from "./env.js";
import { logger } from "../utils/logger.js";

const { Pool } = pg;

const poolConfig = config.db.url
  ? {
      connectionString: config.db.url,
      max: config.db.poolMax,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      ssl:
        process.env.NODE_ENV === "production" || !config.db.url.includes("localhost")
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: process.env.NODE_ENV === "test" ? "chainproof_test" : config.db.name,
      user: config.db.user,
      password: config.db.password,
      max: config.db.poolMax,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  logger.error("[Database Pool Error]:", err.message);
});

/**
 * Execute parameterized SQL query
 * @param {string} text
 * @param {Array} [params]
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`[Database Query] executed in ${duration}ms, rows: ${res.rowCount}`);
    return res;
  } catch (error) {
    logger.error(`[Database Query Failed]: ${error.message} \nQuery: ${text}`);
    throw error;
  }
}

/**
 * Acquire client for transactional workflows
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Health check database connectivity
 * @returns {Promise<boolean>}
 */
export async function checkDatabaseConnection() {
  try {
    const res = await pool.query("SELECT 1 AS healthy");
    return res.rows[0]?.healthy === 1;
  } catch (err) {
    logger.error("[Database Health Check Failed]:", err.message);
    return false;
  }
}
