const appointmentRepository = require('../repositories/appointment.repository');

class AppointmentService {
    async createAppointment(appointmentData) {
        return await appointmentRepository.create(appointmentData);
    }

    async getAllAppointments(filters) {
        return await appointmentRepository.findAll(filters);
    }

    async getAppointmentById(id) {
        const appointment = await appointmentRepository.findById(id);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment;
    }

    async updateAppointment(id, appointmentData) {
        const appointment = await appointmentRepository.update(id, appointmentData);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment;
    }

    async deleteAppointment(id) {
        const appointment = await appointmentRepository.delete(id);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment;
    }

    async getAllDoctors() {
        return await appointmentRepository.findAllDoctors();
    }
}

module.exports = new AppointmentService();
