const db = require('../db');

class QueueRepository {
    /**
     * Get all appointments scheduled for today, used as the queue.
     * Joins with patient and doctor info.
     */
    async getTodayQueue() {
        const query = `
            SELECT 
                a.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            JOIN DOCTORS d ON a.doctor_id = d.id
            WHERE DATE(a.jadwal_kunjungan) = CURRENT_DATE
            ORDER BY a.queue_number ASC NULLS LAST, a.jadwal_kunjungan ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get today's queue statistics for the dashboard.
     */
    async getTodayStats() {
        const query = `
            SELECT 
                COUNT(*) AS total_queue,
                COUNT(CASE WHEN status_kunjungan NOT IN ('cancelled') THEN 1 END) AS total_patients_today,
                COUNT(CASE WHEN status_kunjungan = 'waiting' THEN 1 END) AS total_waiting,
                COUNT(CASE WHEN status_kunjungan = 'called' THEN 1 END) AS total_called,
                COUNT(CASE WHEN status_kunjungan = 'assessing' THEN 1 END) AS total_assessing,
                COUNT(CASE WHEN status_kunjungan = 'done' THEN 1 END) AS total_done
            FROM APPOINTMENTS
            WHERE DATE(jadwal_kunjungan) = CURRENT_DATE;
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    /**
     * Get the currently "called" appointment (the one being displayed on the queue board).
     */
    async getCurrentCalled() {
        const query = `
            SELECT a.*, p.nama AS patient_name
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            WHERE DATE(a.jadwal_kunjungan) = CURRENT_DATE
              AND a.status_kunjungan = 'called'
            ORDER BY a.queue_number ASC
            LIMIT 1;
        `;
        const result = await db.query(query);
        return result.rows[0] || null;
    }

    /**
     * Generate the next queue number for today (e.g., A-001, A-002).
     */
    async generateQueueNumber() {
        const query = `
            SELECT queue_number FROM APPOINTMENTS
            WHERE DATE(jadwal_kunjungan) = CURRENT_DATE
              AND queue_number IS NOT NULL
            ORDER BY queue_number DESC
            LIMIT 1;
        `;
        const result = await db.query(query);
        if (result.rows.length === 0) {
            return 'A-001';
        }
        const last = result.rows[0].queue_number; // e.g. "A-007"
        const num = parseInt(last.split('-')[1], 10);
        const next = String(num + 1).padStart(3, '0');
        return `A-${next}`;
    }

    /**
     * Assign a queue number to an appointment.
     */
    async assignQueueNumber(id, queueNumber) {
        const query = `
            UPDATE APPOINTMENTS
            SET queue_number = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [queueNumber, id]);
        return result.rows[0];
    }

    /**
     * Update status of an appointment (call, assessing, done, cancelled).
     */
    async updateStatus(id, status) {
        const query = `
            UPDATE APPOINTMENTS
            SET status_kunjungan = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }

    /**
     * Remove an appointment from the queue (set status to cancelled).
     */
    async removeFromQueue(id) {
        return await this.updateStatus(id, 'cancelled');
    }

    async findById(id) {
        const query = `
            SELECT a.*, p.nama AS patient_name, d.name AS doctor_name
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            JOIN DOCTORS d ON a.doctor_id = d.id
            WHERE a.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new QueueRepository();
