const MedicalRecord = require('../models/MedicalRecord');

// ============================================
// CREAR NUEVA HISTORIA CLÍNICA
// ============================================
exports.createMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Historia clínica creada exitosamente',
      data: medicalRecord
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear historia clínica',
      error: error.message
    });
  }
};

// ============================================
// OBTENER HISTORIAS CLÍNICAS POR PACIENTE
// ============================================
exports.getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find({ 
      patientId,
      isActive: true 
    })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .sort({ consultationDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await MedicalRecord.countDocuments({ 
      patientId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: records.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias clínicas',
      error: error.message
    });
  }
};

// ============================================
// OBTENER HISTORIAS CLÍNICAS POR MÉDICO
// ============================================
exports.getMedicalRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find({ 
      doctorId,
      isActive: true 
    })
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .sort({ consultationDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await MedicalRecord.countDocuments({ 
      doctorId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: records.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias clínicas del médico',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UNA HISTORIA CLÍNICA POR ID
// ============================================
exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialty phone email')
      .populate('patientId', 'firstName lastName dateOfBirth gender bloodType')
      .populate('attachments');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia clínica',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR HISTORIA CLÍNICA
// ============================================
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Historia clínica actualizada exitosamente',
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar historia clínica',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR HISTORIA CLÍNICA (SOFT DELETE)
// ============================================
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Historia clínica eliminada exitosamente',
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar historia clínica',
      error: error.message
    });
  }
};