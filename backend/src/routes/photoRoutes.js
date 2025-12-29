const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { protect } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(protect);

// ============================================
// RUTAS DE FOTOS
// ============================================

// Foto del paciente
router.post('/patients/:patientId/photo', photoController.uploadPatientPhoto);
router.delete('/patients/:patientId/photo', photoController.deletePatientPhoto);

// Fotos clínicas (múltiples)
router.post('/patients/:patientId/clinical-photos', photoController.uploadClinicalPhotos);
router.delete('/patients/:patientId/clinical-photos/:photoId', photoController.deleteClinicalPhoto);

// Firma digital
router.post('/patients/:patientId/signature', photoController.uploadSignature);

module.exports = router;