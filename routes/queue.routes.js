const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Get today's queue + stats (all authenticated users can view)
router.get('/', queueController.getTodayQueue);

// Registrator/Admin actions
router.put('/:id/call', authorizeRoles('Registrator', 'Admin'), queueController.callPatient);
router.put('/:id/status', authorizeRoles('Registrator', 'Admin', 'Doctor'), queueController.updateStatus);
router.put('/:id/remove', authorizeRoles('Registrator', 'Admin'), queueController.removeFromQueue);

module.exports = router;
