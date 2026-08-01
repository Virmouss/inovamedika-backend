const db = require('../db');

class UserRepository {
    async findByUsername(username) {
        const query = 'SELECT * FROM USERS WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    async findAll() {
        const query = 'SELECT id, username, role, doctor_id, created_at FROM USERS ORDER BY created_at DESC';
        const result = await db.query(query);
        return result.rows;
    }

    async create(userData) {
        const { username, password, role, doctor_id } = userData;
        const query = `
            INSERT INTO USERS (username, password, role, doctor_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, role, doctor_id, created_at;
        `;
        const result = await db.query(query, [username, password, role, doctor_id]);
        return result.rows[0];
    }

    async createDoctorUser(userData) {
        const { username, password, role, doctorName, spesialis } = userData;
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            const doctorQuery = `
                INSERT INTO DOCTORS (name, spesialis)
                VALUES ($1, $2)
                RETURNING id;
            `;
            const doctorResult = await client.query(doctorQuery, [doctorName, spesialis]);
            const doctor_id = doctorResult.rows[0].id;

            const userQuery = `
                INSERT INTO USERS (username, password, role, doctor_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, role, doctor_id, created_at;
            `;
            const userResult = await client.query(userQuery, [username, password, role, doctor_id]);
            
            await client.query('COMMIT');
            return userResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateRole(id, role) {
        const query = `
            UPDATE USERS
            SET role = $1
            WHERE id = $2
            RETURNING id, username, role, doctor_id, created_at;
        `;
        const result = await db.query(query, [role, id]);
        return result.rows[0];
    }
}

module.exports = new UserRepository();
