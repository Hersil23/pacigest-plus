const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Rutas de recetas médicas
router.post('/', prescriptionController.createPrescription);                              // Crear receta
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);      // Por paciente
router.get('/doctor/:doctorId', prescriptionController.getPrescriptionsByDoctor);         // Por médico
router.get('/:id', prescriptionController.getPrescriptionById);                           // Obtener una por ID
router.put('/:id', prescriptionController.updatePrescription);                            // Actualizar
router.patch('/:id/cancel', prescriptionController.cancelPrescription);                   // Cancelar receta
router.delete('/:id', prescriptionController.deletePrescription);                         // Eliminar (soft delete)

module.exports = router;