const authorizeUserCart = (req, res, next) => {
  // Admins can access any cart (if needed)
  if (req.user.role === "admin") {
    return next();
  }

  // Check if the authenticated user's ID matches the requested user ID
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Access Denied: Not your cart" });
  }

  // User is authorized to access their cart
  next();
};

module.exports = authorizeUserCart