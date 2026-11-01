import { AppError } from "../utils/appError.js";

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Requires one of [${allowedRoles.join(", ")}] roles.`,
          403
        )
      );
    }

    next();
  };
}

