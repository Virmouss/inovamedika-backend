const patientRepository = require('../repositories/patient.repository');

class PatientService {
    async createPatient(patientData) {
        // Business logic, e.g., checking if NIK is unique could be done here or relied on DB constraint
        return await patientRepository.create(patientData);
    }

    async getAllPatients(searchQuery = null) {
        return await patientRepository.findAll(searchQuery);
    }

    async getPatientById(id) {
        const patient = await patientRepository.findById(id);
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }

    async updatePatient(id, patientData) {
        const patient = await patientRepository.update(id, patientData);
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }

    async deletePatient(id) {
        const patient = await patientRepository.delete(id);
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }
}

module.exports = new PatientService();
