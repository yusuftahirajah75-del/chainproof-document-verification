import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  db: {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    get name() {
      if (process.env.NODE_ENV === "test") return "chainproof_test";
      return process.env.DB_NAME || "chainproof_dev";
    },
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    poolMax: parseInt(process.env.DB_POOL_MAX || "20", 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || "30000", 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "fallback_super_secret_chainproof_development_jwt_key_32_chars!",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || "fallback_super_secret_chainproof_cookie_secret_key!",
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  },
  upload: {
    storageDir: process.env.UPLOAD_STORAGE_DIR || "./storage/documents",
    maxFileSizeMb: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || "15", 10),
  },
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || "localhost",
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
    contractAddress: process.env.CONTRACT_ADDRESS || "",
    privateKey:
      process.env.BLOCKCHAIN_PRIVATE_KEY ||
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 mins
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || "20", 10),
  },
};
