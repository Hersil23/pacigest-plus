const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Rutas de pacientes
router.post('/', patientController.createPatient);                          // Crear paciente
router.get('/', patientController.getAllPatients);                          // Obtener todos (con paginación)
router.get('/search', patientController.searchPatients);                    // Buscar pacientes
router.get('/doctor/:doctorId', patientController.getPatientsByDoctor);     // Pacientes por médico
router.get('/:id', patientController.getPatientById);                       // Obtener uno por ID
router.put('/:id', patientController.updatePatient);                        // Actualizar
router.delete('/:id', patientController.deletePatient);                     // Eliminar (soft delete)

module.exports = router;