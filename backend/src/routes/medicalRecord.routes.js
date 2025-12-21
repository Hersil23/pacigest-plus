const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Rutas de historias clínicas
router.post('/', medicalRecordController.createMedicalRecord);                              // Crear historia clínica
router.get('/patient/:patientId', medicalRecordController.getMedicalRecordsByPatient);      // Por paciente
router.get('/doctor/:doctorId', medicalRecordController.getMedicalRecordsByDoctor);         // Por médico
router.get('/:id', medicalRecordController.getMedicalRecordById);                           // Obtener una por ID
router.put('/:id', medicalRecordController.updateMedicalRecord);                            // Actualizar
router.delete('/:id', medicalRecordController.deleteMedicalRecord);                         // Eliminar (soft delete)

module.exports = router;