const userRepository = require('../repositories/user.repository');

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async createUser(userData) {
        if (userData.role === 'Doctor') {
            return await userRepository.createDoctorUser(userData);
        }
        return await userRepository.create(userData);
    }

    async updateRole(id, role) {
        const user = await userRepository.updateRole(id, role);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

module.exports = new UserService();
