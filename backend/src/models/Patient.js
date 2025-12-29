const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // ============================================
  // RELACIÓN CON MÉDICOS
  // ============================================
  doctorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // ============================================
  // INFORMACIÓN PERSONAL BÁSICA
  // ============================================
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  secondName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  secondLastName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: [true, 'El género es obligatorio']
  },

  // ============================================
  // INFORMACIÓN DE CONTACTO
  // ============================================
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // ============================================
  // CONTACTO DE EMERGENCIA
  // ============================================
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },

  // ============================================
  // INFORMACIÓN MÉDICA BÁSICA
  // ============================================
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'El tipo de sangre es obligatorio']
  },
  weight: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },

  // ============================================
  // ALERGIAS (Lista + Texto libre)
  // ============================================
  allergies: {
    list: [{
      name: {
        type: String,
        trim: true
      },
      severity: {
        type: String,
        enum: ['leve', 'moderada', 'severa'],
        default: 'moderada'
      }
    }],
    additionalNotes: {
      type: String,
      trim: true
    }
  },

  // ============================================
  // ENFERMEDADES CRÓNICAS
  // ============================================
  chronicDiseases: [{
    type: String,
    trim: true
  }],

  // ============================================
  // HÁBITOS
  // ============================================
  habits: {
    smoker: {
      type: Boolean,
      default: false
    },
    smokerDetails: {
      type: String,
      trim: true
    },
    alcohol: {
      type: Boolean,
      default: false
    },
    alcoholDetails: {
      type: String,
      trim: true
    }
  },

  // ============================================
  // ANTECEDENTES FAMILIARES
  // ============================================
  familyHistory: {
    type: String,
    trim: true
  },

  // ============================================
  // HISTORIAL DE CONSULTAS (ARRAY) - NUEVO SISTEMA
  // ============================================
  consultations: [{
    consultationDate: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: [20, 'El motivo debe tener al menos 20 caracteres']
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
      minlength: [30, 'Los síntomas deben tener al menos 30 caracteres']
    },
    symptomsDuration: {
      type: String,
      required: true,
      trim: true
    },
    previousTreatment: {
      type: Boolean,
      default: false
    },
    treatmentDetails: {
      type: String,
      trim: true
    },
    recentConsultations: {
      type: Boolean,
      default: false
    },
    consultationDetails: {
      type: String,
      trim: true
    },
    doctorNotes: {
      type: String,
      required: true,
      trim: true,
      minlength: [50, 'Las notas del médico deben tener al menos 50 caracteres']
    },
    vitalSigns: {
      bloodPressure: String,
      temperature: Number,
      heartRate: Number,
      respiratoryRate: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // ============================================
  // CONSULTA ÚNICA (DEPRECATED - Se mantiene por compatibilidad)
  // ============================================
  consultation: {
    reason: String,
    symptoms: String,
    symptomsDuration: String,
    previousTreatment: Boolean,
    treatmentDetails: String,
    recentConsultations: Boolean,
    consultationDetails: String
  },

  // ============================================
  // NOTAS GENERALES DEL MÉDICO (No por consulta)
  // ============================================
  doctorNotes: {
    type: String,
    trim: true
  },

  // ============================================
  // ODONTOGRAMA (SOLO ODONTÓLOGOS)
  // ============================================
  odontogram: {
    teeth: [{
      number: {
        type: Number,
        min: 11,
        max: 48
      },
      status: {
        type: String,
        enum: ['sano', 'caries', 'obturacion', 'ausente', 'fractura', 'corona', 'implante', 'endodoncia', 'porExtraer'],
        default: 'sano'
      },
      surfaces: [{
        type: String,
        enum: ['oclusal', 'vestibular', 'palatina', 'mesial', 'distal']
      }],
      notes: {
        type: String,
        trim: true
      }
    }],
    lastUpdate: {
      type: Date
    }
  },

  // ============================================
  // FOTOS Y DOCUMENTOS (BUNNY.NET CDN)
  // ============================================
  patientPhoto: {
    type: String, // URL de bunny.net
    default: null
  },

  clinicalPhotos: [{
    url: {
      type: String, // URL de bunny.net
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  signature: {
    type: String, // URL de bunny.net
    default: null
  },
  
  // ============================================
  // SEGURO MÉDICO
  // ============================================
  insuranceInfo: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    validUntil: {
      type: Date
    }
  },

  // ============================================
  // IDIOMA DEL PACIENTE
  // ============================================
  language: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  },

  // ============================================
  // NÚMERO DE EXPEDIENTE
  // ============================================
  medicalRecordNumber: {
    type: String,
    unique: true,
  },

  // ============================================
  // ESTADO DEL PACIENTE
  // ============================================
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased', 'transferred'],
    default: 'active'
  },

  // ============================================
  // SOFT DELETE
  // ============================================
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// ============================================
// MIDDLEWARE PARA GENERAR NÚMERO DE EXPEDIENTE
// ============================================
patientSchema.pre('save', async function() {
  if (!this.medicalRecordNumber) {
    // Genera número único: PAC-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Patient').countDocuments();
    this.medicalRecordNumber = `PAC-${date}-${String(count + 1).padStart(4, '0')}`;
  }
});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
patientSchema.index({ doctorIds: 1, isActive: 1 });
patientSchema.index({ medicalRecordNumber: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ deletedAt: 1 });

// ============================================
// MÉTODO VIRTUAL PARA CALCULAR EDAD
// ============================================
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// ============================================
// MÉTODO VIRTUAL PARA CALCULAR IMC
// ============================================
patientSchema.virtual('bmi').get(function() {
  if (!this.weight || !this.height) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
});

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================
// Soft delete
patientSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  this.status = 'inactive';
  return await this.save();
};

// Restaurar
patientSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.isActive = true;
  this.status = 'active';
  return await this.save();
};

// Force delete (eliminar permanentemente)
patientSchema.methods.forceDelete = async function() {
  return await this.deleteOne();
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Encontrar solo eliminados
patientSchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, deletedAt: { $ne: null } });
};

// Encontrar incluyendo eliminados
patientSchema.statics.findWithDeleted = function(filter = {}) {
  return this.find(filter).setOptions({ includeDeleted: true });
};

// Asegurar que los virtuales se incluyan al convertir a JSON
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;