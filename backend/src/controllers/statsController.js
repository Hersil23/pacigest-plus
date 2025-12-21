const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// ============================================
// DASHBOARD GENERAL DEL MÉDICO
// ============================================
exports.getDoctorDashboard = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Total de pacientes
    const totalPatients = await Patient.countDocuments({ 
      doctorIds: doctorId,
      isActive: true 
    });

    // Citas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
      isActive: true
    });

    // Citas pendientes (futuras)
    const pendingAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true
    });

    // Historias clínicas este mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const medicalRecordsThisMonth = await MedicalRecord.countDocuments({
      doctorId,
      consultationDate: { $gte: startOfMonth },
      isActive: true
    });

    // Recetas este mes
    const prescriptionsThisMonth = await Prescription.countDocuments({
      doctorId,
      prescriptionDate: { $gte: startOfMonth },
      isActive: true
    });

    // Ingresos potenciales este mes (basado en citas completadas)
    const completedAppointments = await Appointment.find({
      doctorId,
      consultationDate: { $gte: startOfMonth },
      status: 'completed',
      isActive: true
    });

    const monthlyRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        todayAppointments,
        pendingAppointments,
        medicalRecordsThisMonth,
        prescriptionsThisMonth,
        monthlyRevenue,
        currentMonth: startOfMonth.toLocaleString('es', { month: 'long', year: 'numeric' })
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

// ============================================
// ESTADÍSTICAS DE PACIENTES
// ============================================
exports.getPatientStats = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Total de pacientes
    const totalPatients = await Patient.countDocuments({ 
      doctorIds: doctorId,
      isActive: true 
    });

    // Nuevos pacientes este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newPatientsThisMonth = await Patient.countDocuments({
      doctorIds: doctorId,
      createdAt: { $gte: startOfMonth },
      isActive: true
    });

    // Pacientes por género
    const genderStats = await Patient.aggregate([
      { 
        $match: { 
          doctorIds: { $in: [require('mongoose').Types.ObjectId(doctorId)] },
          isActive: true 
        } 
      },
      { 
        $group: { 
          _id: '$gender', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        newPatientsThisMonth,
        genderStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de pacientes',
      error: error.message
    });
  }
};

// ============================================
// ESTADÍSTICAS DE CITAS
// ============================================
exports.getAppointmentStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.appointmentDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    // Citas por estado
    const statusStats = await Appointment.aggregate([
      { 
        $match: { 
          doctorId: require('mongoose').Types.ObjectId(doctorId),
          isActive: true,
          ...dateFilter
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Citas por tipo
    const typeStats = await Appointment.aggregate([
      { 
        $match: { 
          doctorId: require('mongoose').Types.ObjectId(doctorId),
          isActive: true,
          ...dateFilter
        } 
      },
      { 
        $group: { 
          _id: '$appointmentType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Total de citas
    const totalAppointments = await Appointment.countDocuments({
      doctorId,
      isActive: true,
      ...dateFilter
    });

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        statusStats,
        typeStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de citas',
      error: error.message
    });
  }
};

// ============================================
// INGRESOS MENSUALES
// ============================================
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const monthlyData = await Appointment.aggregate([
      {
        $match: {
          doctorId: require('mongoose').Types.ObjectId(doctorId),
          status: 'completed',
          paymentStatus: 'paid',
          appointmentDate: {
            $gte: new Date(`${targetYear}-01-01`),
            $lt: new Date(`${targetYear + 1}-01-01`)
          },
          isActive: true
        }
      },
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          totalRevenue: { $sum: '$consultationFee' },
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      year: targetYear,
      data: monthlyData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos mensuales',
      error: error.message
    });
  }
};

// ============================================
// ACTIVIDAD RECIENTE
// ============================================
exports.getRecentActivity = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Últimas historias clínicas
    const recentRecords = await MedicalRecord.find({ 
      doctorId,
      isActive: true 
    })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Últimas citas
    const recentAppointments = await Appointment.find({ 
      doctorId,
      isActive: true 
    })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Últimas recetas
    const recentPrescriptions = await Prescription.find({ 
      doctorId,
      isActive: true 
    })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        recentRecords,
        recentAppointments,
        recentPrescriptions
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: error.message
    });
  }
};