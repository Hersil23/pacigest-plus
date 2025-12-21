const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, checkPermission } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');

// Todas las rutas protegidas (autenticación + suscripción)
router.use(protect);
router.use(checkSubscription);

// Rutas de pacientes
router.post('/', checkPermission('canCreatePatients'), patientController.createPatient);
router.get('/', checkPermission('canViewPatients'), patientController.getAllPatients);
router.get('/search', checkPermission('canViewPatients'), patientController.searchPatients);
router.get('/doctor/:doctorId', checkPermission('canViewPatients'), patientController.getPatientsByDoctor);
router.get('/:id', checkPermission('canViewPatients'), patientController.getPatientById);
router.put('/:id', checkPermission('canEditPatientContact'), patientController.updatePatient);
router.delete('/:id', checkPermission('canDeletePatients'), patientController.deletePatient);

module.exports = router;