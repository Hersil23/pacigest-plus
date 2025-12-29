const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams para acceder a :patientId
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

// ============================================
// CREAR NUEVA CONSULTA
// POST /api/patients/:patientId/consultations
// ============================================
router.post('/', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const consultationData = req.body;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar que el doctor tenga acceso al paciente
    if (!patient.doctorIds.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para agregar consultas a este paciente'
      });
    }

    // Agregar consulta al array
    patient.consultations.push({
      ...consultationData,
      consultationDate: consultationData.consultationDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await patient.save();

    // Obtener la consulta recién creada
    const newConsultation = patient.consultations[patient.consultations.length - 1];

    res.status(201).json({
      success: true,
      data: newConsultation
    });
  } catch (error) {
    console.error('Error al crear consulta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear consulta'
    });
  }
});

// ============================================
// OBTENER TODAS LAS CONSULTAS DE UN PACIENTE
// GET /api/patients/:patientId/consultations
// ============================================
router.get('/', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10 } = req.query;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar que el doctor tenga acceso al paciente
    if (!patient.doctorIds.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver las consultas de este paciente'
      });
    }

    // Ordenar por fecha más reciente primero y limitar resultados
    const consultations = patient.consultations
      .sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate))
      .slice(0, limit === 'all' ? patient.consultations.length : parseInt(limit));

    res.status(200).json({
      success: true,
      count: consultations.length,
      total: patient.consultations.length,
      data: consultations
    });
  } catch (error) {
    console.error('Error al obtener consultas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener consultas'
    });
  }
});

// ============================================
// OBTENER UNA CONSULTA ESPECÍFICA
// GET /api/patients/:patientId/consultations/:consultationId
// ============================================
router.get('/:consultationId', protect, async (req, res) => {
  try {
    const { patientId, consultationId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar que el doctor tenga acceso al paciente
    if (!patient.doctorIds.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver las consultas de este paciente'
      });
    }

    const consultation = patient.consultations.id(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Error al obtener consulta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener consulta'
    });
  }
});

// ============================================
// ACTUALIZAR CONSULTA
// PUT /api/patients/:patientId/consultations/:consultationId
// ============================================
router.put('/:consultationId', protect, async (req, res) => {
  try {
    const { patientId, consultationId } = req.params;
    const updateData = req.body;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar que el doctor tenga acceso al paciente
    if (!patient.doctorIds.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar las consultas de este paciente'
      });
    }

    const consultation = patient.consultations.id(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        consultation[key] = updateData[key];
      }
    });

    consultation.updatedAt = new Date();

    await patient.save();

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Error al actualizar consulta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar consulta'
    });
  }
});

// ============================================
// ELIMINAR CONSULTA
// DELETE /api/patients/:patientId/consultations/:consultationId
// ============================================
router.delete('/:consultationId', protect, async (req, res) => {
  try {
    const { patientId, consultationId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar que el doctor tenga acceso al paciente
    if (!patient.doctorIds.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar las consultas de este paciente'
      });
    }

    const consultation = patient.consultations.id(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    // Eliminar consulta del array
    consultation.deleteOne();

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar consulta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar consulta'
    });
  }
});

module.exports = router;