import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/env.js";

const { Pool } = pg;

export const testPool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: "chainproof_test",
  user: config.db.user,
  password: config.db.password,
});

export async function cleanDatabase() {
  const client = await testPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE audit_logs, verification_records, blockchain_transactions, document_hashes, documents, users CASCADE;");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function createTestUser({
  email = "test@chainproof.local",
  password = "Password123!",
  fullName = "Test User",
  organization = "Test Organization",
  role = "USER",
  isActive = true,
} = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const res = await testPool.query(
    `
    INSERT INTO users (email, password_hash, full_name, organization, role, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, full_name, organization, role, is_active;
    `,
    [email, passwordHash, fullName, organization, role, isActive]
  );
  const user = res.rows[0];

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: "1h" }
  );

  return { user, token, rawPassword: password };
}

export async function closeTestDb() {
  await testPool.end();
}

