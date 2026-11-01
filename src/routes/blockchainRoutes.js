import { Router } from "express";
import { BlockchainController } from "../controllers/blockchainController.js";

const router = Router();

// Blockchain node & contract status
router.get("/status", BlockchainController.getStatus);

// Transaction receipt lookup
router.get("/tx/:txHash", BlockchainController.getTransaction);

// Direct on-chain verification lookup
router.get("/verify/:hash", BlockchainController.verifyHashOnChain);

export default router;

