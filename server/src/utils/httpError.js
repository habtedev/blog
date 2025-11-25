class HttpError extends Error {
  constructor(status = 500, message = 'Internal Server Error', details = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = HttpError;
