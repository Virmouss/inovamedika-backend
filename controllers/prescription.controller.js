const prescriptionService = require('../services/prescription.service');

/**
 * POST /api/prescriptions
 * Create one or multiple prescriptions linked to a medical record.
 * Body: { medical_record_id, obat, dosis?, instruksi? }
 *    OR { medical_record_id, items: [{ obat, dosis?, instruksi? }, ...] }
 */
const createPrescription = async (req, res) => {
    try {
        const { medical_record_id, obat, items, prescriptions } = req.body;

        if (!medical_record_id) {
            return res.status(400).json({
                status: 'false',
                message: 'validation error',
                error: 'medical_record_id is required',
            });
        }

        if (!obat && (!items || items.length === 0) && (!prescriptions || prescriptions.length === 0)) {
            return res.status(400).json({
                status: 'false',
                message: 'validation error',
                error: 'At least one prescription with obat (medication name) is required',
            });
        }

        const result = await prescriptionService.createPrescription(req.body);
        res.status(201).json({ status: 'true', message: 'success', data: result });
    } catch (err) {
        if (err.message === 'Medical record not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        if (err.message.includes('required')) {
            return res.status(400).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

/**
 * GET /api/prescriptions/:id
 * Get a prescription by its ID.
 */
const getPrescription = async (req, res) => {
    try {
        const prescription = await prescriptionService.getPrescriptionById(req.params.id);
        res.json({ status: 'true', message: 'success', data: prescription });
    } catch (err) {
        if (err.message === 'Prescription not found') {
            return res.status(404).json({ status: 'false', message: 'validation error', error: err.message });
        }
        res.status(500).json({ status: 'false', message: 'internal server error', error: err.message });
    }
};

module.exports = { createPrescription, getPrescription };
