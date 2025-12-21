const MedicalFile = require('../models/MedicalFile');

// ============================================
// CREAR NUEVO ARCHIVO MÉDICO
// ============================================
exports.createMedicalFile = async (req, res) => {
  try {
    const medicalFile = await MedicalFile.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Archivo médico registrado exitosamente',
      data: medicalFile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar archivo médico',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ARCHIVOS POR PACIENTE
// ============================================
exports.getFilesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const files = await MedicalFile.find({ 
      patientId,
      isActive: true 
    })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ uploadDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await MedicalFile.countDocuments({ 
      patientId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: files.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: files
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos del paciente',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ARCHIVOS POR HISTORIA CLÍNICA
// ============================================
exports.getFilesByMedicalRecord = async (req, res) => {
  try {
    const { medicalRecordId } = req.params;

    const files = await MedicalFile.find({ 
      medicalRecordId,
      isActive: true 
    })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos de la historia clínica',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ARCHIVOS POR CATEGORÍA
// ============================================
exports.getFilesByCategory = async (req, res) => {
  try {
    const { patientId, category } = req.params;

    const files = await MedicalFile.find({ 
      patientId,
      category,
      isActive: true 
    })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos por categoría',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UN ARCHIVO POR ID
// ============================================
exports.getFileById = async (req, res) => {
  try {
    const file = await MedicalFile.findById(req.params.id)
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .populate('doctorId', 'firstName lastName specialty')
      .populate('uploadedBy', 'firstName lastName')
      .populate('medicalRecordId');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivo',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR ARCHIVO
// ============================================
exports.updateMedicalFile = async (req, res) => {
  try {
    const file = await MedicalFile.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Archivo actualizado exitosamente',
      data: file
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar archivo',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR ARCHIVO (SOFT DELETE)
// ============================================
exports.deleteMedicalFile = async (req, res) => {
  try {
    const file = await MedicalFile.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // TODO: Aquí también se debería eliminar el archivo de bunny.net
    // Implementar cuando se configure bunny.net

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente',
      data: file
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
};