const express = require('express');
const router = express.Router();
const medicalFileController = require('../controllers/medicalFileController');

// Rutas de archivos médicos
router.post('/', medicalFileController.createMedicalFile);                                          // Crear registro de archivo
router.get('/patient/:patientId', medicalFileController.getFilesByPatient);                         // Por paciente
router.get('/medical-record/:medicalRecordId', medicalFileController.getFilesByMedicalRecord);      // Por historia clínica
router.get('/patient/:patientId/category/:category', medicalFileController.getFilesByCategory);     // Por categoría
router.get('/:id', medicalFileController.getFileById);                                              // Obtener uno por ID
router.put('/:id', medicalFileController.updateMedicalFile);                                        // Actualizar
router.delete('/:id', medicalFileController.deleteMedicalFile);                                     // Eliminar (soft delete)

module.exports = router;