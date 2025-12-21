const { Resend } = require('resend');

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// UTILIDAD: ENVIAR EMAIL
// ============================================
const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: subject,
      html: html
    });

    console.log(`✅ Email enviado a ${to}: ${subject}`);
    return { success: true, data };

  } catch (error) {
    console.error(`❌ Error enviando email a ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 1. EMAIL DE VERIFICACIÓN
// ============================================
exports.sendVerificationEmail = async (to, firstName, verificationToken) => {
  const subject = 'Verifica tu email - PaciGest Plus';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 PaciGest Plus</h1>
          <p>Verifica tu email</p>
        </div>
        <div class="content">
          <h2>¡Hola ${firstName}! 👋</h2>
          <p>Gracias por registrarte en PaciGest Plus. Para activar tu cuenta y comenzar tu período de prueba de <strong>7 días gratis</strong>, necesitamos verificar tu email.</p>
          
          <div class="code-box">
            <p style="margin: 0; color: #666;">Tu código de verificación es:</p>
            <div class="code">${verificationToken}</div>
          </div>
          
          <p><strong>⏰ Este código expira en 24 horas.</strong></p>
          
          <p>Si no solicitaste este registro, puedes ignorar este email.</p>
          
          <p>¡Nos vemos pronto! 🚀</p>
          <p><strong>El equipo de PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject, html });
};

// ============================================
// 2. EMAIL DE BIENVENIDA
// ============================================
exports.sendWelcomeEmail = async (to, firstName, trialEndsAt) => {
  const subject = '¡Bienvenido a PaciGest Plus! 🎉';
  const trialEndDate = new Date(trialEndsAt).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
        .cta-button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Bienvenido a PaciGest Plus!</h1>
        </div>
        <div class="content">
          <h2>¡Hola Dr. ${firstName}! 👨‍⚕️</h2>
          <p>Tu cuenta ha sido verificada exitosamente y tu período de prueba de <strong>7 días gratis</strong> ha comenzado.</p>
          
          <p><strong>📅 Tu trial expira el: ${trialEndDate}</strong></p>
          
          <h3>✨ Ya tienes acceso a:</h3>
          
          <div class="feature">
            <strong>👥 Gestión de Pacientes</strong><br>
            Crea fichas completas con historias clínicas
          </div>
          
          <div class="feature">
            <strong>📅 Sistema de Citas</strong><br>
            Agenda y gestiona tus citas fácilmente
          </div>
          
          <div class="feature">
            <strong>💊 Recetas Médicas</strong><br>
            Genera recetas digitales profesionales
          </div>
          
          <div class="feature">
            <strong>📊 Estadísticas</strong><br>
            Dashboard con métricas de tu práctica
          </div>
          
          <p><strong>🎁 Bonus:</strong> Hemos creado algunos pacientes y citas de ejemplo para que explores el sistema.</p>
          
          <p>¿Listo para comenzar?</p>
          
          <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>
          
          <p>¡Éxitos! 🚀</p>
          <p><strong>El equipo de PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject, html });
};

// ============================================
// 3. EMAIL RECORDATORIO TRIAL (3 DÍAS ANTES)
// ============================================
exports.sendTrialReminderEmail = async (to, firstName, daysLeft) => {
  const subject = `⏰ Tu trial expira en ${daysLeft} días - PaciGest Plus`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .cta-button { display: inline-block; padding: 15px 40px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Tu trial está por expirar</h1>
        </div>
        <div class="content">
          <h2>Hola Dr. ${firstName},</h2>
          
          <div class="alert-box">
            <strong>⚠️ Tu período de prueba expira en ${daysLeft} días</strong>
          </div>
          
          <p>Esperamos que hayas disfrutado usando PaciGest Plus. Para continuar usando todas las funcionalidades sin interrupciones, te invitamos a suscribirte.</p>
          
          <h3>💎 Planes disponibles:</h3>
          <ul>
            <li><strong>Starter:</strong> $20/mes - Perfecto para consultorios individuales</li>
            <li><strong>Professional:</strong> $40/mes - Funcionalidades avanzadas</li>
            <li><strong>Clinic:</strong> $80/mes - Para clínicas con múltiples médicos</li>
          </ul>
          
          <p><strong>¿Necesitas más tiempo para decidir?</strong> Contáctanos y con gusto te ayudamos.</p>
          
          <p>Saludos,</p>
          <p><strong>El equipo de PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject, html });
};

// ============================================
// 4. EMAIL TRIAL EXPIRADO
// ============================================
exports.sendTrialExpiredEmail = async (to, firstName) => {
  const subject = '❌ Tu trial ha expirado - PaciGest Plus';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; padding: 15px 40px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Trial Expirado</h1>
        </div>
        <div class="content">
          <h2>Hola Dr. ${firstName},</h2>
          <p>Tu período de prueba de 7 días ha finalizado.</p>
          <p>Todos tus datos están seguros y guardados. Para continuar accediendo a tu cuenta, necesitas suscribirte a un plan.</p>
          
          <p><strong>No pierdas acceso a:</strong></p>
          <ul>
            <li>Tus pacientes y sus historias clínicas</li>
            <li>Tus citas programadas</li>
            <li>Tus recetas médicas</li>
            <li>Todas tus estadísticas</li>
          </ul>
          
          <p>¿Tienes preguntas? Estamos aquí para ayudarte.</p>
          
          <p>Saludos,</p>
          <p><strong>El equipo de PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject, html });
};

// ============================================
// 5. EMAIL RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.sendPasswordResetEmail = async (to, firstName, resetToken) => {
  const subject = 'Recupera tu contraseña - PaciGest Plus';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Recuperar Contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola ${firstName},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          
          <div class="code-box">
            <p style="margin: 0; color: #666;">Tu código de recuperación es:</p>
            <div class="code">${resetToken}</div>
          </div>
          
          <p><strong>⏰ Este código expira en 1 hora.</strong></p>
          
          <p>Si no solicitaste este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.</p>
          
          <p>Saludos,</p>
          <p><strong>El equipo de PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject, html });
};

// ============================================
// 6. EMAIL CONFIRMACIÓN DE CITA (AL PACIENTE)
// ============================================
exports.sendAppointmentConfirmation = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, clinicName, clinicAddress, clinicPhone } = appointmentData;
  
  const subject = `✅ Cita Confirmada - Dr. ${doctorName}`;
  const formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-box { background: white; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Cita Confirmada</h1>
        </div>
        <div class="content">
          <h2>Hola ${patientName},</h2>
          <p>Tu cita ha sido confirmada exitosamente.</p>
          
          <div class="appointment-box">
            <div class="info-row">
              <strong>📅 Fecha:</strong> ${formattedDate}
            </div>
            <div class="info-row">
              <strong>⏰ Hora:</strong> ${appointmentTime}
            </div>
            <div class="info-row">
              <strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}
            </div>
            <div class="info-row">
              <strong>🏥 Consultorio:</strong> ${clinicName || 'N/A'}
            </div>
            <div class="info-row">
              <strong>📍 Dirección:</strong> ${clinicAddress || 'N/A'}
            </div>
            <div class="info-row" style="border-bottom: none;">
              <strong>📞 Teléfono:</strong> ${clinicPhone || 'N/A'}
            </div>
          </div>
          
          <p><strong>💡 Recomendaciones:</strong></p>
          <ul>
            <li>Llega 10 minutos antes de tu cita</li>
            <li>Trae tus documentos de identidad</li>
            <li>Si tienes exámenes previos, tráelos contigo</li>
          </ul>
          
          <p>Si necesitas cancelar o reagendar, por favor contacta al consultorio con anticipación.</p>
          
          <p>¡Te esperamos!</p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 7. RECORDATORIO 24H ANTES (AL PACIENTE)
// ============================================
exports.sendAppointmentReminder24h = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime } = appointmentData;
  
  const subject = `⏰ Recordatorio: Cita mañana con Dr. ${doctorName}`;
  const formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Recordatorio de Cita</h1>
        </div>
        <div class="content">
          <h2>Hola ${patientName},</h2>
          
          <div class="reminder-box">
            <p style="margin: 0;"><strong>🗓️ Tienes una cita mañana</strong></p>
            <p style="font-size: 18px; margin: 10px 0;"><strong>${formattedDate} a las ${appointmentTime}</strong></p>
            <p style="margin: 0;">Con Dr. ${doctorName}</p>
          </div>
          
          <p>Por favor confirma tu asistencia o contacta al consultorio si necesitas cancelar.</p>
          
          <p>¡Te esperamos!</p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 8. RECORDATORIO 2H ANTES (AL PACIENTE)
// ============================================
exports.sendAppointmentReminder2h = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentTime } = appointmentData;
  
  const subject = `🔔 Tu cita es en 2 horas - Dr. ${doctorName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .urgent-box { background: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 ¡Tu cita es pronto!</h1>
        </div>
        <div class="content">
          <h2>Hola ${patientName},</h2>
          
          <div class="urgent-box">
            <h3 style="margin: 0; color: #f44336;">⏰ Tu cita es en 2 horas</h3>
            <p style="font-size: 24px; margin: 10px 0;"><strong>${appointmentTime}</strong></p>
            <p style="margin: 0;">Con Dr. ${doctorName}</p>
          </div>
          
          <p><strong>Recuerda llegar 10 minutos antes.</strong></p>
          
          <p>¡Nos vemos pronto!</p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 9. EMAIL CITA CANCELADA (AL PACIENTE)
// ============================================
exports.sendAppointmentCancelled = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, cancellationReason } = appointmentData;
  
  const subject = `❌ Cita Cancelada - Dr. ${doctorName}`;
  const formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cancel-box { background: #ffebee; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Cita Cancelada</h1>
        </div>
        <div class="content">
          <h2>Hola ${patientName},</h2>
          
          <div class="cancel-box">
            <p><strong>Tu cita ha sido cancelada:</strong></p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Hora:</strong> ${appointmentTime}</p>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            ${cancellationReason ? `<p><strong>Motivo:</strong> ${cancellationReason}</p>` : ''}
          </div>
          
          <p>Si deseas reagendar, por favor contacta al consultorio.</p>
          
          <p>Disculpa las molestias.</p>
          <p><strong>Consultorio Dr. ${doctorName}</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 10. NUEVA CITA CREADA (AL MÉDICO)
// ============================================
exports.sendNewAppointmentNotification = async (appointmentData) => {
  const { doctorEmail, doctorName, patientName, appointmentDate, appointmentTime, reasonForVisit } = appointmentData;
  
  const subject = `📅 Nueva cita agendada - ${patientName}`;
  const formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Nueva Cita Agendada</h1>
        </div>
        <div class="content">
          <h2>Hola Dr. ${doctorName},</h2>
          <p>Se ha agendado una nueva cita en tu calendario:</p>
          
          <div class="appointment-box">
            <div class="info-row">
              <strong>👤 Paciente:</strong> ${patientName}
            </div>
            <div class="info-row">
              <strong>📅 Fecha:</strong> ${formattedDate}
            </div>
            <div class="info-row">
              <strong>⏰ Hora:</strong> ${appointmentTime}
            </div>
            <div class="info-row" style="border-bottom: none;">
              <strong>📝 Motivo:</strong> ${reasonForVisit || 'No especificado'}
            </div>
          </div>
          
          <p>Puedes ver más detalles en tu dashboard de PaciGest Plus.</p>
          
          <p>Saludos,</p>
          <p><strong>PaciGest Plus</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PaciGest Plus. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: doctorEmail, subject, html });
};