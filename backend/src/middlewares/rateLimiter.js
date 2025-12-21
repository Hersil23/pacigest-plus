const rateLimit = require('express-rate-limit');

// ============================================
// LIMITADOR GENERAL DEL API
// ============================================
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// LIMITADOR ESTRICTO PARA AUTENTICACIÓN
// ============================================
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS'
  },
  skipSuccessfulRequests: true, // No cuenta requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// LIMITADOR PARA REGISTRO
// ============================================
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 registros por hora
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP. Por favor intenta de nuevo en 1 hora.',
    code: 'TOO_MANY_REGISTRATIONS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// LIMITADOR PARA ENVÍO DE EMAILS
// ============================================
exports.emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 emails por hora
  message: {
    success: false,
    message: 'Demasiados emails enviados. Por favor intenta de nuevo en 1 hora.',
    code: 'TOO_MANY_EMAILS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// LIMITADOR PARA CREACIÓN DE RECURSOS
// ============================================
exports.createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 creaciones por minuto
  message: {
    success: false,
    message: 'Estás creando recursos muy rápido. Por favor espera un momento.',
    code: 'TOO_MANY_CREATES'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// LIMITADOR PARA RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 intentos por hora
  message: {
    success: false,
    message: 'Demasiados intentos de recuperación de contraseña. Por favor intenta de nuevo en 1 hora.',
    code: 'TOO_MANY_PASSWORD_RESETS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});