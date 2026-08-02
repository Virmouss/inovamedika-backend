const db = require('../db');

class PrescriptionRepository {
    async create({ medical_record_id, obat, dosis, instruksi }) {
        const query = `
            INSERT INTO PRESCRIPTIONS (medical_record_id, obat, dosis, instruksi)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [medical_record_id, obat, dosis || null, instruksi || null]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT
                pr.*,
                mr.visit_date,
                mr.diagnosa,
                p.nama AS patient_name,
                p.nik AS patient_nik,
                d.name AS doctor_name
            FROM PRESCRIPTIONS pr
            JOIN MEDICAL_RECORDS mr ON pr.medical_record_id = mr.id
            JOIN PATIENTS p ON mr.patient_id = p.id
            JOIN DOCTORS d ON mr.doctor_id = d.id
            WHERE pr.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findByMedicalRecordId(medicalRecordId) {
        const query = `
            SELECT * FROM PRESCRIPTIONS
            WHERE medical_record_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await db.query(query, [medicalRecordId]);
        return result.rows;
    }
}

module.exports = new PrescriptionRepository();
