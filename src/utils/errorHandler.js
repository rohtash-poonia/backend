/**
 * Global Error Handler Utility
 * Handles all types of errors and sends formatted responses
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============ VALIDATION ERROR HANDLER ============
const handleValidationError = (error) => {
  const errors = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return {
    success: false,
    statusCode: 400,
    message: "Validation failed",
    errors,
  };
};

// ============ MONGODB ERROR HANDLER ============
const handleMongoError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      success: false,
      statusCode: 400,
      message: `${field} already exists`,
      errors: [{ field, message: `${field} must be unique` }],
    };
  }

  if (error.name === "CastError") {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid data format",
      errors: [{ field: error.path, message: "Invalid ID format" }],
    };
  }

  if (error.name === "ValidationError") {
    const errors = Object.keys(error.errors).map((field) => ({
      field,
      message: error.errors[field].message,
    }));
    return {
      success: false,
      statusCode: 400,
      message: "Database validation failed",
      errors,
    };
  }

  return null;
};

// ============ JWT ERROR HANDLER ============
const handleJWTError = (error) => {
  if (error.name === "JsonWebTokenError") {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid token",
    };
  }

  if (error.name === "TokenExpiredError") {
    return {
      success: false,
      statusCode: 401,
      message: "Token expired",
    };
  }

  return null;
};

// ============ GLOBAL ERROR HANDLER MIDDLEWARE ============
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  }

  // Zod Validation Error
  if (err.name === "ZodError") {
    const errorResponse = handleValidationError(err);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // MongoDB Errors
  const mongoError = handleMongoError(err);
  if (mongoError) {
    return res.status(mongoError.statusCode).json(mongoError);
  }

  // JWT Errors
  const jwtError = handleJWTError(err);
  if (jwtError) {
    return res.status(jwtError.statusCode).json(jwtError);
  }

  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

// ============ ASYNC HANDLER WRAPPER ============
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  asyncHandler,
  handleValidationError,
  handleMongoError,
  handleJWTError,
};
