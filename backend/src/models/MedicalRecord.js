const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

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
  },

  // ============================================
  // SOFT DELETE
  // ============================================
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ============================================
// MIDDLEWARE PARA SOFT DELETE
// ============================================
// Excluir registros eliminados en queries automáticamente
//medicalRecordSchema.pre(/^find/, function(next) {
 // if (!this.getOptions().includeDeleted) {
 //   this.where({ deletedAt: null });
 // }
  //next();
//});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
medicalRecordSchema.index({ patientId: 1, consultationDate: -1 });
medicalRecordSchema.index({ doctorId: 1, consultationDate: -1 });
medicalRecordSchema.index({ createdAt: -1 });
medicalRecordSchema.index({ deletedAt: 1 });

// ============================================
// MÉTODO VIRTUAL PARA IMC
// ============================================
medicalRecordSchema.virtual('bmi').get(function() {
  if (!this.vitalSigns.weight || !this.vitalSigns.height) return null;
  const heightInMeters = this.vitalSigns.height / 100;
  return (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2);
});

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================
// Soft delete
medicalRecordSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

// Restaurar
medicalRecordSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.isActive = true;
  return await this.save();
};

// Force delete (eliminar permanentemente)
medicalRecordSchema.methods.forceDelete = async function() {
  return await this.deleteOne();
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Encontrar solo eliminados
medicalRecordSchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, deletedAt: { $ne: null } });
};

// Encontrar incluyendo eliminados
medicalRecordSchema.statics.findWithDeleted = function(filter = {}) {
  return this.find(filter).setOptions({ includeDeleted: true });
};

medicalRecordSchema.set('toJSON', { virtuals: true });
medicalRecordSchema.set('toObject', { virtuals: true });

// ============================================
// PLUGIN DE SOFT DELETE
// ============================================
medicalRecordSchema.plugin(mongooseDelete, { 
  deletedAt: true,
  deletedBy: false,
  overrideMethods: 'all',
  indexFields: ['deleted']
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;