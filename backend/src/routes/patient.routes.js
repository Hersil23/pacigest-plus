const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const patientController = require('../controllers/patientController');
const { protect, checkPermission } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');

// ============================================
// VALIDACIONES
// ============================================
const patientValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('Fecha inválida'),
  
  body('gender')
    .notEmpty().withMessage('El género es obligatorio')
    .isIn(['M', 'F']).withMessage('El género debe ser M o F'),
  
  body('bloodType')
    .notEmpty().withMessage('El tipo de sangre es obligatorio')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo de sangre inválido')
];

const patientUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Fecha inválida'),
  
  body('gender')
    .optional()
    .isIn(['M', 'F']).withMessage('El género debe ser M o F'),
  
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo de sangre inválido')
];

// ============================================
// TODAS LAS RUTAS PROTEGIDAS
// ============================================
router.use(protect);
router.use(checkSubscription);

// ============================================
// RUTAS DE PACIENTES
// ============================================

// Estadísticas de pacientes
router.get('/stats', checkPermission('canViewPatients'), patientController.getPatientStats);

// Obtener todos los pacientes (con búsqueda, filtros y paginación)
// Soporta: ?search=juan&status=active&page=1&limit=10
router.get('/', checkPermission('canViewPatients'), patientController.getPatients);

// Obtener un paciente por ID
router.get('/:id', checkPermission('canViewPatients'), patientController.getPatientById);

// Crear nuevo paciente
router.post('/', checkPermission('canCreatePatients'), patientValidation, patientController.createPatient);

// Actualizar paciente
router.put('/:id', checkPermission('canEditPatientContact'), patientUpdateValidation, patientController.updatePatient);

// Eliminar paciente (soft delete)
router.delete('/:id', checkPermission('canDeletePatients'), patientController.deletePatient);

// Restaurar paciente eliminado
router.patch('/:id/restore', checkPermission('canDeletePatients'), patientController.restorePatient);

module.exports = router;