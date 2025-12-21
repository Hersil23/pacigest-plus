const { Resend } = require('resend');
const { translate, formatDate } = require('./i18n');

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// PALETA DE COLORES SOFT PROFESSIONAL
// ============================================
const colors = {
  primary: '#C9D6FF',      // Azul pastel
  secondary: '#E0C3FC',    // Lavanda claro
  accent: '#FFE5F1',       // Rosa pálido
  warning: '#FFF4CC',      // Amarillo suave
  background: '#F8F9FA',   // Blanco perla
  text: '#333333',
  textLight: '#666666'
};

// ============================================
// TEMPLATE BASE HTML
// ============================================
const getBaseTemplate = (headerColor, title, content, language = 'es') => {
  const t = translate(language);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: ${colors.text}; 
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: ${headerColor}; 
          color: ${colors.text}; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content { 
          background: ${colors.background}; 
          padding: 30px; 
          border-radius: 0 0 10px 10px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          color: ${colors.textLight}; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>${t('common.footer')}</p>
          <p>${t('common.copyright')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
exports.sendVerificationEmail = async (to, firstName, verificationToken, language = 'es') => {
  const t = translate(language);
  
  const subject = t('emails.verification.subject');
  
  const content = `
    <h2>${t('common.greeting', { name: firstName })}</h2>
    <p>${t('emails.verification.intro')}</p>
    
    <div style="background: white; border: 2px dashed ${colors.primary}; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; color: ${colors.textLight};">${t('emails.verification.codeLabel')}</p>
      <div style="font-size: 32px; font-weight: bold; color: ${colors.primary}; letter-spacing: 5px; margin: 10px 0;">${verificationToken}</div>
    </div>
    
    <p><strong>${t('emails.verification.expires')}</strong></p>
    
    <p>${t('emails.verification.notRequested')}</p>
    
    <p>${t('emails.verification.closing')}</p>
    <p><strong>${t('common.team')}</strong></p>
  `;

  const html = getBaseTemplate(colors.primary, t('emails.verification.title'), content, language);
  return await sendEmail({ to, subject, html });
};

// ============================================
// 2. EMAIL DE BIENVENIDA
// ============================================
exports.sendWelcomeEmail = async (to, firstName, trialEndsAt, language = 'es') => {
  const t = translate(language);
  const trialEndDate = formatDate(trialEndsAt, language);
  
  const subject = t('emails.welcome.subject');
  
  const content = `
    <h2>${t('common.greetingDoctor', { name: firstName })}</h2>
    <p>${t('emails.welcome.intro')}</p>
    
    <p><strong>${t('emails.welcome.trialExpires', { date: trialEndDate })}</strong></p>
    
    <h3>${t('emails.welcome.accessTitle')}</h3>
    
    <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${colors.primary}; border-radius: 5px;">
      <strong>${t('emails.welcome.feature1Title')}</strong><br>
      ${t('emails.welcome.feature1Desc')}
    </div>
    
    <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${colors.secondary}; border-radius: 5px;">
      <strong>${t('emails.welcome.feature2Title')}</strong><br>
      ${t('emails.welcome.feature2Desc')}
    </div>
    
    <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${colors.accent}; border-radius: 5px;">
      <strong>${t('emails.welcome.feature3Title')}</strong><br>
      ${t('emails.welcome.feature3Desc')}
    </div>
    
    <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${colors.warning}; border-radius: 5px;">
      <strong>${t('emails.welcome.feature4Title')}</strong><br>
      ${t('emails.welcome.feature4Desc')}
    </div>
    
    <p>${t('emails.welcome.bonus')}</p>
    
    <p>${t('emails.welcome.ready')}</p>
    
    <p>${t('emails.welcome.support')}</p>
    
    <p>${t('emails.welcome.closing')}</p>
    <p><strong>${t('common.team')}</strong></p>
  `;

  const html = getBaseTemplate(colors.primary, t('emails.welcome.title'), content, language);
  return await sendEmail({ to, subject, html });
};

// ============================================
// 3. EMAIL RECORDATORIO TRIAL
// ============================================
exports.sendTrialReminderEmail = async (to, firstName, daysLeft, language = 'es') => {
  const t = translate(language);
  
  const subject = t('emails.trialReminder.subject', { days: daysLeft });
  
  const content = `
    <h2>${t('common.greetingDoctor', { name: firstName })}</h2>
    
    <div style="background: ${colors.warning}; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <strong>${t('emails.trialReminder.alertTitle', { days: daysLeft })}</strong>
    </div>
    
    <p>${t('emails.trialReminder.intro')}</p>
    
    <h3>${t('emails.trialReminder.plansTitle')}</h3>
    <ul>
      <li>${t('emails.trialReminder.planStarter')}</li>
      <li>${t('emails.trialReminder.planProfessional')}</li>
      <li>${t('emails.trialReminder.planClinic')}</li>
    </ul>
    
    <p>${t('emails.trialReminder.needMore')}</p>
    
    <p>${t('common.salutation')}</p>
    <p><strong>${t('common.team')}</strong></p>
  `;

  const html = getBaseTemplate(colors.warning, t('emails.trialReminder.title'), content, language);
  return await sendEmail({ to, subject, html });
};

// ============================================
// 4. EMAIL TRIAL EXPIRADO
// ============================================
exports.sendTrialExpiredEmail = async (to, firstName, language = 'es') => {
  const t = translate(language);
  
  const subject = t('emails.trialExpired.subject');
  
  const content = `
    <h2>${t('common.greetingDoctor', { name: firstName })}</h2>
    <p>${t('emails.trialExpired.intro')}</p>
    <p>${t('emails.trialExpired.dataSafe')}</p>
    
    <p>${t('emails.trialExpired.dontLoseTitle')}</p>
    <ul>
      <li>${t('emails.trialExpired.item1')}</li>
      <li>${t('emails.trialExpired.item2')}</li>
      <li>${t('emails.trialExpired.item3')}</li>
      <li>${t('emails.trialExpired.item4')}</li>
    </ul>
    
    <p>${t('emails.trialExpired.support')}</p>
    
    <p>${t('common.salutation')}</p>
    <p><strong>${t('common.team')}</strong></p>
  `;

  const html = getBaseTemplate('#dc3545', t('emails.trialExpired.title'), content, language);
  return await sendEmail({ to, subject, html });
};

// ============================================
// 5. EMAIL RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.sendPasswordResetEmail = async (to, firstName, resetToken, language = 'es') => {
  const t = translate(language);
  
  const subject = t('emails.passwordReset.subject');
  
  const content = `
    <h2>${t('common.greetingFormal', { name: firstName })}</h2>
    <p>${t('emails.passwordReset.intro')}</p>
    
    <div style="background: white; border: 2px dashed ${colors.primary}; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; color: ${colors.textLight};">${t('emails.passwordReset.codeLabel')}</p>
      <div style="font-size: 32px; font-weight: bold; color: ${colors.primary}; letter-spacing: 5px; margin: 10px 0;">${resetToken}</div>
    </div>
    
    <p><strong>${t('emails.passwordReset.expires')}</strong></p>
    
    <p>${t('emails.passwordReset.notRequested')}</p>
    
    <p>${t('common.salutation')}</p>
    <p><strong>${t('common.team')}</strong></p>
  `;

  const html = getBaseTemplate(colors.primary, t('emails.passwordReset.title'), content, language);
  return await sendEmail({ to, subject, html });
};

// ============================================
// 6. EMAIL CONFIRMACIÓN DE CITA
// ============================================
exports.sendAppointmentConfirmation = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, clinicName, clinicAddress, clinicPhone, language = 'es' } = appointmentData;
  
  const t = translate(language);
  const formattedDate = formatDate(appointmentDate, language);
  
  const subject = t('emails.appointmentConfirmation.subject', { doctorName });
  
  const content = `
    <h2>${t('common.greetingFormal', { name: patientName })}</h2>
    <p>${t('emails.appointmentConfirmation.intro')}</p>
    
    <div style="background: white; border-left: 4px solid ${colors.primary}; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.appointmentConfirmation.dateLabel')} ${formattedDate}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.appointmentConfirmation.timeLabel')} ${appointmentTime}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.appointmentConfirmation.doctorLabel')} Dr. ${doctorName}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.appointmentConfirmation.clinicLabel')} ${clinicName || 'N/A'}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.appointmentConfirmation.addressLabel')} ${clinicAddress || 'N/A'}
      </div>
      <div style="padding: 10px 0;">
        ${t('emails.appointmentConfirmation.phoneLabel')} ${clinicPhone || 'N/A'}
      </div>
    </div>
    
    <p>${t('emails.appointmentConfirmation.recommendationsTitle')}</p>
    <ul>
      <li>${t('emails.appointmentConfirmation.rec1')}</li>
      <li>${t('emails.appointmentConfirmation.rec2')}</li>
      <li>${t('emails.appointmentConfirmation.rec3')}</li>
    </ul>
    
    <p>${t('emails.appointmentConfirmation.cancelNote')}</p>
    
    <p>${t('emails.appointmentConfirmation.closing')}</p>
  `;

  const html = getBaseTemplate(colors.secondary, t('emails.appointmentConfirmation.title'), content, language);
  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 7. RECORDATORIO 24H ANTES
// ============================================
exports.sendAppointmentReminder24h = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, language = 'es' } = appointmentData;
  
  const t = translate(language);
  const formattedDate = formatDate(appointmentDate, language);
  
  const subject = t('emails.appointmentReminder24h.subject', { doctorName });
  
  const content = `
    <h2>${t('common.greetingFormal', { name: patientName })}</h2>
    
    <div style="background: ${colors.warning}; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>${t('emails.appointmentReminder24h.reminderTitle')}</strong></p>
      <p style="font-size: 18px; margin: 10px 0;"><strong>${formattedDate} ${appointmentTime}</strong></p>
      <p style="margin: 0;">${t('emails.appointmentReminder24h.with', { doctorName })}</p>
    </div>
    
    <p>${t('emails.appointmentReminder24h.confirm')}</p>
    
    <p>${t('emails.appointmentReminder24h.closing')}</p>
  `;

  const html = getBaseTemplate(colors.warning, t('emails.appointmentReminder24h.title'), content, language);
  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 8. RECORDATORIO 2H ANTES
