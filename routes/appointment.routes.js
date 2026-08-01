const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken); // All appointment routes require authentication

router.get('/', appointmentController.getAllAppointments);
// Helper endpoint to get all doctors for the appointment form
router.get('/doctors', appointmentController.getAllDoctors);

router.get('/:id', appointmentController.getAppointmentById);
// Only Registrator or Admin can create/update/delete appointments
router.post('/', authorizeRoles('Registrator', 'Admin'), appointmentController.createAppointment);
router.put('/:id', authorizeRoles('Registrator', 'Admin'), appointmentController.updateAppointment);
router.delete('/:id', authorizeRoles('Registrator', 'Admin'), appointmentController.deleteAppointment);

module.exports = router;
