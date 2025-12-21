const Patient = require('../models/Patient');

// ============================================
// CREAR NUEVO PACIENTE
// ============================================
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: patient
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message
    });
  }
};

// ============================================
// OBTENER TODOS LOS PACIENTES (CON PAGINACIÓN)
// ============================================
exports.getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const patients = await Patient.find({ isActive: true })
      .populate('doctorIds', 'firstName lastName specialty')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Patient.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: patients.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: patients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

// ============================================
// OBTENER PACIENTES POR MÉDICO
// ============================================
exports.getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const patients = await Patient.find({ 
      doctorIds: doctorId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Patient.countDocuments({ 
      doctorIds: doctorId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: patients.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: patients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes del médico',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UN PACIENTE POR ID
// ============================================
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('doctorIds', 'firstName lastName specialty phone email');

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
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR PACIENTE
// ============================================
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: patient
    });

  } catch (error) {
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
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        status: 'inactive'
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Paciente desactivado exitosamente',
      data: patient
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente',
      error: error.message
    });
  }
};

// ============================================
// BUSCAR PACIENTES
// ============================================
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona un término de búsqueda'
      });
    }

    const patients = await Patient.find({
      isActive: true,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { medicalRecordNumber: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('doctorIds', 'firstName lastName specialty')
      .limit(20);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar pacientes',
      error: error.message
    });
  }
};