// ============================================
exports.sendAppointmentReminder2h = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentTime, language = 'es' } = appointmentData;
  
  const t = translate(language);
  
  const subject = t('emails.appointmentReminder2h.subject', { doctorName });
  
  const content = `
    <h2>${t('common.greetingFormal', { name: patientName })}</h2>
    
    <div style="background: ${colors.accent}; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
      <h3 style="margin: 0; color: #f44336;">${t('emails.appointmentReminder2h.urgentTitle')}</h3>
      <p style="font-size: 24px; margin: 10px 0;"><strong>${appointmentTime}</strong></p>
      <p style="margin: 0;">${t('emails.appointmentReminder2h.with', { doctorName })}</p>
    </div>
    
    <p>${t('emails.appointmentReminder2h.reminder')}</p>
    
    <p>${t('emails.appointmentReminder2h.closing')}</p>
  `;

  const html = getBaseTemplate(colors.accent, t('emails.appointmentReminder2h.title'), content, language);
  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 9. EMAIL CITA CANCELADA
// ============================================
exports.sendAppointmentCancelled = async (appointmentData) => {
  const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, cancellationReason, language = 'es' } = appointmentData;
  
  const t = translate(language);
  const formattedDate = formatDate(appointmentDate, language);
  
  const subject = t('emails.appointmentCancelled.subject', { doctorName });
  
  const content = `
    <h2>${t('common.greetingFormal', { name: patientName })}</h2>
    
    <div style="background: ${colors.accent}; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <p>${t('emails.appointmentCancelled.intro')}</p>
      <p>${t('emails.appointmentCancelled.dateLabel', { date: formattedDate })}</p>
      <p>${t('emails.appointmentCancelled.timeLabel', { time: appointmentTime })}</p>
      <p>${t('emails.appointmentCancelled.doctorLabel', { doctorName })}</p>
      ${cancellationReason ? `<p>${t('emails.appointmentCancelled.reasonLabel', { reason: cancellationReason })}</p>` : ''}
    </div>
    
    <p>${t('emails.appointmentCancelled.reschedule')}</p>
    
    <p>${t('emails.appointmentCancelled.apology')}</p>
    <p><strong>${t('emails.appointmentCancelled.closing', { doctorName })}</strong></p>
  `;

  const html = getBaseTemplate('#dc3545', t('emails.appointmentCancelled.title'), content, language);
  return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================
