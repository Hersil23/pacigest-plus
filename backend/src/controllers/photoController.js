const Patient = require('../models/Patient');
const { uploadFile, deleteFile } = require('../utils/bunnyStorage');
const logger = require('../utils/logger');

// ============================================
// SUBIR FOTO DEL PACIENTE
// ============================================
exports.uploadPatientPhoto = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { photoData } = req.body; // base64 image

    if (!photoData) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la foto'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Eliminar foto anterior si existe
    if (patient.patientPhoto) {
      try {
        await deleteFile(patient.patientPhoto);
      } catch (error) {
        logger.logError('Error eliminando foto anterior', error);
      }
    }

    // Subir nueva foto a Bunny.NET
    const fileName = `patient-${patientId}.jpg`;
    const folder = `patients/${patientId}`;
    const photoUrl = await uploadFile(photoData, fileName, folder);

    // Actualizar base de datos
    patient.patientPhoto = photoUrl;
    await patient.save();

    logger.logInfo(`Foto de paciente subida: ${patientId}`);

    res.status(200).json({
      success: true,
      message: 'Foto subida exitosamente',
      photoUrl
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// SUBIR FOTOS CLÍNICAS (MÚLTIPLES)
// ============================================
exports.uploadClinicalPhotos = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { photos } = req.body; // Array de { photoData, description }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron fotos'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const uploadedPhotos = [];
    const folder = `patients/${patientId}/clinical`;

    // Subir cada foto
    for (let i = 0; i < photos.length; i++) {
      const { photoData, description } = photos[i];
      
      if (!photoData) continue;

      try {
        const fileName = `clinical-${i + 1}-${Date.now()}.jpg`;
        const photoUrl = await uploadFile(photoData, fileName, folder);

        uploadedPhotos.push({
          url: photoUrl,
          description: description || '',
          uploadedAt: new Date()
        });
      } catch (error) {
        logger.logError(`Error subiendo foto clínica ${i + 1}`, error);
      }
    }

    // Agregar a las fotos existentes
    patient.clinicalPhotos.push(...uploadedPhotos);
    await patient.save();

    logger.logInfo(`${uploadedPhotos.length} fotos clínicas subidas para paciente: ${patientId}`);

    res.status(200).json({
      success: true,
      message: `${uploadedPhotos.length} fotos subidas exitosamente`,
      photos: uploadedPhotos
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// ELIMINAR FOTO CLÍNICA
// ============================================
exports.deleteClinicalPhoto = async (req, res, next) => {
  try {
    const { patientId, photoId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Buscar la foto en el array
    const photoIndex = patient.clinicalPhotos.findIndex(
      photo => photo._id.toString() === photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    const photoUrl = patient.clinicalPhotos[photoIndex].url;

    // Eliminar de Bunny.NET
    try {
      await deleteFile(photoUrl);
    } catch (error) {
      logger.logError('Error eliminando foto de Bunny.NET', error);
    }

    // Eliminar del array
    patient.clinicalPhotos.splice(photoIndex, 1);
    await patient.save();

    logger.logInfo(`Foto clínica eliminada: ${photoId} del paciente: ${patientId}`);

    res.status(200).json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// SUBIR FIRMA DIGITAL
// ============================================
exports.uploadSignature = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { signatureData } = req.body; // base64 image

    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la firma'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Eliminar firma anterior si existe
    if (patient.signature) {
      try {
        await deleteFile(patient.signature);
      } catch (error) {
        logger.logError('Error eliminando firma anterior', error);
      }
    }

    // Subir nueva firma a Bunny.NET
    const fileName = `signature-${patientId}.png`;
    const folder = `patients/${patientId}`;
    const signatureUrl = await uploadFile(signatureData, fileName, folder);

    // Actualizar base de datos
    patient.signature = signatureUrl;
    await patient.save();

    logger.logInfo(`Firma digital subida: ${patientId}`);

    res.status(200).json({
      success: true,
      message: 'Firma subida exitosamente',
      signatureUrl
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// ELIMINAR FOTO DEL PACIENTE
// ============================================
exports.deletePatientPhoto = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    if (!patient.patientPhoto) {
      return res.status(400).json({
        success: false,
        message: 'El paciente no tiene foto'
      });
    }

    // Eliminar de Bunny.NET
    try {
      await deleteFile(patient.patientPhoto);
    } catch (error) {
      logger.logError('Error eliminando foto de Bunny.NET', error);
    }

    // Eliminar de base de datos
    patient.patientPhoto = null;
    await patient.save();

    logger.logInfo(`Foto del paciente eliminada: ${patientId}`);

    res.status(200).json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};