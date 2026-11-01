export class ApiResponse {
  /**
   * Success response
   * @param {import('express').Response} res
   * @param {string} message
   * @param {any} [data=null]
   * @param {number} [statusCode=200]
   */
  static success(res, message, data = null, statusCode = 200) {
    const payload = {
      success: true,
      message,
      ...(data !== null && { data }),
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Paginated response
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Array} items
   * @param {number} total
   * @param {number} page
   * @param {number} limit
   */
  static paginated(res, message, items, total, page, limit) {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  /**
   * Error response
   * @param {import('express').Response} res
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {any} [details=null]
   */
  static error(res, message, statusCode = 500, details = null) {
    const payload = {
      success: false,
      message,
      ...(details !== null && { details }),
    };
    return res.status(statusCode).json(payload);
  }
}

