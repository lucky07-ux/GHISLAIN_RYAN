/**
 * Centralized error handler for express.
 *
 * Produces consistent JSON responses and handles known error types.
 */
function errorHandler(err, req, res, next) {
  // validation errors from express-validator
  if (err && err.array && typeof err.array === 'function') {
    const messages = err.array().map((e) => e.msg).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  // Supabase error object usually contains message and code
  if (err && err.message && err.code) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // custom err with status/message
  if (err && err.status) {
    return res.status(err.status).json({ success: false, message: err.message || 'Error' });
  }

  // fallback
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = errorHandler;