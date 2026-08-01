const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medical-record.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Doctor's today's patient list (from their appointments)
router.get('/today-patients', authorizeRoles('Doctor', 'Admin'), medicalRecordController.getTodayPatients);

// List all records: Doctor sees own, Admin sees all
router.get('/', authorizeRoles('Doctor', 'Admin'), medicalRecordController.getAllOrDoctorRecords);

// Medical record CRUD
router.post('/', authorizeRoles('Doctor', 'Admin'), medicalRecordController.createRecord);
router.get('/patient/:patientId', medicalRecordController.getRecordsByPatient);
router.get('/:id', medicalRecordController.getRecordById);
router.put('/:id', authorizeRoles('Doctor', 'Admin'), medicalRecordController.updateRecord);
router.delete('/:id', authorizeRoles('Doctor', 'Admin'), medicalRecordController.deleteRecord);

module.exports = router;
