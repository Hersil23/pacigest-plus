require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { setupCronJobs } = require('./src/jobs/cronJobs');

// Crear aplicación Express
const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// CONECTAR A BASE DE DATOS
// ============================================
connectDB();

// ============================================
// RUTA DE BIENVENIDA
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a PaciGest Plus API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      patients: '/api/patients',
      appointments: '/api/appointments',
      medicalRecords: '/api/medical-records',
      prescriptions: '/api/prescriptions',
      medicalFiles: '/api/medical-files',
      stats: '/api/stats',
      dashboard: '/api/dashboard'
    }
  });
});

// ============================================
// RUTAS DEL API
// ============================================
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/patients', require('./src/routes/patient.routes'));
app.use('/api/appointments', require('./src/routes/appointment.routes'));
app.use('/api/medical-records', require('./src/routes/medicalRecord.routes'));
app.use('/api/prescriptions', require('./src/routes/prescription.routes'));
app.use('/api/medical-files', require('./src/routes/medicalFile.routes'));
app.use('/api/stats', require('./src/routes/stats.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));// ← NUEVA RUTA
app.use('/api/photos', require('./src/routes/photoRoutes')); 

// ============================================
// MANEJO DE ERRORES 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ============================================
// MANEJO GLOBAL DE ERRORES
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Iniciar Cron Jobs
setupCronJobs();

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  server.close(() => process.exit(1));
});

module.exports = app;