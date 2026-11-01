import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { authLimiter } from "../middleware/rateLimiterMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), AuthController.register);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);

export default router;

