const { Resend } = require('resend');

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email FROM configurado en .env
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'PaciGest Plus';

// ============================================
// TEMPLATES HTML
// ============================================

const getEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .info-box {
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #64748b;
        }
        .info-value {
          color: #1e293b;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #2563eb;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background: #1d4ed8;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .footer a {
          color: #2563eb;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 ${FROM_NAME}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${title}</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Este correo fue enviado automáticamente por ${FROM_NAME}</p>
          <p>Si tienes preguntas, contacta al consultorio.</p>
          <p style="margin-top: 15px;">
            © ${new Date().getFullYear()} ${FROM_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// FUNCIÓN 1: CONFIRMACIÓN DE CITA
// ============================================
const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  try {
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const content = `
      <h2 style="color: #1e293b; margin-top: 0;">Hola ${patient.firstName},</h2>
      <p>Tu cita ha sido <strong>confirmada exitosamente</strong>. Aquí están los detalles:</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📅 Fecha:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Hora:</span>
          <span class="info-value">${appointment.appointmentTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏱️ Duración:</span>
          <span class="info-value">${appointment.duration} minutos</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor:</span>
          <span class="info-value">Dr(a). ${doctor.firstName} ${doctor.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📋 Motivo:</span>
          <span class="info-value">${appointment.reasonForVisit}</span>
        </div>
        ${appointment.notes ? `
        <div class="info-row">
          <span class="info-label">📝 Notas:</span>
          <span class="info-value">${appointment.notes}</span>
        </div>
        ` : ''}
      </div>

      <p><strong>Número de Cita:</strong> ${appointment.appointmentNumber}</p>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e;">
          ⚠️ <strong>Importante:</strong> Por favor llega 10 minutos antes de tu cita.
        </p>
      </div>

      <p>Si necesitas <strong>cancelar o reagendar</strong>, por favor contacta al consultorio con anticipación.</p>
      
      <p style="margin-top: 30px;">¡Nos vemos pronto!</p>
      <p style="color: #64748b; margin-top: 5px;">Equipo ${FROM_NAME}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [patient.email],
      subject: `✅ Cita Confirmada - ${formattedDate}`,
      html: getEmailTemplate(content, 'Confirmación de Cita')
    });

    if (error) {
      console.error('Error enviando email de confirmación:', error);
      throw error;
    }

    console.log('Email de confirmación enviado:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error en sendAppointmentConfirmation:', error);
    throw error;
  }
};

// ============================================
// FUNCIÓN 2: RECORDATORIO DE CITA (24h antes)
// ============================================
const sendAppointmentReminder = async (appointment, patient, doctor) => {
  try {
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    const content = `
      <h2 style="color: #1e293b; margin-top: 0;">Hola ${patient.firstName},</h2>
      <p>Te recordamos que tienes una cita programada para <strong>mañana</strong>:</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📅 Fecha:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Hora:</span>
          <span class="info-value">${appointment.appointmentTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor:</span>
          <span class="info-value">Dr(a). ${doctor.firstName} ${doctor.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📋 Motivo:</span>
          <span class="info-value">${appointment.reasonForVisit}</span>
        </div>
      </div>

      <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;">
          💡 <strong>Recuerda:</strong> Llegar 10 minutos antes de tu cita.
        </p>
      </div>

      <p>Si necesitas cancelar o reagendar, por favor avísanos con anticipación.</p>
      
      <p style="margin-top: 30px;">¡Hasta mañana!</p>
      <p style="color: #64748b; margin-top: 5px;">Equipo ${FROM_NAME}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [patient.email],
      subject: `🔔 Recordatorio - Cita Mañana a las ${appointment.appointmentTime}`,
      html: getEmailTemplate(content, 'Recordatorio de Cita')
    });

    if (error) {
      console.error('Error enviando recordatorio:', error);
      throw error;
    }

    console.log('Recordatorio enviado:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error en sendAppointmentReminder:', error);
    throw error;
  }
};

// ============================================
// FUNCIÓN 3: CANCELACIÓN DE CITA
// ============================================
const sendAppointmentCancellation = async (appointment, patient, doctor, reason = '') => {
  try {
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const content = `
      <h2 style="color: #1e293b; margin-top: 0;">Hola ${patient.firstName},</h2>
      <p>Tu cita ha sido <strong style="color: #dc2626;">cancelada</strong>.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📅 Fecha:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Hora:</span>
          <span class="info-value">${appointment.appointmentTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor:</span>
          <span class="info-value">Dr(a). ${doctor.firstName} ${doctor.lastName}</span>
        </div>
        ${reason ? `
        <div class="info-row">
          <span class="info-label">📝 Motivo:</span>
          <span class="info-value">${reason}</span>
        </div>
        ` : ''}
      </div>

      <p>Si deseas <strong>reagendar</strong>, por favor contacta al consultorio.</p>
      
      <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;">
          📞 Contacto: ${doctor.phone || doctor.email}
        </p>
      </div>

      <p style="margin-top: 30px;">Lamentamos cualquier inconveniente.</p>
      <p style="color: #64748b; margin-top: 5px;">Equipo ${FROM_NAME}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [patient.email],
      subject: `❌ Cita Cancelada - ${formattedDate}`,
      html: getEmailTemplate(content, 'Cita Cancelada')
    });

    if (error) {
      console.error('Error enviando email de cancelación:', error);
      throw error;
    }

    console.log('Email de cancelación enviado:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error en sendAppointmentCancellation:', error);
    throw error;
  }
};

// ============================================
// FUNCIÓN 4: REAGENDAR CITA
// ============================================
const sendAppointmentRescheduled = async (appointment, patient, doctor, oldDate, oldTime) => {
  try {
    const newDate = new Date(appointment.appointmentDate);
    const formattedNewDate = newDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedOldDate = new Date(oldDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const content = `
      <h2 style="color: #1e293b; margin-top: 0;">Hola ${patient.firstName},</h2>
      <p>Tu cita ha sido <strong style="color: #2563eb;">reagendada</strong>.</p>
      
      <h3 style="color: #dc2626;">❌ Fecha Anterior:</h3>
      <div style="background: #fee2e2; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 5px 0;">📅 ${formattedOldDate} a las ${oldTime}</p>
      </div>

      <h3 style="color: #16a34a;">✅ Nueva Fecha:</h3>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📅 Fecha:</span>
          <span class="info-value">${formattedNewDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Hora:</span>
          <span class="info-value">${appointment.appointmentTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏱️ Duración:</span>
          <span class="info-value">${appointment.duration} minutos</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor:</span>
          <span class="info-value">Dr(a). ${doctor.firstName} ${doctor.lastName}</span>
        </div>
      </div>

      <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;">
          💡 <strong>Recuerda:</strong> Llegar 10 minutos antes de tu cita.
        </p>
      </div>

      <p>Si tienes alguna duda, no dudes en contactarnos.</p>
      
      <p style="margin-top: 30px;">¡Nos vemos en la nueva fecha!</p>
      <p style="color: #64748b; margin-top: 5px;">Equipo ${FROM_NAME}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [patient.email],
      subject: `🔄 Cita Reagendada - Nueva Fecha: ${formattedNewDate}`,
      html: getEmailTemplate(content, 'Cita Reagendada')
    });

    if (error) {
      console.error('Error enviando email de reagendado:', error);
      throw error;
    }

    console.log('Email de reagendado enviado:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error en sendAppointmentRescheduled:', error);
    throw error;
  }
};

// ============================================
// EXPORTAR FUNCIONES
// ============================================
module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendAppointmentRescheduled
};