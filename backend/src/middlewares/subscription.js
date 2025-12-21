// ============================================
// VERIFICAR SUSCRIPCIÓN ACTIVA
// ============================================
exports.checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const { subscription } = user;

    // Si no tiene suscripción, denegar acceso
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No tienes una suscripción activa',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Verificar si está en trial
    if (subscription.status === 'trial') {
      const now = new Date();
      const trialEnd = new Date(subscription.trialEndsAt);

      // Si el trial expiró
      if (now > trialEnd) {
        // Actualizar estado a expirado
        user.subscription.status = 'expired';
        await user.save();

        return res.status(403).json({
          success: false,
          message: 'Tu período de prueba ha expirado. Por favor, suscríbete para continuar usando PaciGest Plus.',
          code: 'TRIAL_EXPIRED',
          trialEndDate: trialEnd
        });
      }

      // Trial aún válido - calcular días restantes
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      
      // Agregar info al request para uso posterior
      req.subscriptionInfo = {
        status: 'trial',
        daysLeft: daysLeft,
        trialEndDate: trialEnd
      };

      return next();
    }

    // Verificar si la suscripción está activa
    if (subscription.status === 'active') {
      // Verificar si no ha expirado
      if (subscription.endDate) {
        const now = new Date();
        const endDate = new Date(subscription.endDate);

        if (now > endDate) {
          // Suscripción expirada
          user.subscription.status = 'expired';
          await user.save();

          return res.status(403).json({
            success: false,
            message: 'Tu suscripción ha expirado. Por favor, renueva tu plan.',
            code: 'SUBSCRIPTION_EXPIRED',
            endDate: endDate
          });
        }
      }

      // Suscripción activa y válida
      req.subscriptionInfo = {
        status: 'active',
        plan: subscription.plan,
        endDate: subscription.endDate
      };

      return next();
    }

    // Estados: inactive, cancelled, expired
    const statusMessages = {
      inactive: 'Tu suscripción está inactiva. Por favor, contacta a soporte.',
      cancelled: 'Tu suscripción ha sido cancelada. Por favor, suscríbete nuevamente.',
      expired: 'Tu suscripción ha expirado. Por favor, renueva tu plan.'
    };

    return res.status(403).json({
      success: false,
      message: statusMessages[subscription.status] || 'Estado de suscripción no válido',
      code: 'SUBSCRIPTION_NOT_ACTIVE',
      status: subscription.status
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar suscripción',
      error: error.message
    });
  }
};

// ============================================
// VERIFICAR LÍMITES POR PLAN (OPCIONAL)
// ============================================
exports.checkPlanLimits = (feature) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const plan = user.subscription?.plan || 'starter';

      // Definir límites por plan
      const limits = {
        starter: {
          maxPatients: 50,
          maxAppointmentsPerDay: 20,
          canExportData: false,
          canUseAdvancedStats: false
        },
        professional: {
          maxPatients: 200,
          maxAppointmentsPerDay: 50,
          canExportData: true,
          canUseAdvancedStats: true
        },
        clinic: {
          maxPatients: -1, // ilimitado
          maxAppointmentsPerDay: -1,
          canExportData: true,
          canUseAdvancedStats: true
        }
      };

      const planLimits = limits[plan];

      // Verificar el feature específico
      if (feature && planLimits[feature] === false) {
        return res.status(403).json({
          success: false,
          message: `Esta funcionalidad no está disponible en tu plan ${plan}. Actualiza tu plan para acceder.`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentPlan: plan
        });
      }

      req.planLimits = planLimits;
      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar límites del plan',
        error: error.message
      });
    }
  };
};