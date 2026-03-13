const { validationResult } = require('express-validator');

/**
 * Middleware used after express-validator checks to send a 400 if failures exist.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validateRequest };