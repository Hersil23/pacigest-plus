const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// ============================================
// FORMATO DE LOGS
// ============================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// ============================================
// CONFIGURACIÓN DE ROTACIÓN DIARIA
// ============================================
const dailyRotateFileTransport = (filename, level) => {
  return new DailyRotateFile({
    filename: path.join('logs', `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    level: level,
    maxSize: '20m', // Máximo 20MB por archivo
    maxFiles: '14d', // Mantener logs por 14 días
    format: logFormat
  });
};

// ============================================
// CREAR LOGGER
// ============================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Logs de información general
    dailyRotateFileTransport('info', 'info'),
    
    // Solo errores
    dailyRotateFileTransport('error', 'error'),
    
    // Logs de auditoría (acciones importantes)
    dailyRotateFileTransport('audit', 'info'),
    
    // Logs combinados (todos los niveles)
    dailyRotateFileTransport('combined', 'debug')
  ]
});

// ============================================
// CONSOLE LOGS EN DESARROLLO
// ============================================
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    )
  }));
}

// ============================================
// FUNCIONES HELPER
// ============================================

// Log de información
logger.logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

// Log de error
logger.logError = (message, error = null, meta = {}) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, meta);
  }
};

// Log de warning
logger.logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

// Log de auditoría (acciones importantes del usuario)
logger.logAudit = (action, userId, details = {}) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de autenticación
logger.logAuth = (action, userId, success, details = {}) => {
  const message = `AUTH: ${action} - ${success ? 'SUCCESS' : 'FAILED'}`;
  logger.info(message, {
    userId,
    action,
    success,
    ...details
  });
};

// Log de email
logger.logEmail = (to, subject, success, error = null) => {
  const message = `EMAIL: ${subject} to ${to} - ${success ? 'SENT' : 'FAILED'}`;
  if (success) {
    logger.info(message);
  } else {
    logger.error(message, { error: error?.message });
  }
};

// Log de API request
logger.logRequest = (method, url, userId, statusCode, duration) => {
  logger.info(`API: ${method} ${url}`, {
    method,
    url,
    userId,
    statusCode,
    duration: `${duration}ms`
  });
};

module.exports = logger;