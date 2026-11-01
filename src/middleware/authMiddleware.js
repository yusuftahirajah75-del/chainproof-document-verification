import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../config/database.js";
import { AppError } from "../utils/appError.js";

/**
 * Authentication middleware
 * Supports secure HTTP-only cookies and Authorization: Bearer <token> headers
 */
export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
      token = req.cookies.token || req.cookies.jwt;
    }
    // 2. Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Authentication required. Please log in to proceed.", 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Session expired. Please log in again.", 401));
      }
      return next(new AppError("Invalid authentication token.", 401));
    }

    // Verify user exists and is active
    const userResult = await query(
      "SELECT id, email, full_name, organization, role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return next(new AppError("User account no longer exists.", 401));
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return next(new AppError("User account has been deactivated. Contact administration.", 403));
    }

    // Attach authenticated user to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      organization: user.organization,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware:
 * Attaches user to req.user if a valid token exists, but does not block if not authenticated
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    let token = null;

    if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
      token = req.cookies.token || req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const userResult = await query(
        "SELECT id, email, full_name, organization, role, is_active FROM users WHERE id = $1",
        [decoded.userId]
      );
      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        req.user = {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          fullName: userResult.rows[0].full_name,
          organization: userResult.rows[0].organization,
          role: userResult.rows[0].role,
        };
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

