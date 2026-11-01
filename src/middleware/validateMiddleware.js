import { AppError } from "../utils/appError.js";

/**
 * Express middleware to validate request payload against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {"body"|"query"|"params"} [source="body"]
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === "query") {
        // req.query is a getter in Express; mutate properties instead of reassigning object
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed);
      } else {
        req[source] = parsed;
      }
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return next(new AppError("Validation failed", 400, formattedErrors));
      }
      return next(err);
    }
  };
}
