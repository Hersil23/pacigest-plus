const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDemoData } = require('../utils/demoData');

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
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      specialty,
      licenseNumber,
      role
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
    const user = await User.create({
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
      subscription: {
        plan: 'starter',
        status: 'inactive',
        trialEndsAt: null
      }
    });

    // TODO: Aquí enviarías el email con el código
    // Por ahora, lo devolvemos en la respuesta para testing
    console.log(`📧 Código de verificación para ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      userId: user._id,
      email: user.email,
      verificationToken: verificationToken,
      note: 'Revisa tu email para el código de verificación'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// ============================================
// VERIFICAR EMAIL
// ============================================
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, verificationToken } = req.body;

    if (!userId || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona el ID de usuario y el código de verificación'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId);

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
    console.log('📦 Creando datos de ejemplo para nuevo usuario...');
    await createDemoData(user._id);

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
    res.status(500).json({
      success: false,
      message: 'Error al verificar email',
      error: error.message
    });
  }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
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

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR PERFIL
// ============================================
exports.updateProfile = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
exports.changePassword = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};