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

    async findAll({ searchQuery = null, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = '';
        if (searchQuery) {
            params.push(`%${searchQuery}%`);
            whereClause = ' WHERE nama ILIKE $1 OR nik ILIKE $1';
        }

        const countResult = await db.query(
            `SELECT COUNT(*) FROM PATIENTS${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const dataResult = await db.query(
            `SELECT * FROM PATIENTS${whereClause} ORDER BY created_at DESC, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        return { rows: dataResult.rows, total };
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
    async findByDoctorId(doctor_id, { searchQuery = null, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const params = [doctor_id];
        let extraWhere = '';
        if (searchQuery) {
            params.push(`%${searchQuery}%`);
            extraWhere = ' AND (p.nama ILIKE $2 OR p.nik ILIKE $2)';
        }

        const baseWhere = `
            WHERE p.id IN (
                SELECT patient_id FROM APPOINTMENTS WHERE doctor_id = $1
                UNION
                SELECT patient_id FROM MEDICAL_RECORDS WHERE doctor_id = $1
            )${extraWhere}`;

        const countResult = await db.query(
            `SELECT COUNT(DISTINCT p.id) FROM PATIENTS p${baseWhere}`,
            params
        );
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const dataResult = await db.query(
            `SELECT DISTINCT p.* FROM PATIENTS p${baseWhere}
             ORDER BY p.created_at DESC, p.id DESC
             LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        return { rows: dataResult.rows, total };
    }
}

module.exports = new PatientRepository();
