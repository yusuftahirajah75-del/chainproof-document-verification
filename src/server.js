import app from "./app.js";
import { config } from "./config/env.js";
import { pool, checkDatabaseConnection } from "./config/database.js";
import { checkBlockchainConnection } from "./config/blockchain.js";
import { runMigrations } from "../scripts/migrate.js";
import { seedDatabase } from "../scripts/seed.js";
import { logger } from "./utils/logger.js";

async function startServer() {
  logger.info("Initializing ChainProof Backend Services...");

  // Verify database connectivity & auto-initialize schema/seed accounts
  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    logger.info(
      `PostgreSQL database connected: ${config.db.url ? "DATABASE_URL" : `${config.db.name} on ${config.db.host}:${config.db.port}`}`
    );
    try {
      await runMigrations();
      await seedDatabase();
      logger.info("Database migrations and default seminar accounts verified.");
    } catch (initErr) {
      logger.warn(`Database auto-initialization warning: ${initErr.message}`);
    }
  } else {
    logger.warn(
      "WARNING: PostgreSQL database is not reachable. Check DATABASE_URL environment variable."
    );
  }

  // Check blockchain connectivity
  const bcHealth = await checkBlockchainConnection();
  if (bcHealth.connected) {
    logger.info(`Blockchain RPC connected. Latest block: ${bcHealth.blockNumber}`);
  } else {
    logger.warn(`Blockchain RPC warning: ${bcHealth.error || "Not connected"}. Verify node is running.`);
  }

  const server = app.listen(config.port, "0.0.0.0", () => {
    logger.info(`===========================================================`);
    logger.info(`  ChainProof Document Integrity System API`);
    logger.info(`  Server running on http://0.0.0.0:${config.port}`);
    logger.info(`  Environment : ${config.nodeEnv}`);
    logger.info(`===========================================================`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await pool.end();
        logger.info("PostgreSQL pool connections drained.");
      } catch (err) {
        logger.error("Error closing PostgreSQL pool:", err.message);
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error("Forceful shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer().catch((err) => {
  logger.error("Failed to bootstrap server:", err);
  process.exit(1);
});

