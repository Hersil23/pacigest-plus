const Payment = require('../models/Payment');
const User = require('../models/User');
const { getBankAccountsByCountry, getAvailableCountries } = require('../config/bankAccounts');
const logger = require('../utils/logger');

// ============================================
// CALCULAR PRECIO SEGÚN PLAN Y PERÍODO
// ============================================
const calculatePrice = (plan, billingPeriod, numberOfDoctors = 1) => {
  // Precios base mensuales por médico
  const basePrices = {
    premium_individual: 20,    // 1 médico
    vip_practice: 20,          // 2-9 médicos
    corporate_pro: 15,         // 10-50 médicos
    enterprise_health: 12      // 51+ médicos
  };

  const pricePerDoctor = basePrices[plan] || 20;
  let totalPrice = pricePerDoctor * numberOfDoctors;

  // Aplicar descuentos por período
  switch(billingPeriod) {
    case 'quarterly':
      totalPrice = totalPrice * 3 * 0.85; // 15% descuento
      break;
    case 'annual':
      totalPrice = totalPrice * 12 * 0.75; // 25% descuento
      break;
    case 'monthly':
    default:
      // Sin descuento
      break;
  }

  return Math.round(totalPrice * 100) / 100; // Redondear a 2 decimales
};

// ============================================
// VALIDAR PLAN SEGÚN NÚMERO DE MÉDICOS
// ============================================
const validatePlanForDoctors = (plan, numberOfDoctors) => {
  if (plan === 'premium_individual' && numberOfDoctors !== 1) {
    return { valid: false, message: 'Premium Individual es solo para 1 médico' };
  }
  if (plan === 'vip_practice' && (numberOfDoctors < 2 || numberOfDoctors > 9)) {
    return { valid: false, message: 'VIP Practice es para 2-9 médicos' };
  }
  if (plan === 'corporate_pro' && (numberOfDoctors < 10 || numberOfDoctors > 50)) {
    return { valid: false, message: 'Corporate Pro es para 10-50 médicos' };
  }
  if (plan === 'enterprise_health' && numberOfDoctors < 51) {
    return { valid: false, message: 'Enterprise Health es para 51+ médicos' };
  }
  return { valid: true };
};

// ============================================
// SOLICITAR ACTUALIZACIÓN DE PLAN
// ============================================
exports.requestPayment = async (req, res) => {
  try {
    const { plan, billingPeriod, numberOfDoctors, country } = req.body;

    // Validaciones
    if (!plan || !billingPeriod || !numberOfDoctors || !country) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Validar plan según número de médicos
    const validation = validatePlanForDoctors(plan, numberOfDoctors);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Obtener información bancaria del país
    const bankInfo = getBankAccountsByCountry(country);
    if (!bankInfo) {
      return res.status(400).json({
        success: false,
        message: 'País no soportado'
      });
    }

    // Calcular precio
    const amount = calculatePrice(plan, billingPeriod, numberOfDoctors);

    // Crear solicitud de pago
    const payment = await Payment.create({
      userId: req.user.id,
      plan,
      billingPeriod,
      numberOfDoctors,
      amount,
      currency: bankInfo.currency,
      country,
      status: 'pending'
    });

    logger.logInfo(`Solicitud de pago creada: ${payment._id}`, {
      userId: req.user.id,
      plan,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud de pago creada exitosamente',
      data: {
        payment,
        bankAccounts: bankInfo,
        instructions: 'Realiza la transferencia y sube el comprobante para activar tu suscripción'
      }
    });

  } catch (error) {
    logger.logError('Error al crear solicitud de pago', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de pago',
      error: error.message
    });
  }
};

// ============================================
// SUBIR COMPROBANTE DE PAGO
// ============================================
exports.uploadProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { proofImageUrl, referenceNumber, paymentDate, userNotes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de pago no encontrada'
      });
    }

    // Verificar que es del usuario
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Verificar que está pendiente
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya fue procesado'
      });
    }

    // Actualizar con comprobante
    payment.proofImageUrl = proofImageUrl;
    payment.referenceNumber = referenceNumber;
    payment.paymentDate = paymentDate || new Date();
    payment.userNotes = userNotes;
    await payment.save();

    logger.logInfo(`Comprobante subido para pago: ${payment._id}`, {
      userId: req.user.id,
      referenceNumber
    });

    // TODO: Enviar email al admin notificando comprobante recibido
    // TODO: Enviar email al usuario confirmando recepción

    res.status(200).json({
      success: true,
      message: 'Comprobante recibido. Verificaremos tu pago en las próximas 24-48 horas.',
      data: payment
    });

  } catch (error) {
    logger.logError('Error al subir comprobante', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir comprobante',
      error: error.message
    });
  }
};

