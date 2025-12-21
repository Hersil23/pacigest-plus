const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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

  // ============================================
  // CONSULTA
  // ============================================
  consultationDate: {
    type: Date,
    required: [true, 'La fecha de consulta es obligatoria'],
    default: Date.now
  },
  reasonForVisit: {
    type: String,
    required: [true, 'El motivo de visita es obligatorio'],
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],

  // ============================================
  // SIGNOS VITALES
  // ============================================
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      display: String  // "120/80"
    },
    heartRate: {
      type: Number,
      min: 0,
      max: 300
    },
    temperature: {
      type: Number,
      min: 30,
      max: 45
    },
    weight: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    oxygenSaturation: {
      type: Number,
      min: 0,
      max: 100
    },
    respiratoryRate: {
      type: Number,
      min: 0
    }
  },

  // ============================================
  // DIAGNÓSTICO Y TRATAMIENTO
  // ============================================
  diagnosis: {
    type: String,
    required: [true, 'El diagnóstico es obligatorio'],
    trim: true
  },
  icdCode: {
    type: String,
    trim: true
  },
  treatment: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },

  // ============================================
  // ARCHIVOS ADJUNTOS
  // ============================================
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalFile'
  }],

  // ============================================
  // ESTADO
  // ============================================
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'cancelled'],
    default: 'completed'
  },
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
medicalRecordSchema.index({ patientId: 1, consultationDate: -1 });
medicalRecordSchema.index({ doctorId: 1, consultationDate: -1 });
medicalRecordSchema.index({ createdAt: -1 });

// ============================================
// MÉTODO VIRTUAL PARA IMC
// ============================================
medicalRecordSchema.virtual('bmi').get(function() {
  if (!this.vitalSigns.weight || !this.vitalSigns.height) return null;
  const heightInMeters = this.vitalSigns.height / 100;
  return (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2);
});

medicalRecordSchema.set('toJSON', { virtuals: true });
medicalRecordSchema.set('toObject', { virtuals: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;