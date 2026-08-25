/**
 * Restricts access to specific user roles
 * @param {string|string[]} roles Allowed role or array of allowed roles
 */
const roleMiddleware = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. User context missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
