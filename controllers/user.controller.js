const userService = require('../services/user.service');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ status: 'true', message: 'success', data: users });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, role, doctor_id, doctorName, spesialis, is_active } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Missing required fields' });
        }
        
        if (role === 'Doctor' && !doctor_id && (!doctorName || !spesialis)) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Missing doctor name or spesialis' });
        }

        const user = await userService.createUser({
            username,
            password,
            role,
            doctor_id,
            doctorName,
            spesialis,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Username already exists' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body, req.user?.id);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.includes('cannot')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
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

        const user = await userService.updateRole(req.params.id, role, req.user?.id);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.includes('cannot')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { is_active } = req.body;
        if (is_active === undefined) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'is_active (boolean) is required' });
        }

        const user = await userService.updateStatus(req.params.id, Boolean(is_active), req.user?.id);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.includes('cannot')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await userService.deleteUser(req.params.id, req.user?.id);
        res.json({ status: 'true', message: 'success', data: user });
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.includes('cannot')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateRole,
    updateStatus,
    deleteUser
};
