const queueRepository = require('../repositories/queue.repository');

class QueueService {
    async getTodayQueue() {
        return await queueRepository.getTodayQueue();
    }

    async getTodayStats() {
        return await queueRepository.getTodayStats();
    }

    async getCurrentCalled() {
        return await queueRepository.getCurrentCalled();
    }

    /**
     * Call the next waiting patient.
     * Finds the first appointment with status 'waiting' and queue_number assigned,
     * sets it to 'called'.
     */
    async callNext() {
        const queue = await queueRepository.getTodayQueue();
        const next = queue.find(a => a.status_kunjungan === 'waiting' && a.queue_number);
        if (!next) {
            throw new Error('No more patients waiting in queue');
        }
        return await queueRepository.updateStatus(next.id, 'called');
    }

    /**
     * Manually call a specific patient (by appointment id).
     */
    async callById(id) {
        const appt = await queueRepository.findById(id);
        if (!appt) throw new Error('Appointment not found');
        if (appt.status_kunjungan !== 'waiting') {
            throw new Error(`Cannot call patient: status is already "${appt.status_kunjungan}"`);
        }
        return await queueRepository.updateStatus(id, 'called');
    }

    /**
     * Update status of a specific appointment (assessing, done, cancelled).
     */
    async updateStatus(id, status) {
        const appt = await queueRepository.findById(id);
        if (!appt) throw new Error('Appointment not found');

        const allowed = ['waiting', 'called', 'assessing', 'done', 'cancelled'];
        if (!allowed.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        return await queueRepository.updateStatus(id, status);
    }

    /**
     * Remove a patient from the queue (cancel their appointment for today).
     */
    async removeFromQueue(id) {
        const appt = await queueRepository.findById(id);
        if (!appt) throw new Error('Appointment not found');
        return await queueRepository.removeFromQueue(id);
    }

    /**
     * Auto-assign queue numbers to all today's appointments that don't have one yet.
     * Called when the queue page is first loaded.
     */
    async ensureQueueNumbers() {
        const queue = await queueRepository.getTodayQueue();
        const unassigned = queue.filter(a => !a.queue_number && a.status_kunjungan !== 'cancelled');

        for (const appt of unassigned) {
            const queueNumber = await queueRepository.generateQueueNumber();
            await queueRepository.assignQueueNumber(appt.id, queueNumber);
        }

        return await queueRepository.getTodayQueue();
    }

    async generateQueueForAppointment(appointment_id) {
        const appt = await queueRepository.findById(appointment_id);
        if (!appt) throw new Error('Appointment not found');
        if (appt.queue_number) return appt;

        const queueNumber = await queueRepository.generateQueueNumber();
        return await queueRepository.assignQueueNumber(appointment_id, queueNumber);
    }
}

module.exports = new QueueService();
