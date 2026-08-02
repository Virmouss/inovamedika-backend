const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// POST /api/prescriptions — Create a new prescription (Doctor or Admin only)
router.post('/', authorizeRoles('Doctor', 'Admin'), prescriptionController.createPrescription);

// GET /api/prescriptions/:id — Get prescription by its ID (any authenticated user)
router.get('/:id', prescriptionController.getPrescription);

module.exports = router;
