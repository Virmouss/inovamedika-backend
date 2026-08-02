const medicalRecordService = require('../services/medical-record.service');

const createRecord = async (req, res) => {
    try {
        const record = await medicalRecordService.createRecord(req.body);
        res.status(201).json({ status: 'true', message: 'success', data: record });
    } catch (err) {
        if (err.message.includes('required')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.code === '23503') {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Invalid patient_id or doctor_id' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

/**
 * GET /api/medical-records
 * Doctor gets their own records; Admin gets all records.
 */
const getAllOrDoctorRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || null;

        let result;
        if (req.user.role === 'Admin') {
            result = await medicalRecordService.getAllRecords(page, limit, search);
        } else {
            if (!req.user.doctor_id) {
                return res.status(400).json({ status: 'false', message: 'validation error', error: 'No doctor profile linked to this user' });
            }
            result = await medicalRecordService.getRecordsByDoctor(req.user.doctor_id, page, limit, search);
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

/**
 * GET /api/prescriptions/:id
 * Fetches the prescription (resep_obat) for a given medical record.
 */
const getPrescription = async (req, res) => {
    try {
        const prescription = await medicalRecordService.getPrescription(req.params.id);
        res.json({ status: 'true', message: 'success', data: prescription });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

/**
 * POST /api/prescriptions
 * Updates the prescription (resep_obat) for a given medical record.
 * Body: { medical_record_id, resep_obat }
 */
const createOrUpdatePrescription = async (req, res) => {
    try {
        const { medical_record_id, resep_obat } = req.body;
        if (!medical_record_id || !resep_obat) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'medical_record_id and resep_obat are required' });
        }
        const updated = await medicalRecordService.updateRecord(medical_record_id, { resep_obat });
        res.json({ status: 'true', message: 'success', data: updated });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getRecordsByPatient = async (req, res) => {
    try {
        const records = await medicalRecordService.getRecordsByPatient(req.params.patientId);
        res.json({ status: 'true', message: 'success', data: records });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getRecordById = async (req, res) => {
    try {
        const record = await medicalRecordService.getRecordById(req.params.id);
        res.json({ status: 'true', message: 'success', data: record });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updateRecord = async (req, res) => {
    try {
        const record = await medicalRecordService.updateRecord(req.params.id, req.body);
        res.json({ status: 'true', message: 'success', data: record });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const deleteRecord = async (req, res) => {
    try {
        const record = await medicalRecordService.deleteRecord(req.params.id);
        res.json({ status: 'true', message: 'success', data: record });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getTodayPatients = async (req, res) => {
    try {
        // Doctor's doctor_id comes from their user record via JWT
        // req.user has { id, username, role, doctor_id }
        const doctor_id = req.user.doctor_id;
        if (!doctor_id) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'No doctor profile linked to this user' });
        }
        const patients = await medicalRecordService.getTodayPatientsForDoctor(doctor_id);
        res.json({ status: 'true', message: 'success', data: patients });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    createRecord,
    getAllOrDoctorRecords,
    getRecordsByPatient,
    getRecordById,
    updateRecord,
    deleteRecord,
    getTodayPatients,
    getPrescription,
    createOrUpdatePrescription
};
