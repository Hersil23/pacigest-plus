const cron = require('node-cron');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { 
  sendTrialReminderEmail, 
  sendTrialExpiredEmail,
  sendAppointmentReminder24h,
  sendAppointmentReminder2h
} = require('../utils/emailService');
const logger = require('../utils/logger');

// ============================================
// VERIFICAR TRIALS PRÓXIMOS A EXPIRAR (3 DÍAS)
// ============================================
const checkTrialExpiring = async () => {
  try {
    logger.logInfo('🔍 Verificando trials próximos a expirar...');

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);

    // Buscar usuarios cuyo trial expira en exactamente 3 días
    const users = await User.find({
      'subscription.status': 'trial',
      'subscription.trialEndsAt': {
        $gte: twoDaysFromNow,
        $lte: threeDaysFromNow
      }
    });

    logger.logInfo(`📧 Encontrados ${users.length} usuarios con trial por expirar en 3 días`);

    for (const user of users) {
      try {
        await sendTrialReminderEmail(
          user.email,
          user.firstName,
          3,
          user.preferences?.language || 'es'
        );
        logger.logEmail(user.email, 'Recordatorio trial 3 días', true);
      } catch (error) {
        logger.logError(`Error enviando recordatorio a ${user.email}`, error);
      }
    }

  } catch (error) {
    logger.logError('Error en checkTrialExpiring', error);
  }
};

// ============================================
// VERIFICAR TRIALS EXPIRADOS
// ============================================
const checkTrialExpired = async () => {
  try {
    logger.logInfo('🔍 Verificando trials expirados...');

    const now = new Date();

    // Buscar usuarios cuyo trial expiró
    const users = await User.find({
      'subscription.status': 'trial',
      'subscription.trialEndsAt': { $lt: now }
    });

    logger.logInfo(`📧 Encontrados ${users.length} trials expirados`);

    for (const user of users) {
      try {
        // Cambiar status a expired
        user.subscription.status = 'expired';
        await user.save();

        // Enviar email
        await sendTrialExpiredEmail(
          user.email,
          user.firstName,
          user.preferences?.language || 'es'
        );
        
        logger.logEmail(user.email, 'Trial expirado', true);
        logger.logAudit('TRIAL_EXPIRED', user._id, { email: user.email });
      } catch (error) {
        logger.logError(`Error procesando trial expirado para ${user.email}`, error);
      }
    }

  } catch (error) {
    logger.logError('Error en checkTrialExpired', error);
  }
};

// ============================================
// RECORDATORIOS DE CITAS 24H ANTES
// ============================================
const sendAppointmentReminders24h = async () => {
  try {
    logger.logInfo('🔍 Enviando recordatorios de citas (24h antes)...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Buscar citas para mañana
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true
    })
      .populate('patientId')
      .populate('doctorId');

    logger.logInfo(`📧 Encontradas ${appointments.length} citas para mañana`);

    for (const appointment of appointments) {
      try {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;

        if (!patient || !patient.email) continue;

        const appointmentData = {
          patientEmail: patient.email,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          language: patient.language || 'es'
        };

        await sendAppointmentReminder24h(appointmentData);
        logger.logEmail(patient.email, 'Recordatorio cita 24h', true);
      } catch (error) {
        logger.logError(`Error enviando recordatorio 24h para cita ${appointment._id}`, error);
      }
    }

  } catch (error) {
    logger.logError('Error en sendAppointmentReminders24h', error);
  }
};

// ============================================
// RECORDATORIOS DE CITAS 2H ANTES
// ============================================
const sendAppointmentReminders2h = async () => {
  try {
    logger.logInfo('🔍 Enviando recordatorios de citas (2h antes)...');

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHoursThirtyLater = new Date(now.getTime() + 150 * 60 * 1000); // 2.5 horas

    // Buscar citas en las próximas 2-2.5 horas
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: now,
        $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true
    })
      .populate('patientId')
      .populate('doctorId');

    // Filtrar por hora específica (aproximadamente 2 horas antes)
    const filteredAppointments = appointments.filter(apt => {
      const appointmentDateTime = new Date(apt.appointmentDate);
      const [hours, minutes] = apt.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return appointmentDateTime >= twoHoursLater && appointmentDateTime <= twoHoursThirtyLater;
    });

    logger.logInfo(`📧 Encontradas ${filteredAppointments.length} citas en 2 horas`);

    for (const appointment of filteredAppointments) {
      try {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;

        if (!patient || !patient.email) continue;

        const appointmentData = {
          patientEmail: patient.email,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentTime: appointment.appointmentTime,
          language: patient.language || 'es'
        };

        await sendAppointmentReminder2h(appointmentData);
        logger.logEmail(patient.email, 'Recordatorio cita 2h', true);
      } catch (error) {
        logger.logError(`Error enviando recordatorio 2h para cita ${appointment._id}`, error);
      }
    }

  } catch (error) {
    logger.logError('Error en sendAppointmentReminders2h', error);
  }
};

// ============================================
// CONFIGURAR CRON JOBS
// ============================================
const setupCronJobs = () => {
  logger.logInfo('⏰ Configurando Cron Jobs...');

  // Verificar trials expirados - Cada día a las 00:00
  cron.schedule('0 0 * * *', () => {
    logger.logInfo('🕐 Ejecutando: Verificar trials expirados (00:00)');
    checkTrialExpired();
  });

  // Verificar trials próximos a expirar - Cada día a las 09:00
  cron.schedule('0 9 * * *', () => {
    logger.logInfo('🕐 Ejecutando: Verificar trials por expirar en 3 días (09:00)');
    checkTrialExpiring();
  });

  // Recordatorios de citas 24h antes - Cada día a las 10:00
  cron.schedule('0 10 * * *', () => {
    logger.logInfo('🕐 Ejecutando: Recordatorios de citas 24h antes (10:00)');
    sendAppointmentReminders24h();
  });

  // Recordatorios de citas 2h antes - Cada hora
  cron.schedule('0 * * * *', () => {
    logger.logInfo('🕐 Ejecutando: Recordatorios de citas 2h antes (cada hora)');
    sendAppointmentReminders2h();
  });

  logger.logInfo('✅ Cron Jobs configurados exitosamente');
  logger.logInfo('📅 Programación:');
  logger.logInfo('   - Trials expirados: Diario 00:00');
  logger.logInfo('   - Trials por expirar: Diario 09:00');
  logger.logInfo('   - Recordatorio citas 24h: Diario 10:00');
  logger.logInfo('   - Recordatorio citas 2h: Cada hora');
};

// ============================================
// FUNCIONES MANUALES (PARA TESTING)
// ============================================
const runManualChecks = async () => {
  logger.logInfo('🧪 Ejecutando verificaciones manuales...');
  await checkTrialExpired();
  await checkTrialExpiring();
  await sendAppointmentReminders24h();
  await sendAppointmentReminders2h();
  logger.logInfo('✅ Verificaciones manuales completadas');
};

module.exports = {
  setupCronJobs,
  runManualChecks,
  checkTrialExpired,
  checkTrialExpiring,
  sendAppointmentReminders24h,
  sendAppointmentReminders2h
};