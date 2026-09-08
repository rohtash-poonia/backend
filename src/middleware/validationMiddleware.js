/**
 * Validation Middleware
 * Reusable middleware for validating request data against Zod schemas
 */

// ============ VALIDATE REQUEST BODY ============
const validateRequestBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

// ============ VALIDATE QUERY PARAMS ============
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Query validation failed",
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

// ============ VALIDATE PATH PARAMS ============
const validatePathParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.validatedParams = validatedData;
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Parameter validation failed",
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
};
