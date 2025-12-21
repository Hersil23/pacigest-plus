const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  // INFORMACIÓN DE LA CITA
  // ============================================
  appointmentNumber: {
    type: String,
    unique: true,
  },
  appointmentDate: {
    type: Date,
    required: [true, 'La fecha de la cita es obligatoria']
  },
  appointmentTime: {
    type: String,
    required: [true, 'La hora de la cita es obligatoria']
  },
  duration: {
    type: Number,
    default: 30,
    min: 15,
    max: 240
  },

  // ============================================
  // TIPO Y MOTIVO
  // ============================================
  appointmentType: {
    type: String,
    enum: ['primera-vez', 'seguimiento', 'urgencia', 'control', 'cirugia', 'otro'],
    default: 'seguimiento'
  },
  reasonForVisit: {
    type: String,
    required: [true, 'El motivo de la cita es obligatorio'],
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],

  // ============================================
  // ESTADO DE LA CITA
  // ============================================
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system'],
    default: null
  },
  cancelledAt: {
    type: Date
  },

  // ============================================
  // INFORMACIÓN ADICIONAL
  // ============================================
  notes: {
    type: String,
    trim: true
  },
  privateNotes: {
    type: String,
    trim: true
  },

  // ============================================
  // RECORDATORIOS
  // ============================================
  reminders: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },

  // ============================================
  // CONFIRMACIÓN
  // ============================================
  confirmedBy: {
    type: String,
    enum: ['patient', 'doctor', 'assistant'],
    default: null
  },
  confirmedAt: {
    type: Date
  },

  // ============================================
  // PAGO
  // ============================================
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'cancelled'],
    default: 'pending'
  },
  consultationFee: {
    type: Number,
    min: 0,
    default: 0
  },

  // ============================================
  // CREACIÓN
  // ============================================
  createdBy: {
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
// MIDDLEWARE PARA GENERAR NÚMERO DE CITA
// ============================================
appointmentSchema.pre('save', async function() {
  if (!this.appointmentNumber) {
    // Genera número único: APT-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentNumber = `APT-${date}-${String(count + 1).padStart(4, '0')}`;
  }
});

// ============================================
// ÍNDICES PARA OPTIMIZACIÓN
// ============================================
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ appointmentNumber: 1 });
appointmentSchema.index({ createdAt: -1 });

// ============================================
// MÉTODO VIRTUAL PARA VERIFICAR SI ESTÁ VENCIDA
// ============================================
appointmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  const appointmentDateTime = new Date(this.appointmentDate);
  return appointmentDateTime < new Date();
});

appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;