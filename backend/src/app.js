const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 PaciGest Plus API is running!',
    version: '1.0.0'
  });
});
// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Rutas
const userRoutes = require('./routes/user.routes');
const patientRoutes = require('./routes/patient.routes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);

module.exports = app;