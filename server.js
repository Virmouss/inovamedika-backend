require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api', authRoutes); // /api/login, /api/logout
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'true', message: 'success', data: { service: 'Mini Clinic API' } });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
