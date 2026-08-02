const patientService = require('../services/patient.service');

const createPatient = async (req, res) => {
    try {
        const patient = await patientService.createPatient(req.body);
        res.status(201).json({ status: 'true', message: 'success', data: patient });
    } catch (err) {
        if (err.code === '23505') { // unique violation in pg
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'NIK already exists' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getAllPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || null;

        let result;
        if (req.user.role === 'Doctor') {
            if (!req.user.doctor_id) {
                return res.status(400).json({ status: 'false', message: 'validation error', error: 'No doctor profile linked to this user' });
            }
            result = await patientService.getPatientsByDoctor(req.user.doctor_id, search, page, limit);
        } else {
            result = await patientService.getAllPatients(search, page, limit);
        }

        const totalPages = Math.ceil(result.total / limit);
        res.json({
            status: 'true', message: 'success',
            data: result.rows,
            pagination: { page, limit, total: result.total, totalPages }
        });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};


const getPatientById = async (req, res) => {
    try {
        const patient = await patientService.getPatientById(req.params.id);
        res.json({ status: 'true', message: 'success', data: patient });
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const patient = await patientService.updatePatient(req.params.id, req.body);
        res.json({ status: 'true', message: 'success', data: patient });
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.code === '23505') {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'NIK already exists' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        const patient = await patientService.deletePatient(req.params.id);
        res.json({ status: 'true', message: 'success', data: patient });
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
