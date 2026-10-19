/**
 * Role Authorization Middleware
 * Restricts route access to specified roles (buyer, seller, admin)
 * and verifies seller approval status where required.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s). Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

/**
 * Approved Seller Guard
 * Ensures a seller has been approved by the Admin before they can perform seller actions (like adding/editing items)
 */
export const requireApprovedSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Admins can bypass if needed
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Only sellers can perform this action.' });
  }

  if (req.user.sellerStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your seller account is currently pending approval by the Admin. You cannot manage bakery items until approved.'
    });
  }

  if (req.user.sellerStatus === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Your seller account has been suspended by the Admin. Please contact support.'
    });
  }

  next();
};
