const express = require("express");
const router = express.Router();
const Partner = require("../models/partner");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), async (req, res) => {
  const { name, email, phone, storeDetails } = req.body;

  try {
    const partner = new Partner({ name, email, phone, storeDetails });
    await partner.save();

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

module.exports = router;