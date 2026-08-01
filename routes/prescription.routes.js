const express = require('express');
const router = express.Router();
const { getPrescription, createOrUpdatePrescription } = require('../controllers/medical-record.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/prescriptions/:id — fetch prescription text for a medical record
router.get('/:id', getPrescription);

// POST /api/prescriptions — update/set prescription for a medical record
// Body: { medical_record_id, resep_obat }
router.post('/', createOrUpdatePrescription);

module.exports = router;
