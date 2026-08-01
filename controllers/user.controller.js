const userService = require('../services/user.service');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ status: 'true', message: 'success', data: users });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, role, doctor_id, doctorName, spesialis } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Missing required fields' });
        }
        
        if (role === 'Doctor' && (!doctorName || !spesialis)) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Missing doctor name or spesialis' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await userService.createUser({
            username,
            password: hashedPassword,
            role,
            doctor_id,
            doctorName,
            spesialis
        });

        res.status(201).json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Username already exists' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Role is required' });
        }

        const user = await userService.updateRole(req.params.id, role);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateRole
};
