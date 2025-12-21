const mongoose = require('mongoose');

const medicalFileSchema = new mongoose.Schema({
  // ============================================
  // RELACIONES
  // ============================================
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es obligatorio']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del médico es obligatorio']
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },

  // ============================================
  // INFORMACIÓN DEL ARCHIVO
  // ============================================
  fileName: {
    type: String,
    required: [true, 'El nombre del archivo es obligatorio'],
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'document', 'other'],
    required: [true, 'El tipo de archivo es obligatorio']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },

  // ============================================
  // UBICACIÓN EN BUNNY.NET
  // ============================================
  bunnyUrl: {
    type: String,
    required: [true, 'La URL de bunny.net es obligatoria']
  },
  bunnyPath: {
    type: String,
    required: true
  },

  // ============================================
  // CATEGORIZACIÓN
  // ============================================
  category: {
    type: String,
    enum: [
      'lab-results',        // Resultados de laboratorio
      'imaging',            // Imágenes médicas (rayos X, TAC, etc.)
      'prescription',       // Recetas escaneadas
      'consent-form',       // Formularios de consentimiento
      'insurance',          // Documentos de seguro
      'referral',           // Referencias médicas
      'patient-photo',      // Fotos del paciente
      'other'
    ],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],

  // ============================================
  // METADATA
  // ============================================
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // ============================================
  // ESTADO
  // ============================================
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
medicalFileSchema.index({ patientId: 1, uploadDate: -1 });
medicalFileSchema.index({ doctorId: 1, uploadDate: -1 });
medicalFileSchema.index({ medicalRecordId: 1 });
medicalFileSchema.index({ category: 1 });
medicalFileSchema.index({ createdAt: -1 });

const MedicalFile = mongoose.model('MedicalFile', medicalFileSchema);

module.exports = MedicalFile;