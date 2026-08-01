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
        const patients = await patientService.getAllPatients();
        res.json({ status: 'true', message: 'success', data: patients });
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
