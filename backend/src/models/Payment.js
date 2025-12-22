const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // ============================================
  // INFORMACIÓN DEL USUARIO
  // ============================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ============================================
  // INFORMACIÓN DEL PLAN
  // ============================================
  plan: {
    type: String,
    enum: ['premium_individual', 'vip_practice', 'corporate_pro', 'enterprise_health'],
    required: true
  },
  
  billingPeriod: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    required: true
  },

  numberOfDoctors: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // ============================================
  // INFORMACIÓN FINANCIERA
  // ============================================
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  currency: {
    type: String,
    enum: ['USD', 'EUR', 'ARS', 'VES'],
    required: true,
    default: 'USD'
  },

  // ============================================
  // PAÍS Y MÉTODO DE PAGO
  // ============================================
  country: {
    type: String,
    enum: ['españa', 'argentina', 'venezuela', 'usa'],
    required: true
  },

  paymentMethod: {
    type: String,
    default: 'manual_transfer'
  },

  // ============================================
  // COMPROBANTE DE PAGO
  // ============================================
  proofImageUrl: {
    type: String,
    default: null
  },

  referenceNumber: {
    type: String,
    trim: true
  },

  paymentDate: {
    type: Date,
    default: Date.now
  },

  // ============================================
  // DATOS BANCARIOS USADOS
  // ============================================
  bankAccountUsed: {
    country: String,
    bank: String,
    accountType: String, // IBAN, CBU, Zelle, etc.
    accountNumber: String
  },

  // ============================================
  // ESTADO DEL PAGO
  // ============================================
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },

  // ============================================
  // NOTAS Y ADMINISTRACIÓN
  // ============================================
  userNotes: {
    type: String,
    trim: true
  },

  adminNotes: {
    type: String,
    trim: true
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvedAt: {
    type: Date
  },

  rejectedAt: {
    type: Date
  },

  rejectionReason: {
    type: String,
    trim: true
  },

  // ============================================
  // PERÍODO DE SUSCRIPCIÓN
  // ============================================
  subscriptionStartDate: {
    type: Date
  },

  subscriptionEndDate: {
    type: Date
  },

  // ============================================
  // METADATA
  // ============================================
  isActive: {
    type: Boolean,
    default: true
  },

  expiresAt: {
    type: Date,
    default: function() {
      // Comprobante expira en 7 días si no se aprueba
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }

}, {
  timestamps: true
});

// ============================================
// ÍNDICES
// ============================================
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ plan: 1 });

// ============================================
// MÉTODOS
// ============================================

// Calcular fecha de fin de suscripción
paymentSchema.methods.calculateSubscriptionEndDate = function() {
  const startDate = this.subscriptionStartDate || new Date();
  let endDate = new Date(startDate);

  switch(this.billingPeriod) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'annual':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }

  return endDate;
};

// Verificar si el comprobante expiró
paymentSchema.methods.isExpired = function() {
  return this.status === 'pending' && new Date() > this.expiresAt;
};

// ============================================
// MIDDLEWARE PRE-SAVE
// ============================================
paymentSchema.pre('save', function() {
  // Si se aprueba, calcular fechas de suscripción
  if (this.isModified('status') && this.status === 'approved' && !this.subscriptionStartDate) {
    this.subscriptionStartDate = new Date();
    this.subscriptionEndDate = this.calculateSubscriptionEndDate();
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;