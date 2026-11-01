import { Router } from "express";
import { AdminController } from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Protect all admin endpoints
router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/stats", AdminController.getSystemStats);
router.get("/users", AdminController.listUsers);
router.patch("/users/:id", AdminController.updateUser);
router.get("/audit-logs", AdminController.getAuditLogs);

export default router;

