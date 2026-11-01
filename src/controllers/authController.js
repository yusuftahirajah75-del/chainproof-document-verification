import { AuthService } from "../services/authService.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, fullName, organization } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.register({
        email,
        password,
        fullName,
        organization,
        ipAddress,
        userAgent,
      });

      // Set secure HTTP-only cookie
      AuthService.setAuthCookie(res, result.token);

      return ApiResponse.success(
        res,
        "User registered successfully.",
        { user: result.user, token: result.token },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.login({
        email,
        password,
        ipAddress,
        userAgent,
      });

      // Set secure HTTP-only cookie
      AuthService.setAuthCookie(res, result.token);

      return ApiResponse.success(
        res,
        "Login successful.",
        { user: result.user, token: result.token },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      AuthService.clearAuthCookie(res);
      return ApiResponse.success(res, "Logged out successfully.", null, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, "Current user profile retrieved.", { user }, 200);
    } catch (error) {
      next(error);
    }
  }
}

