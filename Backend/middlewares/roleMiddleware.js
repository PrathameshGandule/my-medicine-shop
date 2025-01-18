const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const isAllowed = allowedRoles.includes(req.user.role);
        if (!isAllowed) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }
}

module.exports = authorizeRoles;