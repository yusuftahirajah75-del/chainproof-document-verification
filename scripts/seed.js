import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export async function seedDatabase(customConfig = null) {
  const poolConfig =
    customConfig ||
    (process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl:
            process.env.NODE_ENV === "production" || !process.env.DATABASE_URL.includes("localhost")
              ? { rejectUnauthorized: false }
              : false,
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432", 10),
          database: process.env.DB_NAME || "chainproof_dev",
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
        });

  const pool = new Pool(poolConfig);

  const client = await pool.connect();

  try {
    console.log("[Seed] Seeding database...");

    const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
    const userPasswordHash = await bcrypt.hash("UserPass123!", 10);

    // Seed Admin
    await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, organization, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
      `,
      [
        "admin@chainproof.local",
        adminPasswordHash,
        "System Administrator",
        "University Academic Registry",
        "ADMIN",
        true,
      ]
    );

    // Seed Standard User
    await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, organization, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
      `,
      [
        "researcher@chainproof.local",
        userPasswordHash,
        "Alice Researcher",
        "Department of Computer Science",
        "USER",
        true,
      ]
    );

    console.log("[Seed] Database seeded with default accounts:");
    console.log("  - Admin: admin@chainproof.local / AdminPass123!");
    console.log("  - User:  researcher@chainproof.local / UserPass123!");
  } finally {
    client.release();
    await pool.end();
  }
}

import { fileURLToPath } from "url";

// Direct invocation via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Seed] Seeding failed:", err);
      process.exit(1);
    });
}
