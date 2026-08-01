const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken); // All patient routes require authentication

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
// Only Registrator or Admin can create/update/delete patients
router.post('/', authorizeRoles('Registrator', 'Admin'), patientController.createPatient);
router.put('/:id', authorizeRoles('Registrator', 'Admin'), patientController.updatePatient);
router.delete('/:id', authorizeRoles('Registrator', 'Admin'), patientController.deletePatient);

module.exports = router;
