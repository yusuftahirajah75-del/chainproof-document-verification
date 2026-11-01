import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { generalLimiter } from "./middleware/rateLimiterMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import apiRouter from "./routes/index.js";

const app = express();

// Trust proxy if deployed behind a reverse proxy (e.g. Nginx, Heroku, Cloudflare)
app.set("trust proxy", 1);

// HTTP Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic CORS configuration supporting Render subdomains, local development, and explicit origins
const allowedOrigins = (config.clientOrigin || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server health checks)
      if (!origin) return callback(null, true);

      // Explicit configured origins
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      // Allow any *.onrender.com subdomain
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith(".onrender.com")) {
          return callback(null, true);
        }
      } catch {
        // Fall through
      }

      // Allow localhost in non-production environments
      if (
        config.nodeEnv !== "production" &&
        (origin.includes("localhost") || origin.includes("127.0.0.1"))
      ) {
        return callback(null, true);
      }

      // Default allow for university demonstration and cross-origin compatibility
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Cookie parsing
app.use(cookieParser(config.cookie.secret));

// Request body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Orchestrator and Render health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "ChainProof Backend Service is operational.",
    timestamp: new Date().toISOString(),
  });
});

// General Rate Limiting
app.use("/api", generalLimiter);

// Mount API routes
app.use("/api", apiRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

