const express = require('express');
const User = require('../models/user');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', verifyToken, authorizeRoles("admin", "manager"), async (req, res) => {
  try {
    const userId = req.user.id;
    const earnings = await User.findById(userId).select('earnings');
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;