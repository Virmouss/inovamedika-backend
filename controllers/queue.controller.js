const queueService = require('../services/queue.service');

/**
 * GET /api/queues
 * Returns today's full queue with stats and current called patient.
 */
const getTodayQueue = async (req, res) => {
    try {
        const queue = await queueService.ensureQueueNumbers();
        const stats = await queueService.getTodayStats();
        const currentCalled = await queueService.getCurrentCalled();
        res.json({ status: 'true', message: 'success', data: { queue, stats, currentCalled } });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};
/**
 * POST /api/queues
 * Generate/assign a queue number to a today's appointment or ensure today's queue numbers.
 * Body (optional): { appointment_id }
 */
const createQueue = async (req, res) => {
    try {
        const { appointment_id } = req.body || {};
        if (appointment_id) {
            const appointment = await queueService.generateQueueForAppointment(appointment_id);
            return res.status(201).json({ status: 'true', message: 'success', data: appointment });
        }
        const queue = await queueService.ensureQueueNumbers();
        res.status(201).json({ status: 'true', message: 'success', data: queue });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};


/**
 * PUT /api/queues/:id/call
 * Set a specific appointment's status to 'called'.
 */
const callPatient = async (req, res) => {
    try {
        const appointment = await queueService.callById(req.params.id);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.startsWith('Cannot call patient')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

/**
 * PUT /api/queues/:id/status
 * Update the status of an appointment in the queue.
 * Body: { status: 'assessing' | 'done' | 'cancelled' | 'waiting' | 'called' }
 */
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'status is required' });
        }
        const appointment = await queueService.updateStatus(req.params.id, status);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.startsWith('Invalid status')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

/**
 * PUT /api/queues/:id/remove
 * Remove a patient from today's queue (sets status to 'cancelled').
 */
const removeFromQueue = async (req, res) => {
    try {
        const appointment = await queueService.removeFromQueue(req.params.id);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    getTodayQueue,
    createQueue,
    callPatient,
    updateStatus,
    removeFromQueue
};
