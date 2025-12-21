const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// ============================================
// CREAR DATOS DE EJEMPLO PARA NUEVO MÉDICO
// ============================================
exports.createDemoData = async (doctorId) => {
  try {
    console.log(`📦 Creando datos de ejemplo para médico: ${doctorId}`);

    // ============================================
    // 1. CREAR 3 PACIENTES DE EJEMPLO
    // ============================================
    const patients = await Patient.create([
      {
        doctorIds: [doctorId],
        firstName: 'Carlos',
        lastName: 'Ramírez',
        dateOfBirth: '1985-03-15',
        gender: 'M',
        email: 'carlos.ramirez@ejemplo.com',
        phone: '+573001234567',
        bloodType: 'O+',
        weight: 75,
        height: 175,
        address: {
          street: 'Calle 45 #12-34',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia'
        },
        emergencyContact: {
          name: 'Ana Ramírez',
          relationship: 'Esposa',
          phone: '+573009876543'
        }
      },
      {
        doctorIds: [doctorId],
        firstName: 'Laura',
        lastName: 'Martínez',
        dateOfBirth: '1992-07-22',
        gender: 'F',
        email: 'laura.martinez@ejemplo.com',
        phone: '+573112345678',
        bloodType: 'A+',
        weight: 62,
        height: 165,
        address: {
          street: 'Carrera 15 #89-12',
          city: 'Medellín',
          state: 'Antioquia',
          country: 'Colombia'
        },
        emergencyContact: {
          name: 'Pedro Martínez',
          relationship: 'Padre',
          phone: '+573118765432'
        }
      },
      {
        doctorIds: [doctorId],
        firstName: 'Roberto',
        lastName: 'González',
        dateOfBirth: '1978-11-05',
        gender: 'M',
        email: 'roberto.gonzalez@ejemplo.com',
        phone: '+573209876543',
        bloodType: 'B+',
        weight: 82,
        height: 180,
        address: {
          street: 'Avenida 68 #23-45',
          city: 'Cali',
          state: 'Valle del Cauca',
          country: 'Colombia'
        },
        emergencyContact: {
          name: 'Marta González',
          relationship: 'Esposa',
          phone: '+573201234567'
        }
      }
    ]);

    console.log(`✅ ${patients.length} pacientes de ejemplo creados`);

    // ============================================
    // 2. CREAR CITAS DE EJEMPLO
    // ============================================
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.create([
      {
        patientId: patients[0]._id,
        doctorId: doctorId,
        appointmentDate: tomorrow,
        appointmentTime: '10:00',
        duration: 30,
        appointmentType: 'seguimiento',
        reasonForVisit: 'Control de presión arterial',
        status: 'confirmed',
        consultationFee: 500
      },
      {
        patientId: patients[1]._id,
        doctorId: doctorId,
        appointmentDate: nextWeek,
        appointmentTime: '14:30',
        duration: 45,
        appointmentType: 'primera-vez',
        reasonForVisit: 'Consulta general',
        status: 'pending',
        consultationFee: 600
      }
    ]);

    console.log(`✅ ${appointments.length} citas de ejemplo creadas`);

    // ============================================
    // 3. CREAR HISTORIA CLÍNICA DE EJEMPLO
    // ============================================
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const medicalRecord = await MedicalRecord.create({
      patientId: patients[0]._id,
      doctorId: doctorId,
      consultationDate: yesterday,
      reasonForVisit: 'Control de rutina',
      symptoms: ['Ninguno'],
      vitalSigns: {
        bloodPressure: {
          systolic: 120,
          diastolic: 80,
          display: '120/80'
        },
        heartRate: 72,
        temperature: 36.5,
        weight: 75,
        height: 175,
        oxygenSaturation: 98
      },
      diagnosis: 'Paciente en buen estado de salud. Signos vitales normales.',
      treatment: 'Continuar con hábitos saludables. Control en 6 meses.',
      notes: 'Paciente de ejemplo para demostración del sistema.',
      status: 'completed'
    });

    console.log(`✅ Historia clínica de ejemplo creada`);

    // ============================================
    // 4. CREAR RECETA DE EJEMPLO
    // ============================================
    const prescription = await Prescription.create({
      patientId: patients[0]._id,
      doctorId: doctorId,
      medicalRecordId: medicalRecord._id,
      prescriptionDate: yesterday,
      diagnosis: 'Prevención',
      medications: [
        {
          name: 'Multivitamínico',
          activeIngredient: 'Complejo multivitamínico',
          presentation: 'Tabletas',
          dosage: '1 tableta',
          frequency: 'Una vez al día',
          duration: '30 días',
          route: 'oral',
          instructions: 'Tomar con el desayuno',
          quantity: 30
        }
      ],
      generalInstructions: 'Receta de ejemplo para demostración.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log(`✅ Receta de ejemplo creada`);

    return {
      success: true,
      message: 'Datos de ejemplo creados exitosamente',
      data: {
        patients: patients.length,
        appointments: appointments.length,
        medicalRecords: 1,
        prescriptions: 1
      }
    };

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    return {
      success: false,
      message: 'Error al crear datos de ejemplo',
      error: error.message
    };
  }
};