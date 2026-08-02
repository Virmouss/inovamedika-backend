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

    async findAll({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const countResult = await db.query(`SELECT COUNT(*) FROM MEDICAL_RECORDS`);
        const total = parseInt(countResult.rows[0].count, 10);

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
            ORDER BY mr.visit_date DESC, mr.created_at DESC, mr.id DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await db.query(query, [limit, offset]);
        return { rows: result.rows, total };
    }

    async findByDoctorId(doctor_id, { page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const countResult = await db.query(
            `SELECT COUNT(*) FROM MEDICAL_RECORDS WHERE doctor_id = $1`,
            [doctor_id]
        );
        const total = parseInt(countResult.rows[0].count, 10);

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
            WHERE mr.doctor_id = $1
            ORDER BY mr.visit_date DESC, mr.created_at DESC, mr.id DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await db.query(query, [doctor_id, limit, offset]);
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
