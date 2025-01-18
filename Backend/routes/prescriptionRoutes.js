const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { uploadPrescription } = require('../controllers/prescriptionController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

// POST route for uploading prescription
router.post('/upload', verifyToken, authorizeRoles("admin", "manager", "user"), upload.single('prescription'), uploadPrescription);

module.exports = router;
