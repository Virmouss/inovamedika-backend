const prescriptionRepository = require('../repositories/prescription.repository');
const medicalRecordRepository = require('../repositories/medical-record.repository');

class PrescriptionService {
    async createPrescription(data) {
        const medical_record_id = data.medical_record_id;
        if (!medical_record_id) throw new Error('medical_record_id is required');

        // Validate that the linked medical record exists
        const record = await medicalRecordRepository.findById(medical_record_id);
        if (!record) throw new Error('Medical record not found');

        let rawItems = [];
        if (Array.isArray(data.items)) {
            rawItems = data.items;
        } else if (Array.isArray(data.prescriptions)) {
            rawItems = data.prescriptions;
        } else if (Array.isArray(data)) {
            rawItems = data;
        } else if (data.obat) {
            rawItems = [{ obat: data.obat, dosis: data.dosis, instruksi: data.instruksi }];
        }

        const validItems = rawItems.filter(i => i && i.obat && i.obat.trim());
        if (validItems.length === 0) {
            throw new Error('obat (medication name) is required');
        }

        const created = [];
        for (const item of validItems) {
            const row = await prescriptionRepository.create({
                medical_record_id,
                obat: item.obat.trim(),
                dosis: item.dosis ? item.dosis.trim() : null,
                instruksi: item.instruksi ? item.instruksi.trim() : null,
            });
            created.push(row);
        }

        // Sync a formatted summary back into MEDICAL_RECORDS.resep_obat for backward compatibility
        const summaries = created.map((p, idx) => {
            const parts = [p.obat];
            if (p.dosis) parts.push(`(${p.dosis})`);
            if (p.instruksi) parts.push(`- ${p.instruksi}`);
            return `${created.length > 1 ? `${idx + 1}. ` : ''}${parts.join(' ')}`;
        });
        await medicalRecordRepository.update(medical_record_id, { ...record, resep_obat: summaries.join('\n') });

        return Array.isArray(data.items) || Array.isArray(data.prescriptions) || Array.isArray(data)
            ? created
            : created[0];
    }

    async getPrescriptionById(id) {
        const prescription = await prescriptionRepository.findById(id);
        if (!prescription) throw new Error('Prescription not found');
        return prescription;
    }

    async getPrescriptionsByMedicalRecordId(medicalRecordId) {
        return await prescriptionRepository.findByMedicalRecordId(medicalRecordId);
    }
}

module.exports = new PrescriptionService();