// ============================================
// VER MIS PAGOS
// ============================================
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    logger.logError('Error al obtener pagos', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message
    });
  }
};

// ============================================
// VER PAGO POR ID
// ============================================
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Solo el dueño o admin puede ver
    if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.logError('Error al obtener pago', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago',
      error: error.message
    });
  }
};

// ============================================
// VER PAGOS PENDIENTES (ADMIN)
// ============================================
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    logger.logError('Error al obtener pagos pendientes', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos pendientes',
      error: error.message
    });
  }
};

// ============================================
// APROBAR PAGO (ADMIN)
// ============================================
exports.approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminNotes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya fue procesado'
      });
    }

    // Actualizar pago
    payment.status = 'approved';
    payment.approvedBy = req.user.id;
    payment.approvedAt = new Date();
    payment.adminNotes = adminNotes;
    payment.subscriptionStartDate = new Date();
    payment.subscriptionEndDate = payment.calculateSubscriptionEndDate();
    await payment.save();

    // Actualizar suscripción del usuario
    const user = await User.findById(payment.userId);
    user.subscription.plan = payment.plan;
    user.subscription.status = 'active';
    user.subscription.startDate = payment.subscriptionStartDate;
    user.subscription.endDate = payment.subscriptionEndDate;
    await user.save();

    logger.logAudit('PAYMENT_APPROVED', req.user.id, {
      paymentId: payment._id,
      userId: payment.userId,
      plan: payment.plan,
      amount: payment.amount
    });

    // TODO: Enviar email al usuario notificando activación

    res.status(200).json({
      success: true,
      message: 'Pago aprobado y suscripción activada',
      data: payment
    });

  } catch (error) {
    logger.logError('Error al aprobar pago', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar pago',
      error: error.message
    });
  }
};

// ============================================
// RECHAZAR PAGO (ADMIN)
// ============================================
exports.rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar una razón de rechazo'
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya fue procesado'
      });
    }

    // Actualizar pago
    payment.status = 'rejected';
    payment.rejectedAt = new Date();
    payment.rejectionReason = rejectionReason;
    await payment.save();

    logger.logAudit('PAYMENT_REJECTED', req.user.id, {
      paymentId: payment._id,
      userId: payment.userId,
      reason: rejectionReason
    });

    // TODO: Enviar email al usuario notificando rechazo

    res.status(200).json({
      success: true,
      message: 'Pago rechazado',
      data: payment
    });

  } catch (error) {
    logger.logError('Error al rechazar pago', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar pago',
      error: error.message
    });
  }
};

// ============================================
// OBTENER CUENTAS BANCARIAS POR PAÍS
// ============================================
exports.getBankAccounts = async (req, res) => {
  try {
    const { country } = req.params;

    const bankInfo = getBankAccountsByCountry(country);

    if (!bankInfo) {
      return res.status(404).json({
        success: false,
        message: 'País no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: bankInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas bancarias',
      error: error.message
    });
  }
};

// ============================================
// OBTENER PAÍSES DISPONIBLES
// ============================================
exports.getAvailableCountries = async (req, res) => {
  try {
    const countries = getAvailableCountries();

    res.status(200).json({
      success: true,
      data: countries
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener países',
      error: error.message
    });
  }
};

// ============================================
// CALCULAR PRECIO (HELPER PARA FRONTEND)
// ============================================
exports.calculatePrice = async (req, res) => {
  try {
    const { plan, billingPeriod, numberOfDoctors } = req.query;

    if (!plan || !billingPeriod || !numberOfDoctors) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros'
      });
    }

    const validation = validatePlanForDoctors(plan, parseInt(numberOfDoctors));
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const price = calculatePrice(plan, billingPeriod, parseInt(numberOfDoctors));

    res.status(200).json({
      success: true,
      data: {
        plan,
        billingPeriod,
        numberOfDoctors: parseInt(numberOfDoctors),
        price,
        currency: 'USD'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al calcular precio',
      error: error.message
    });
  }
};