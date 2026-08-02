const appointmentService = require('../services/appointment.service');

const createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, poli, keluhan_awal, jenis_pembayaran, jadwal_kunjungan } = req.body;

        if (!patient_id || !doctor_id || !poli || !jadwal_kunjungan) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'patient_id, doctor_id, poli, and jadwal_kunjungan are required' });
        }

        const appointment = await appointmentService.createAppointment(req.body);
        res.status(201).json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.code === '23503') { // foreign key violation
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Invalid patient_id or doctor_id' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const filters = { page, limit };
        if (req.query.date) filters.date = req.query.date;
        if (req.query.status) filters.status = req.query.status;

        const result = await appointmentService.getAllAppointments(filters);
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

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.code === '23503') {
            return res.status(400).json({ status: 'false', message: 'validation error', error: 'Invalid patient_id or doctor_id' });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment = await appointmentService.deleteAppointment(req.params.id);
        res.json({ status: 'true', message: 'success', data: appointment });
    } catch (err) {
        if (err.message === 'Appointment not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await appointmentService.getAllDoctors();
        res.json({ status: 'true', message: 'success', data: doctors });
    } catch (err) {
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    getAllDoctors
};
