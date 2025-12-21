const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },

  // ============================================
  // INFORMACIÓN PERSONAL
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
  phone: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  profilePhotoUrl: {
    type: String,
    default: null
  },

  // ============================================
  // INFORMACIÓN PROFESIONAL
  // ============================================
  specialty: {
    type: String,
    required: [true, 'La especialidad es obligatoria'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'El número de licencia es obligatorio'],
    trim: true
  },
  consultationFee: {
    type: Number,
    min: 0,
    default: 0
  },

  // ============================================
  // HORARIOS DE ATENCIÓN
  // ============================================
  availability: {
    monday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    tuesday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    wednesday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    thursday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    friday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    saturday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' }
    },
    sunday: {
      isActive: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' }
    }
  },

  // ============================================
  // DATOS DEL CONSULTORIO
  // ============================================
  clinic: {
    name: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: {
      type: String,
      trim: true
    },
    logoUrl: {
      type: String,
      default: null
    }
  },

  // ============================================
  // CONFIGURACIÓN DE LA APLICACIÓN
  // ============================================
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    notifications: {
      emailOnNewPatient: {
        type: Boolean,
        default: true
      },
      emailAppointmentReminders: {
        type: Boolean,
        default: true
      },
      emailPaymentAlerts: {
        type: Boolean,
        default: true
      }
    }
  },

  // ============================================
  // SUSCRIPCIÓN Y PAGOS
  // ============================================
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'clinic'],
      default: 'starter'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled', 'expired'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'transfer', 'other'],
      default: null
    },
    trialEndsAt: {
      type: Date
    }
  },

  // ============================================
  // ROLES Y PERMISOS
  // ============================================
  role: {
    type: String,
    enum: ['doctor', 'assistant'],
    required: [true, 'El rol es obligatorio'],
    default: 'doctor'
  },
  permissions: {
    canViewPatients: {
      type: Boolean,
      default: true
    },
    canCreatePatients: {
      type: Boolean,
      default: true
    },
    canEditPatientContact: {
      type: Boolean,
      default: true
    },
    canScheduleAppointments: {
      type: Boolean,
      default: true
    },
    canViewMedicalRecords: {
      type: Boolean,
      default: false
    },
    canEditMedicalRecords: {
      type: Boolean,
      default: false
    },
    canViewPrescriptions: {
      type: Boolean,
      default: false
    },
    canDeletePatients: {
      type: Boolean,
      default: false
    },
    canManageSettings: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // ============================================
  // CAMPOS DEL SISTEMA
  // ============================================
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// MÉTODO PARA OCULTAR CONTRASEÑA AL DEVOLVER
// ============================================
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;