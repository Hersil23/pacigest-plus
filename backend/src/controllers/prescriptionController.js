const Prescription = require('../models/Prescription');

// ============================================
// CREAR NUEVA RECETA
// ============================================
exports.createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear receta',
      error: error.message
    });
  }
};

// ============================================
// OBTENER RECETAS POR PACIENTE
// ============================================
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find({ 
      patientId,
      isActive: true 
    })
      .populate('doctorId', 'firstName lastName specialty licenseNumber')
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .sort({ prescriptionDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Prescription.countDocuments({ 
      patientId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: prescriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas del paciente',
      error: error.message
    });
  }
};

// ============================================
// OBTENER RECETAS POR MÉDICO
// ============================================
exports.getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find({ 
      doctorId,
      isActive: true 
    })
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .sort({ prescriptionDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Prescription.countDocuments({ 
      doctorId,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: prescriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas del médico',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UNA RECETA POR ID
// ============================================
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialty licenseNumber phone email clinic')
      .populate('patientId', 'firstName lastName dateOfBirth gender bloodType medicalRecordNumber')
      .populate('medicalRecordId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener receta',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR RECETA
// ============================================
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Receta actualizada exitosamente',
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar receta',
      error: error.message
    });
  }
};

// ============================================
// CANCELAR RECETA
// ============================================
exports.cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        isValid: false
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Receta cancelada exitosamente',
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar receta',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR RECETA (SOFT DELETE)
// ============================================
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Receta eliminada exitosamente',
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar receta',
      error: error.message
    });
  }
};