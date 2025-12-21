const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { protect, checkPermission } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');

// Todas las rutas protegidas (autenticación + suscripción)
router.use(protect);
router.use(checkSubscription);

// Rutas de historias clínicas (requieren permiso)
router.post('/', checkPermission('canEditMedicalRecords'), medicalRecordController.createMedicalRecord);
router.get('/patient/:patientId', checkPermission('canViewMedicalRecords'), medicalRecordController.getMedicalRecordsByPatient);
router.get('/doctor/:doctorId', checkPermission('canViewMedicalRecords'), medicalRecordController.getMedicalRecordsByDoctor);
router.get('/:id', checkPermission('canViewMedicalRecords'), medicalRecordController.getMedicalRecordById);
router.put('/:id', checkPermission('canEditMedicalRecords'), medicalRecordController.updateMedicalRecord);
router.delete('/:id', checkPermission('canEditMedicalRecords'), medicalRecordController.deleteMedicalRecord);

module.exports = router;