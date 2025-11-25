const logger = require('../utils/logger');

/**
 * Central Express error handler.
 * Expects errors to optionally include `status` and `details` properties.
 */
function errorHandler(err, req, res, next) {
  // Ensure we have an Error
  const error = err instanceof Error ? err : new Error(String(err));

  const status = error.status || error.statusCode || 500;

  // Log error with stack/metadata
  logger.error('ErrorHandler caught', { status, message: error.message, stack: error.stack, details: error.details || null });

  const payload = { error: error.message || 'Internal Server Error' };
  if (error.details) payload.details = error.details;
  if (process.env.NODE_ENV === 'development') payload.stack = error.stack;

  res.status(status).json(payload);
}

module.exports = errorHandler;
