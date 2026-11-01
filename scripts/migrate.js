import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

export async function runMigrations(customConfig = null) {
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
    console.log(
      `[Migrations] Connected to database: ${
        customConfig?.database || (process.env.DATABASE_URL ? "DATABASE_URL" : process.env.DB_NAME || "chainproof_dev")
      }`
    );

    // Create migrations tracker table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const alreadyApplied = await client.query(
        "SELECT id FROM _schema_migrations WHERE filename = $1",
        [file]
      );

      if (alreadyApplied.rows.length === 0) {
        console.log(`[Migrations] Applying ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query(
            "INSERT INTO _schema_migrations (filename) VALUES ($1)",
            [file]
          );
          await client.query("COMMIT");
          console.log(`[Migrations] Applied ${file} successfully.`);
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(`[Migrations] Error executing ${file}:`, err.message);
          throw err;
        }
      } else {
        console.log(`[Migrations] Skipping already applied: ${file}`);
      }
    }

    console.log("[Migrations] All migrations completed successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

// Direct invocation via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Migrations] Migration script failed:", err);
      process.exit(1);
    });
}

