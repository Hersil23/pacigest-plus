const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
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
  // INFORMACIÓN DE LA RECETA
  // ============================================
  prescriptionDate: {
    type: Date,
    required: [true, 'La fecha de prescripción es obligatoria'],
    default: Date.now
  },
  prescriptionNumber: {
    type: String,
    unique: true,
  },

  // ============================================
  // MEDICAMENTOS
  // ============================================
  medications: [{
    name: {
      type: String,
      required: [true, 'El nombre del medicamento es obligatorio'],
      trim: true
    },
    activeIngredient: {
      type: String,
      trim: true
    },
    presentation: {
      type: String,
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'La dosis es obligatoria'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'La frecuencia es obligatoria'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'La duración es obligatoria'],
      trim: true
    },
    route: {
      type: String,
      enum: ['oral', 'intravenosa', 'intramuscular', 'subcutánea', 'tópica', 'inhalatoria', 'rectal', 'oftálmica', 'ótica', 'otra'],
      default: 'oral'
    },
    instructions: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      min: 1
    }
  }],

  // ============================================
  // DIAGNÓSTICO RELACIONADO
  // ============================================
  diagnosis: {
    type: String,
    trim: true
  },

  // ============================================
  // INDICACIONES GENERALES
  // ============================================
  generalInstructions: {
    type: String,
    trim: true
  },

  // ============================================
  // VALIDEZ
  // ============================================
  validUntil: {
    type: Date
  },
  isValid: {
    type: Boolean,
    default: true
  },

  // ============================================
  // ESTADO
  // ============================================
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
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
// MIDDLEWARE PARA GENERAR NÚMERO DE RECETA
// ============================================
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    // Genera número único: RX-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionNumber = `RX-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ============================================
// MIDDLEWARE PARA SOFT DELETE
// ============================================
// Excluir registros eliminados en queries automáticamente
prescriptionSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ createdAt: -1 });
prescriptionSchema.index({ deletedAt: 1 });

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================
// Soft delete
prescriptionSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  this.status = 'cancelled';
  return await this.save();
};

// Restaurar
prescriptionSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.isActive = true;
  this.status = 'active';
  return await this.save();
};

// Force delete (eliminar permanentemente)
prescriptionSchema.methods.forceDelete = async function() {
  return await this.deleteOne();
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Encontrar solo eliminados
prescriptionSchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, deletedAt: { $ne: null } });
};

// Encontrar incluyendo eliminados
prescriptionSchema.statics.findWithDeleted = function(filter = {}) {
  return this.find(filter).setOptions({ includeDeleted: true });
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;