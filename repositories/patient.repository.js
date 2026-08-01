const db = require('../db');

class PatientRepository {
    async create(patientData) {
        const { nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat } = patientData;
        const query = `
            INSERT INTO PATIENTS (nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async findAll(searchQuery = null) {
        let query = 'SELECT * FROM PATIENTS';
        const params = [];
        if (searchQuery) {
            query += ' WHERE nama ILIKE $1 OR nik ILIKE $1';
            params.push(`%${searchQuery}%`);
        }
        query += ' ORDER BY created_at DESC LIMIT 50;';
        const result = await db.query(query, params);
        return result.rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM PATIENTS WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async update(id, patientData) {
        const { nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat } = patientData;
        const query = `
            UPDATE PATIENTS 
            SET nik = $1, nama = $2, kelamin = $3, tanggal_lahir = $4, nomor_telepon = $5, alamat = $6
            WHERE id = $7
            RETURNING *;
        `;
        const values = [nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM PATIENTS WHERE id = $1 RETURNING *;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Get only patients that have had at least one appointment or medical record
     * with the given doctor. Used for the Doctor role.
     */
    async findByDoctorId(doctor_id, searchQuery = null) {
        let query = `
            SELECT DISTINCT p.*
            FROM PATIENTS p
            WHERE p.id IN (
                SELECT patient_id FROM APPOINTMENTS WHERE doctor_id = $1
                UNION
                SELECT patient_id FROM MEDICAL_RECORDS WHERE doctor_id = $1
            )
        `;
        const params = [doctor_id];
        if (searchQuery) {
            query += ' AND (p.nama ILIKE $2 OR p.nik ILIKE $2)';
            params.push(`%${searchQuery}%`);
        }
        query += ' ORDER BY p.nama ASC LIMIT 50;';
        const result = await db.query(query, params);
        return result.rows;
    }
}

module.exports = new PatientRepository();
