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
        const { date, status, search, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const conditions = [];
        const params = [];

        if (date) {
            params.push(date);
            conditions.push(`DATE(a.jadwal_kunjungan) = $${params.length}`);
        }

        if (status) {
            params.push(status);
            conditions.push(`a.status_kunjungan = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            const pIdx = params.length;
            conditions.push(`(p.nama ILIKE $${pIdx} OR p.nik ILIKE $${pIdx} OR d.name ILIKE $${pIdx} OR a.poli ILIKE $${pIdx} OR a.keluhan_awal ILIKE $${pIdx})`);
        }

        const joinClause = `
            JOIN PATIENTS p ON a.patient_id = p.id
            JOIN DOCTORS d ON a.doctor_id = d.id
        `;

        const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

        const countResult = await db.query(
            `SELECT COUNT(*) FROM APPOINTMENTS a ${joinClause} ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                a.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            JOIN DOCTORS d ON a.doctor_id = d.id
            ${whereClause}
            ORDER BY a.jadwal_kunjungan DESC, a.created_at DESC, a.id DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `;
        const result = await db.query(dataQuery, params);
        return { rows: result.rows, total };
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
