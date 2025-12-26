const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDemoData } = require('../utils/demoData');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// ============================================
// GENERAR TOKEN JWT
// ============================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// ============================================
// REGISTRAR NUEVO USUARIO
// ============================================
exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      specialty,
      licenseNumber,
      role,
      language,
      subscription
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar código de verificación (6 dígitos)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear usuario CON trial INACTIVO hasta que verifique email
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      specialty,
      licenseNumber,
      role: role || 'doctor',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      preferences: {
        language: language || 'es'
      },
      subscription: {
        plan: subscription?.plan || 'trial',
        billingCycle: subscription?.billingCycle || 'monthly',
        status: 'inactive',
        trialEndsAt: null
      }
    });

    // Guardar usuario
    await user.save();

    // Enviar email de verificación
    await sendVerificationEmail(email, firstName, verificationToken, user.preferences.language);
    logger.logEmail(email, 'Verificación de email', true);
    logger.logInfo(`Usuario registrado: ${email}`, { userId: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      userId: user._id,
      email: user.email,
      // SOLO PARA TESTING - Quitar en producción
      verificationToken: verificationToken,
      note: 'Revisa tu email para el código de verificación'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// VERIFICAR EMAIL
// ============================================
exports.verifyEmail = async (req, res, next) => {
  try {
    const { userId, verificationToken } = req.body;
    
    console.log('🔍 DEBUG - Verificación recibida:');
    console.log('  userId recibido:', userId);
    console.log('  token recibido:', verificationToken);
    console.log('  tipo userId:', typeof userId);
    console.log('  tipo token:', typeof verificationToken);

    if (!userId || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona el ID de usuario y el código de verificación'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId)
      .select('+emailVerificationToken +emailVerificationExpires');
    
    console.log('🔍 Usuario encontrado:', user ? 'SÍ' : 'NO');
    if (user) {
      console.log('  Token en BD:', user.emailVerificationToken);
      console.log('  Token expiró:', user.emailVerificationExpires);
      console.log('  Fecha actual:', new Date());
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya ha sido verificado'
      });
    }

    // Verificar si el token expiró
    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Verificar código
    if (user.emailVerificationToken !== verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido'
      });
    }

    // ACTIVAR USUARIO Y TRIAL
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.subscription.status = 'trial';
    user.subscription.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    user.subscription.startDate = new Date();

    // Activar todos los permisos para médicos
    if (user.role === 'doctor') {
      user.permissions = {
        canViewPatients: true,
        canCreatePatients: true,
        canEditPatientContact: true,
        canScheduleAppointments: true,
        canViewMedicalRecords: true,
        canEditMedicalRecords: true,
        canViewPrescriptions: true,
        canDeletePatients: true,
        canManageSettings: true
      };
    }

    await user.save();

    // Crear datos de ejemplo
    logger.logInfo(`Creando datos de ejemplo para usuario: ${user._id}`);
    await createDemoData(user._id);

    // Enviar email de bienvenida
    await sendWelcomeEmail(user.email, user.firstName, user.subscription.trialEndsAt, user.preferences.language);
    logger.logEmail(user.email, 'Email de bienvenida', true);
    logger.logAudit('EMAIL_VERIFIED', user._id, { email: user.email, trialEndsAt: user.subscription.trialEndsAt });

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: '¡Email verificado exitosamente! Tu período de prueba de 7 días ha comenzado.',
      token,
      data: user,
      trialEndsAt: user.subscription.trialEndsAt
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador'
      });
    }

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Por favor verifica tu email antes de iniciar sesión',
        code: 'EMAIL_NOT_VERIFIED',
        userId: user._id
      });
    }

    user.lastLogin = new Date();
    await user.save();
    logger.logAuth('LOGIN', user._id, true, { email: user.email });
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// ACTUALIZAR PERFIL
// ============================================
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      secondName: req.body.secondName,
      lastName: req.body.lastName,
      secondLastName: req.body.secondLastName,
      phone: req.body.phone,
      specialty: req.body.specialty,
      licenseNumber: req.body.licenseNumber,
      consultationFee: req.body.consultationFee,
      availability: req.body.availability,
      clinic: req.body.clinic,
      preferences: req.body.preferences,
      profilePhotoUrl: req.body.profilePhotoUrl,
      permissions: req.body.permissions
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona la contraseña actual y la nueva'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona tu email'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // Generar código de 6 dígitos
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar en BD
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Enviar email
    const { sendPasswordResetEmail } = require('../utils/emailService');
    await sendPasswordResetEmail(email, user.firstName, resetToken, user.preferences.language);
    logger.logEmail(email, 'Recuperación de contraseña', true);
    logger.logInfo(`Solicitud de recuperación de contraseña: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      // SOLO PARA TESTING - Quitar en producción
      resetToken: resetToken
    });

  } catch (error) {
    logger.logError('Error en forgot password', error);
    next(error);
  }
};

// ============================================
// RESTABLECER CONTRASEÑA
// ============================================
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email, código y nueva contraseña'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Verificar si el token expiró
    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Verificar código
    if (user.passwordResetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Cambiar contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.logAudit('PASSWORD_RESET', user._id, { email: user.email });
    logger.logInfo(`Contraseña restablecida exitosamente: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
    });

  } catch (error) {
    logger.logError('Error en reset password', error);
    next(error);
  }
};