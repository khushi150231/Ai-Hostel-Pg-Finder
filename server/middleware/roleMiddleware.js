export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${userRole}'.`,
      });
    }

    next();
  };
};

export default authorizeRole;
