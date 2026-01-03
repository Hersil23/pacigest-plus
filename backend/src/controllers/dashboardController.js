const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');

// ============================================
// OBTENER ESTADÍSTICAS DEL DASHBOARD
// ============================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener información del usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Contar pacientes del usuario (doctorIds es un array)
    const totalPatients = await Patient.countDocuments({ doctorIds: userId });

    // Contar citas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await Appointment.countDocuments({
      doctorId: userId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Contar próximas citas (después de hoy)
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId: userId,
      appointmentDate: {
        $gte: tomorrow
      },
      status: { $in: ['scheduled', 'confirmed', 'pending'] }
    });

    // Contar recetas activas
    const activePrescriptions = await Prescription.countDocuments({
      doctorId: userId,
      status: 'active'
    });

    // Obtener citas de hoy con detalles
    const todayAppointments = await Appointment.find({
      doctorId: userId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('patientId', 'firstName lastName')
      .sort({ appointmentTime: 1 })
      .limit(10);

    // Calcular días restantes del trial
    let trialDaysLeft = null;
    if (user.subscription.status === 'trial' && user.subscription.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(user.subscription.trialEndsAt);
      const diffTime = trialEnd - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      trialDaysLeft = diffDays > 0 ? diffDays : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          specialty: user.specialty,
          profilePhotoUrl: user.profilePhotoUrl
        },
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          trialEndsAt: user.subscription.trialEndsAt,
          trialDaysLeft
        },
        stats: {
          totalPatients,
          appointmentsToday,
          upcomingAppointments,
          activePrescriptions
        },
        todayAppointments: todayAppointments.map(apt => ({
          id: apt._id,
          time: apt.appointmentDate,
          patient: apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Paciente',
          reason: apt.reasonForVisit || apt.reason || 'Sin motivo especificado',
          status: apt.status
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};