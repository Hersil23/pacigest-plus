const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, checkPermission } = require('../middlewares/auth');

// Todas las rutas protegidas
router.use(protect);

// Rutas de recetas médicas (requieren permiso)
router.post('/', checkPermission('canViewPrescriptions'), prescriptionController.createPrescription);
router.get('/patient/:patientId', checkPermission('canViewPrescriptions'), prescriptionController.getPrescriptionsByPatient);
router.get('/doctor/:doctorId', checkPermission('canViewPrescriptions'), prescriptionController.getPrescriptionsByDoctor);
router.get('/:id', checkPermission('canViewPrescriptions'), prescriptionController.getPrescriptionById);
router.put('/:id', checkPermission('canViewPrescriptions'), prescriptionController.updatePrescription);
router.patch('/:id/cancel', checkPermission('canViewPrescriptions'), prescriptionController.cancelPrescription);
router.delete('/:id', checkPermission('canViewPrescriptions'), prescriptionController.deletePrescription);

module.exports = router;