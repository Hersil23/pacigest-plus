const express = require('express');
const router = express.Router();
const medicalFileController = require('../controllers/medicalFileController');
const { protect, checkPermission } = require('../middlewares/auth');

// Todas las rutas protegidas
router.use(protect);

// Rutas de archivos médicos (requieren permiso)
router.post('/', checkPermission('canViewMedicalRecords'), medicalFileController.createMedicalFile);
router.get('/patient/:patientId', checkPermission('canViewMedicalRecords'), medicalFileController.getFilesByPatient);
router.get('/medical-record/:medicalRecordId', checkPermission('canViewMedicalRecords'), medicalFileController.getFilesByMedicalRecord);
router.get('/patient/:patientId/category/:category', checkPermission('canViewMedicalRecords'), medicalFileController.getFilesByCategory);
router.get('/:id', checkPermission('canViewMedicalRecords'), medicalFileController.getFileById);
router.put('/:id', checkPermission('canEditMedicalRecords'), medicalFileController.updateMedicalFile);
router.delete('/:id', checkPermission('canEditMedicalRecords'), medicalFileController.deleteMedicalFile);

module.exports = router;