export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Array|object} [details=null]
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

