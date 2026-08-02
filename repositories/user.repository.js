const db = require('../db');

class UserRepository {
    async findByUsername(username) {
        const query = 'SELECT * FROM USERS WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                u.role, 
                u.doctor_id, 
                u.is_active, 
                u.created_at,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM USERS u
            LEFT JOIN DOCTORS d ON u.doctor_id = d.id
            WHERE u.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                u.role, 
                u.doctor_id, 
                u.is_active, 
                u.created_at,
                d.name AS doctor_name,
                d.spesialis AS doctor_spesialis
            FROM USERS u
            LEFT JOIN DOCTORS d ON u.doctor_id = d.id
            ORDER BY u.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async create(userData) {
        const { username, password, role, doctor_id, is_active = true } = userData;
        const query = `
            INSERT INTO USERS (username, password, role, doctor_id, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, role, doctor_id, is_active, created_at;
        `;
        const result = await db.query(query, [username, password, role, doctor_id, is_active]);
        return result.rows[0];
    }

    async createDoctorUser(userData) {
        const { username, password, role, doctorName, spesialis, is_active = true } = userData;
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
                INSERT INTO USERS (username, password, role, doctor_id, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, username, role, doctor_id, is_active, created_at;
            `;
            const userResult = await client.query(userQuery, [username, password, role, doctor_id, is_active]);
            
            await client.query('COMMIT');
            return {
                ...userResult.rows[0],
                doctor_name: doctorName,
                doctor_spesialis: spesialis
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id, userData) {
        const { username, password, role, doctorName, spesialis, is_active } = userData;
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Find current user
            const currentRes = await client.query('SELECT * FROM USERS WHERE id = $1', [id]);
            if (currentRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }
            const currentUser = currentRes.rows[0];

            let doctor_id = currentUser.doctor_id;

            // Handle Doctor info
            if (role === 'Doctor') {
                if (doctor_id) {
                    if (doctorName || spesialis) {
                        await client.query(
                            `UPDATE DOCTORS SET name = COALESCE($1, name), spesialis = COALESCE($2, spesialis) WHERE id = $3`,
                            [doctorName || null, spesialis || null, doctor_id]
                        );
                    }
                } else if (doctorName) {
                    const docRes = await client.query(
                        `INSERT INTO DOCTORS (name, spesialis) VALUES ($1, $2) RETURNING id`,
                        [doctorName, spesialis || 'Umum']
                    );
                    doctor_id = docRes.rows[0].id;
                }
            }

            // Build dynamic update for USERS
            const updates = [];
            const values = [];
            let idx = 1;

            if (username !== undefined) {
                updates.push(`username = $${idx++}`);
                values.push(username);
            }
            if (password !== undefined && password !== '') {
                updates.push(`password = $${idx++}`);
                values.push(password);
            }
            if (role !== undefined) {
                updates.push(`role = $${idx++}`);
                values.push(role);
            }
            if (doctor_id !== currentUser.doctor_id) {
                updates.push(`doctor_id = $${idx++}`);
                values.push(doctor_id);
            }
            if (is_active !== undefined) {
                updates.push(`is_active = $${idx++}`);
                values.push(is_active);
            }

            let updatedUser;
            if (updates.length > 0) {
                values.push(id);
                const updateQuery = `
                    UPDATE USERS
                    SET ${updates.join(', ')}
                    WHERE id = $${idx}
                    RETURNING id, username, role, doctor_id, is_active, created_at;
                `;
                const updateRes = await client.query(updateQuery, values);
                updatedUser = updateRes.rows[0];
            } else {
                updatedUser = {
                    id: currentUser.id,
                    username: currentUser.username,
                    role: currentUser.role,
                    doctor_id: currentUser.doctor_id,
                    is_active: currentUser.is_active,
                    created_at: currentUser.created_at
                };
            }

            await client.query('COMMIT');
            return await this.findById(id);
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
            RETURNING id, username, role, doctor_id, is_active, created_at;
        `;
        const result = await db.query(query, [role, id]);
        return result.rows[0];
    }

    async updateStatus(id, is_active) {
        const query = `
            UPDATE USERS
            SET is_active = $1
            WHERE id = $2
            RETURNING id, username, role, doctor_id, is_active, created_at;
        `;
        const result = await db.query(query, [is_active, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = `
            DELETE FROM USERS
            WHERE id = $1
            RETURNING id, username, role, doctor_id, is_active, created_at;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new UserRepository();
