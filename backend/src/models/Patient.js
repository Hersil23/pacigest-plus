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

// Asegurar que los virtuales se incluyan al convertir a JSON
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;