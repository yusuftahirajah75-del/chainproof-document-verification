import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { config } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { AuditService } from "./auditService.js";

export class AuthService {
  /**
   * Register a new user
   */
  static async register({ email, password, fullName, organization, ipAddress, userAgent }) {
    // Check if email already registered
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      throw new AppError("A user with this email address is already registered.", 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertSql = `
      INSERT INTO users (email, password_hash, full_name, organization, role, is_active)
      VALUES ($1, $2, $3, $4, 'USER', true)
      RETURNING id, email, full_name, organization, role, created_at;
    `;

    const res = await query(insertSql, [email, passwordHash, fullName, organization]);
    const user = res.rows[0];

    // Audit log
    await AuditService.log({
      userId: user.id,
      action: "USER_REGISTER",
      entityType: "USER",
      entityId: user.id,
      ipAddress,
      userAgent,
      details: { email: user.email, role: user.role },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        organization: user.organization,
        role: user.role,
        createdAt: user.created_at,
      },
      token,
    };
  }

  /**
   * User login with credential validation
   */
  static async login({ email, password, ipAddress, userAgent }) {
    const userRes = await query(
      "SELECT id, email, password_hash, full_name, organization, role, is_active FROM users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      throw new AppError("Invalid email or password credentials.", 401);
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      throw new AppError("Account has been deactivated. Please contact an administrator.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await AuditService.log({
        userId: user.id,
        action: "USER_LOGIN_FAILED",
        entityType: "USER",
        entityId: user.id,
        ipAddress,
        userAgent,
        details: { reason: "Password mismatch" },
      });
      throw new AppError("Invalid email or password credentials.", 401);
    }

    const token = this.generateToken(user);

    await AuditService.log({
      userId: user.id,
      action: "USER_LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        organization: user.organization,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Retrieve current authenticated user profile
   */
  static async getProfile(userId) {
    const res = await query(
      "SELECT id, email, full_name, organization, role, created_at FROM users WHERE id = $1 AND is_active = true",
      [userId]
    );
    if (res.rows.length === 0) {
      throw new AppError("User not found.", 404);
    }
    return res.rows[0];
  }

  /**
   * Generate JWT Token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Attach HTTP-only cookie with secure attributes
   */
  static setAuthCookie(res, token) {
    const isProduction =
      config.nodeEnv === "production" || process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction || config.cookie.secure,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });
  }

  /**
   * Clear HTTP-only cookie on logout
   */
  static clearAuthCookie(res) {
    const isProduction =
      config.nodeEnv === "production" || process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction || config.cookie.secure,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
  }
}

