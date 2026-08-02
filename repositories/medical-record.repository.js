const db = require('../db');

class MedicalRecordRepository {
    async create(data) {
        const {
            patient_id, doctor_id, appointment_id,
            visit_date, keluhan_awal, tekanan_darah,
            suhu_tubuh, berat_badan, diagnosa,
            rencana_terapi, tindakan_medis, resep_obat
        } = data;

        const query = `
            INSERT INTO MEDICAL_RECORDS
                (patient_id, doctor_id, visit_date, keluhan_awal, tekanan_darah,
                 suhu_tubuh, berat_badan, diagnosa, rencana_terapi, tindakan_medis, resep_obat)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            patient_id, doctor_id, visit_date || new Date(),
            keluhan_awal, tekanan_darah, suhu_tubuh, berat_badan,
            diagnosa, rencana_terapi, tindakan_medis, resep_obat
        ];
        const result = await db.query(query, values);
        const record = result.rows[0];

        // If linked to an appointment, mark it as done and link the record
        if (appointment_id) {
            await db.query(
                `UPDATE APPOINTMENTS
                 SET status_kunjungan = 'done', parent_medical_record_id = $1
                 WHERE id = $2`,
                [record.id, appointment_id]
            );
        }

        return record;
    }

    async findAll({ searchQuery = null, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = '';

        if (searchQuery) {
            params.push(`%${searchQuery}%`);
            whereClause = ' WHERE (p.nama ILIKE $1 OR p.nik ILIKE $1 OR d.name ILIKE $1 OR mr.diagnosa ILIKE $1 OR mr.keluhan_awal ILIKE $1)';
        }

        const countQuery = `
            SELECT COUNT(*) 
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const limitParam = `$${params.length - 1}`;
        const offsetParam = `$${params.length}`;

        const query = `
            SELECT 
                mr.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            ${whereClause}
            ORDER BY mr.visit_date DESC, mr.created_at DESC, mr.id DESC
            LIMIT ${limitParam} OFFSET ${offsetParam};
        `;
        const result = await db.query(query, params);
        return { rows: result.rows, total };
    }

    async findByDoctorId(doctor_id, { searchQuery = null, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const params = [doctor_id];
        let whereClause = ' WHERE mr.doctor_id = $1';

        if (searchQuery) {
            params.push(`%${searchQuery}%`);
            whereClause += ` AND (p.nama ILIKE $2 OR p.nik ILIKE $2 OR mr.diagnosa ILIKE $2 OR mr.keluhan_awal ILIKE $2)`;
        }

        const countQuery = `
            SELECT COUNT(*) 
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const limitParam = `$${params.length - 1}`;
        const offsetParam = `$${params.length}`;

        const query = `
            SELECT 
                mr.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            ${whereClause}
            ORDER BY mr.visit_date DESC, mr.created_at DESC, mr.id DESC
            LIMIT ${limitParam} OFFSET ${offsetParam};
        `;
        const result = await db.query(query, params);
        return { rows: result.rows, total };
    }

    async findByPatientId(patient_id) {
        const query = `
            SELECT 
                mr.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            WHERE mr.patient_id = $1
            ORDER BY mr.visit_date DESC, mr.created_at DESC, mr.id DESC;
        `;
        const result = await db.query(query, [patient_id]);
        return result.rows;
    }

    async findById(id) {
        const query = `
            SELECT 
                mr.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                p.kelamin AS patient_kelamin,
                p.tanggal_lahir AS patient_dob,
                p.nomor_telepon AS patient_phone,
                p.alamat AS patient_alamat,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            WHERE mr.id = $1;
        `;
        const result = await db.query(query, [id]);
        if (!result.rows[0]) return null;

        const record = result.rows[0];

        // Fetch associated prescriptions from the PRESCRIPTIONS table
        const prescriptionsResult = await db.query(
            `SELECT id, obat, dosis, instruksi, created_at
             FROM PRESCRIPTIONS
             WHERE medical_record_id = $1
             ORDER BY created_at ASC;`,
            [id]
        );
        record.prescriptions = prescriptionsResult.rows;

        return record;
    }

    /**
     * Prescription: Get resep_obat from the medical record.
     * GET /prescriptions/:id maps to this.
     */
    async getPrescriptionById(id) {
        const query = `
            SELECT 
                mr.id,
                mr.resep_obat,
                mr.visit_date,
                mr.diagnosa,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name
            FROM MEDICAL_RECORDS mr
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            WHERE mr.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, data) {
        const {
            keluhan_awal, tekanan_darah, suhu_tubuh, berat_badan,
            diagnosa, rencana_terapi, tindakan_medis, resep_obat
        } = data;
        const query = `
            UPDATE MEDICAL_RECORDS
            SET keluhan_awal = $1, tekanan_darah = $2, suhu_tubuh = $3, berat_badan = $4,
                diagnosa = $5, rencana_terapi = $6, tindakan_medis = $7, resep_obat = $8
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            keluhan_awal, tekanan_darah, suhu_tubuh, berat_badan,
            diagnosa, rencana_terapi, tindakan_medis, resep_obat, id
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM MEDICAL_RECORDS WHERE id = $1 RETURNING *;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Get today's appointments for a specific doctor with patient info.
     * Used by the Doctor dashboard to see their patient list.
     */
    async getTodayAppointmentsForDoctor(doctor_id) {
        const query = `
            SELECT 
                a.*,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                p.kelamin AS patient_kelamin,
                p.tanggal_lahir AS patient_dob,
                p.nomor_telepon AS patient_phone
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.id
            WHERE a.doctor_id = $1
              AND DATE(a.jadwal_kunjungan) = CURRENT_DATE
              AND a.status_kunjungan NOT IN ('cancelled')
            ORDER BY a.queue_number DESC NULLS LAST, a.jadwal_kunjungan DESC, a.created_at DESC, a.id DESC;
        `;
        const result = await db.query(query, [doctor_id]);
        return result.rows;
    }
}

module.exports = new MedicalRecordRepository();
