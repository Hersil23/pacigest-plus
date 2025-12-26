const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// ============================================
// OBTENER TODOS LOS PACIENTES DEL DOCTOR
// ============================================
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Query parameters para búsqueda y filtros
    const { search, status, page = 1, limit = 10 } = req.query;
    
    // Construir filtro
    const filter = {
      doctorIds: doctorId
    };
    
    // Búsqueda por nombre, apellido o email
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { medicalRecordNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por estado
    if (status) {
      filter.status = status;
    }
    
    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener pacientes
    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    // Contar total
    const total = await Patient.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UN PACIENTE POR ID
// ============================================
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;
    
    const patient = await Patient.findOne({
      _id: id,
      doctorIds: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

// ============================================
// CREAR NUEVO PACIENTE
// ============================================
exports.createPatient = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    
    const doctorId = req.user._id;
    
    // Verificar si ya existe un paciente con el mismo email
    const existingPatient = await Patient.findOne({
      email: req.body.email,
      doctorIds: doctorId
    });
    
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un paciente con este email'
      });
    }
    
    // Crear paciente
    const patient = new Patient({
      ...req.body,
      doctorIds: [doctorId]
    });
    
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR PACIENTE
// ============================================
exports.updatePatient = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const doctorId = req.user._id;
    
    // Buscar paciente
    const patient = await Patient.findOne({
      _id: id,
      doctorIds: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    // Verificar si el email ya existe en otro paciente
    if (req.body.email && req.body.email !== patient.email) {
      const existingPatient = await Patient.findOne({
        email: req.body.email,
        doctorIds: doctorId,
        _id: { $ne: id }
      });
      
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro paciente con este email'
        });
      }
    }
    
    // No permitir cambiar doctorIds ni deletedAt
    delete req.body.doctorIds;
    delete req.body.deletedAt;
    
    // Actualizar paciente
    Object.assign(patient, req.body);
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR PACIENTE (SOFT DELETE)
// ============================================
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;
    
    // Buscar paciente
    const patient = await Patient.findOne({
      _id: id,
      doctorIds: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    // Soft delete
    await patient.softDelete();
    
    res.status(200).json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente',
      error: error.message
    });
  }
};

// ============================================
// RESTAURAR PACIENTE
// ============================================
exports.restorePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;
    
    // Buscar paciente eliminado
    const patient = await Patient.findOne({
      _id: id,
      doctorIds: doctorId
    }).setOptions({ includeDeleted: true });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    if (!patient.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'El paciente no está eliminado'
      });
    }
    
    // Restaurar
    await patient.restore();
    
    res.status(200).json({
      success: true,
      message: 'Paciente restaurado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error al restaurar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar paciente',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ESTADÍSTICAS DE PACIENTES
// ============================================
exports.getPatientStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    const stats = {
      total: await Patient.countDocuments({ doctorIds: doctorId }),
      active: await Patient.countDocuments({ doctorIds: doctorId, status: 'active' }),
      inactive: await Patient.countDocuments({ doctorIds: doctorId, status: 'inactive' }),
      newThisMonth: await Patient.countDocuments({
        doctorIds: doctorId,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};