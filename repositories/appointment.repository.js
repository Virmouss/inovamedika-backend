const db = require('../db');

class AppointmentRepository {
    async create(appointmentData) {
        const { patient_id, doctor_id, parent_medical_record_id, poli, keluhan_awal, jenis_pembayaran, jadwal_kunjungan } = appointmentData;
        const query = `
            INSERT INTO APPOINTMENTS (patient_id, doctor_id, parent_medical_record_id, poli, keluhan_awal, jenis_pembayaran, jadwal_kunjungan)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [patient_id, doctor_id, parent_medical_record_id || null, poli, keluhan_awal, jenis_pembayaran, jadwal_kunjungan];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async findAll(filters = {}) {
        let query = `
            SELECT 
                a.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            JOIN DOCTORS d ON a.doctor_id = d.id
        `;
        const conditions = [];
        const params = [];

        if (filters.date) {
            params.push(filters.date);
            conditions.push(`DATE(a.jadwal_kunjungan) = $${params.length}`);
        }

        if (filters.status) {
            params.push(filters.status);
            conditions.push(`a.status_kunjungan = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.jadwal_kunjungan DESC, a.created_at DESC, a.id DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    async findById(id) {
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
            WHERE a.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, appointmentData) {
        const { patient_id, doctor_id, poli, keluhan_awal, jenis_pembayaran, status_kunjungan, jadwal_kunjungan } = appointmentData;
        const query = `
            UPDATE APPOINTMENTS
            SET patient_id = $1, doctor_id = $2, poli = $3, keluhan_awal = $4, 
                jenis_pembayaran = $5, status_kunjungan = $6, jadwal_kunjungan = $7
            WHERE id = $8
            RETURNING *;
        `;
        const values = [patient_id, doctor_id, poli, keluhan_awal, jenis_pembayaran, status_kunjungan, jadwal_kunjungan, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM APPOINTMENTS WHERE id = $1 RETURNING *;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findAllDoctors() {
        const query = 'SELECT id, name, spesialis FROM DOCTORS ORDER BY name ASC;';
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = new AppointmentRepository();
