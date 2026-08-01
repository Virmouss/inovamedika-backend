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

    async findAll() {
        const query = 'SELECT * FROM PATIENTS ORDER BY created_at DESC;';
        const result = await db.query(query);
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
}

module.exports = new PatientRepository();
