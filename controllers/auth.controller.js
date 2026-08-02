const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Username and password are required' });
        }

        const data = await authService.login(username, password);

        res.json({
            status: 'true',
            message: 'success',
            data
        });
    } catch (err) {
        if (err.message === 'Invalid username or password') {
            return res.status(401).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message === 'User account is disabled. Please contact administrator.') {
            return res.status(403).json({ status: 'false', message: 'validation error', error: err.message });
        }
        console.error(err);
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const logout = (req, res) => {
    // JWT is stateless, so we just tell the client to discard it
    res.json({ status: 'true', message: 'success', data: { message: 'Logged out successfully' } });
};

module.exports = { login, logout };
