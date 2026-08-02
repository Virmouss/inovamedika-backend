const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async createUser(userData) {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        if (userData.role === 'Doctor') {
            return await userRepository.createDoctorUser(userData);
        }
        return await userRepository.create(userData);
    }

    async updateUser(id, userData, requestingUserId) {
        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('User not found');
        }

        // Prevent disabling self if is_active is changed
        if (userData.is_active === false && Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot disable your own admin account');
        }

        // Prevent demoting self from Admin
        if (userData.role && userData.role !== 'Admin' && Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot change your own admin role');
        }

        // Hash password if provided
        if (userData.password && userData.password.trim() !== '') {
            userData.password = await bcrypt.hash(userData.password, 10);
        } else {
            delete userData.password;
        }

        return await userRepository.update(id, userData);
    }

    async updateRole(id, role, requestingUserId) {
        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('User not found');
        }
        if (role !== 'Admin' && Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot change your own admin role');
        }
        return await userRepository.updateRole(id, role);
    }

    async updateStatus(id, is_active, requestingUserId) {
        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('User not found');
        }
        if (is_active === false && Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot disable your own admin account');
        }
        return await userRepository.updateStatus(id, is_active);
    }

    async deleteUser(id, requestingUserId) {
        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('User not found');
        }
        if (Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot delete your own admin account');
        }
        return await userRepository.delete(id);
    }
}

module.exports = new UserService();
