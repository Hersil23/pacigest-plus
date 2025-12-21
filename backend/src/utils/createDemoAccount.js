const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createDemoData } = require('./demoData');

// ============================================
// CREAR CUENTA DEMO PÚBLICA
// ============================================
const createDemoAccount = async () => {
  try {
    console.log('🎁 Creando cuenta demo pública...');

    const demoEmail = 'demo@pacigest.com';
    const demoPassword = 'demo123';

    // Verificar si ya existe
    const existingDemo = await User.findOne({ email: demoEmail });
    
    if (existingDemo) {
      console.log('✅ La cuenta demo ya existe');
      return {
        success: true,
        message: 'Cuenta demo ya existe',
        email: demoEmail,
        password: demoPassword
      };
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    // Crear cuenta demo
    const demoUser = await User.create({
      email: demoEmail,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'PaciGest',
      phone: '+57300000000',
      specialty: 'Medicina General',
      licenseNumber: 'DEMO-000000',
      role: 'doctor',
      emailVerified: true, // ✅ Ya verificado
      subscription: {
        plan: 'professional', // Plan completo para demo
        status: 'active', // Siempre activo
        startDate: new Date(),
        endDate: new Date('2099-12-31') // Nunca expira
      },
      permissions: {
        canViewPatients: true,
        canCreatePatients: true,
        canEditPatientContact: true,
        canScheduleAppointments: true,
        canViewMedicalRecords: true,
        canEditMedicalRecords: true,
        canViewPrescriptions: true,
        canDeletePatients: true,
        canManageSettings: true
      },
      clinic: {
        name: 'Clínica Demo',
        address: {
          street: 'Calle Demo 123',
          city: 'Ciudad Demo',
          state: 'Estado Demo',
          country: 'Colombia'
        },
        phone: '+57300000000'
      }
    });

    console.log('✅ Cuenta demo creada exitosamente');

    // Crear datos de ejemplo
    console.log('📦 Creando datos de ejemplo para cuenta demo...');
    await createDemoData(demoUser._id);

    console.log('🎉 Cuenta demo lista para usar!');
    console.log('📧 Email: demo@pacigest.com');
    console.log('🔑 Password: demo123');

    return {
      success: true,
      message: 'Cuenta demo creada exitosamente',
      email: demoEmail,
      password: demoPassword,
      userId: demoUser._id
    };

  } catch (error) {
    console.error('❌ Error creando cuenta demo:', error);
    return {
      success: false,
      message: 'Error al crear cuenta demo',
      error: error.message
    };
  }
};

module.exports = { createDemoAccount };