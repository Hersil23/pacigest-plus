const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { sendAppointmentConfirmation, sendNewAppointmentNotification, sendAppointmentCancelled } = require('../utils/emailService');
const logger = require('../utils/logger');

// ============================================
// CREAR NUEVA CITA
// ============================================
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);

    // Obtener datos del paciente y médico para el email
    const patient = await Patient.findById(req.body.patientId);
    const doctor = await User.findById(req.body.doctorId);

    // Enviar email de confirmación al paciente (si tiene email)
    if (patient && patient.email) {
      const appointmentData = {
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        clinicName: doctor.clinic?.name,
        clinicAddress: doctor.clinic?.address ? 
          `${doctor.clinic.address.street}, ${doctor.clinic.address.city}, ${doctor.clinic.address.state}` : null,
        clinicPhone: doctor.clinic?.phone,
        language: patient.language || 'es'
      };

      await sendAppointmentConfirmation(appointmentData);
      logger.logEmail(patient.email, 'Confirmación de cita', true);
    }

    // Enviar email de notificación al médico
    if (doctor && doctor.email) {
      const doctorNotification = {
        doctorEmail: doctor.email,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reasonForVisit: appointment.reasonForVisit,
        language: doctor.preferences?.language || 'es'
      };

      await sendNewAppointmentNotification(doctorNotification);
      logger.logEmail(doctor.email, 'Nueva cita agendada', true);
      logger.logAudit('APPOINTMENT_CREATED', doctor._id, { 
        appointmentId: appointment._id, 
        patientId: patient._id, 
        date: appointment.appointmentDate 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear cita',
      error: error.message
    });
  }
};

// ============================================
// OBTENER TODAS LAS CITAS (CON FILTROS)
// ============================================
exports.getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filtros opcionales
    const filter = { isActive: true };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName phone email')
      .populate('doctorId', 'firstName lastName specialty')
      .populate('createdBy', 'firstName lastName')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: appointments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// ============================================
// OBTENER CITAS POR MÉDICO
// ============================================
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { 
      doctorId,
      isActive: true 
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName phone email')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: appointments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del médico',
      error: error.message
    });
  }
};

// ============================================
// OBTENER CITAS POR PACIENTE
// ============================================
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({ 
      patientId,
      isActive: true 
    })
      .populate('doctorId', 'firstName lastName specialty phone')
      .sort({ appointmentDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments({ 
      patientId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: appointments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del paciente',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UNA CITA POR ID
// ============================================
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'firstName lastName phone email dateOfBirth gender')
      .populate('doctorId', 'firstName lastName specialty phone email')
      .populate('createdBy', 'firstName lastName')
      .populate('medicalRecordId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cita',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR CITA
// ============================================
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cita',
      error: error.message
    });
  }
};

// ============================================
// CONFIRMAR CITA
// ============================================
exports.confirmAppointment = async (req, res) => {
  try {
    const { confirmedBy } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'confirmed',
        confirmedBy: confirmedBy || 'doctor',
        confirmedAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al confirmar cita',
      error: error.message
    });
  }
};

// ============================================
// CANCELAR CITA
// ============================================
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason, cancelledBy } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason,
        cancelledBy: cancelledBy || 'doctor',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Enviar email de cancelación al paciente
    const patient = await Patient.findById(appointment.patientId);
    const doctor = await User.findById(appointment.doctorId);

    if (patient && patient.email) {
      const cancellationData = {
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        cancellationReason: appointment.cancellationReason,
        language: patient.language || 'es'
      };

      await sendAppointmentCancelled(cancellationData);
      logger.logEmail(patient.email, 'Cita cancelada', true);
      logger.logAudit('APPOINTMENT_CANCELLED', doctor._id, { 
        appointmentId: appointment._id, 
        patientId: patient._id, 
        reason: cancellationReason 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita',
      error: error.message
    });
  }
};

// ============================================
// COMPLETAR CITA
// ============================================
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita completada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al completar cita',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR CITA (SOFT DELETE)
// ============================================
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita eliminada exitosamente',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cita',
      error: error.message
    });
  }
};

// ============================================
// OBTENER AGENDA DEL DÍA
// ============================================
exports.getTodaySchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      isActive: true
    })
      .populate('patientId', 'firstName lastName phone')
      .sort({ appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      date: today.toISOString().split('T')[0],
      data: appointments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener agenda del día',
      error: error.message
    });
  }
};