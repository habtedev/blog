const HttpError = require('../utils/httpError');

/**
 * Validate request body against a Joi schema.
 * Usage: `validate(schema)`
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ message: d.message, path: d.path }));
    return next(new HttpError(400, 'Validation error', details));
  }
  req.body = value;
  return next();
};

module.exports = validate;
