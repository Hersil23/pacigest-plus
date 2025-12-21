const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, checkPermission } = require('../middlewares/auth');

// Todas las rutas protegidas
router.use(protect);

// Rutas de citas (requieren permiso)
router.post('/', checkPermission('canScheduleAppointments'), appointmentController.createAppointment);
router.get('/', checkPermission('canScheduleAppointments'), appointmentController.getAllAppointments);
router.get('/doctor/:doctorId', checkPermission('canScheduleAppointments'), appointmentController.getAppointmentsByDoctor);
router.get('/patient/:patientId', checkPermission('canScheduleAppointments'), appointmentController.getAppointmentsByPatient);
router.get('/today/:doctorId', checkPermission('canScheduleAppointments'), appointmentController.getTodaySchedule);
router.get('/:id', checkPermission('canScheduleAppointments'), appointmentController.getAppointmentById);
router.put('/:id', checkPermission('canScheduleAppointments'), appointmentController.updateAppointment);
router.patch('/:id/confirm', checkPermission('canScheduleAppointments'), appointmentController.confirmAppointment);
router.patch('/:id/cancel', checkPermission('canScheduleAppointments'), appointmentController.cancelAppointment);
router.patch('/:id/complete', checkPermission('canScheduleAppointments'), appointmentController.completeAppointment);
router.delete('/:id', checkPermission('canScheduleAppointments'), appointmentController.deleteAppointment);

module.exports = router;