// 10. NUEVA CITA CREADA (AL MÉDICO)
// ============================================
exports.sendNewAppointmentNotification = async (appointmentData) => {
  const { doctorEmail, doctorName, patientName, appointmentDate, appointmentTime, reasonForVisit, language = 'es' } = appointmentData;
  
  const t = translate(language);
  const formattedDate = formatDate(appointmentDate, language);
  
  const subject = t('emails.newAppointment.subject', { patientName });
  
  const content = `
    <h2>${t('common.greetingDoctor', { name: doctorName })}</h2>
    <p>${t('emails.newAppointment.intro')}</p>
    
    <div style="background: white; border-left: 4px solid ${colors.primary}; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.newAppointment.patientLabel', { patientName })}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.newAppointment.dateLabel', { date: formattedDate })}
      </div>
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        ${t('emails.newAppointment.timeLabel', { time: appointmentTime })}
      </div>
      <div style="padding: 10px 0;">
        ${t('emails.newAppointment.reasonLabel', { reason: reasonForVisit || t('emails.newAppointment.noReason') })}
      </div>
    </div>
    
    <p>${t('emails.newAppointment.dashboard')}</p>
    
    <p>${t('common.salutation')}</p>
    <p><strong>${t('common.company')}</strong></p>
  `;

  const html = getBaseTemplate(colors.primary, t('emails.newAppointment.title'), content, language);
  return await sendEmail({ to: doctorEmail, subject, html });
};