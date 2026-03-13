// role-based access control middleware

/**
 * Returns middleware that ensures the authenticated user has the specified role.
 * The user object is expected to exist on req.user (see verifyToken).
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole };