const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

class AuthService {
    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid username or password');
        }

        if (user.is_active === false) {
            throw new Error('User account is disabled. Please contact administrator.');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, doctor_id: user.doctor_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                doctor_id: user.doctor_id
            }
        };
    }
}

module.exports = new AuthService();
