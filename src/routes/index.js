import { Router } from "express";
import authRoutes from "./authRoutes.js";
import documentRoutes from "./documentRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import blockchainRoutes from "./blockchainRoutes.js";
import adminRoutes from "./adminRoutes.js";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChainProof Document Verification API is operational.",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/documents", documentRoutes);
apiRouter.use("/verification", verificationRoutes);
apiRouter.use("/blockchain", blockchainRoutes);
apiRouter.use("/admin", adminRoutes);

export default apiRouter;

