const medicalRecordRepository = require('../repositories/medical-record.repository');

class MedicalRecordService {
    async createRecord(data) {
        if (!data.patient_id || !data.doctor_id) {
            throw new Error('patient_id and doctor_id are required');
        }
        return await medicalRecordRepository.create(data);
    }

    async getAllRecords() {
        return await medicalRecordRepository.findAll();
    }

    async getRecordsByDoctor(doctor_id) {
        return await medicalRecordRepository.findByDoctorId(doctor_id);
    }

    async getRecordsByPatient(patient_id) {
        return await medicalRecordRepository.findByPatientId(patient_id);
    }

    async getRecordById(id) {
        const record = await medicalRecordRepository.findById(id);
        if (!record) throw new Error('Medical record not found');
        return record;
    }

    async updateRecord(id, data) {
        const record = await medicalRecordRepository.update(id, data);
        if (!record) throw new Error('Medical record not found');
        return record;
    }

    async deleteRecord(id) {
        const record = await medicalRecordRepository.delete(id);
        if (!record) throw new Error('Medical record not found');
        return record;
    }

    async getPrescription(medicalRecordId) {
        const prescription = await medicalRecordRepository.getPrescriptionById(medicalRecordId);
        if (!prescription) throw new Error('Medical record not found');
        return prescription;
    }

    async getTodayPatientsForDoctor(doctor_id) {
        return await medicalRecordRepository.getTodayAppointmentsForDoctor(doctor_id);
    }
}

module.exports = new MedicalRecordService();
