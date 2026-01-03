require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../src/models/Patient');

// ID de Andrea (obtenido del localStorage)
const ANDREA_ID = '6950a899ede1e403fc82e258';

const updatePatientsDoctor = async () => {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar pacientes sin doctorIds o con array vacío
    const patientsWithoutDoctor = await Patient.find({
      $or: [
        { doctorIds: { $exists: false } },
        { doctorIds: null },
        { doctorIds: [] },
        { doctorIds: { $size: 0 } }
      ]
    });

    console.log(`📊 Pacientes sin doctorIds encontrados: ${patientsWithoutDoctor.length}`);

    if (patientsWithoutDoctor.length === 0) {
      console.log('✅ No hay pacientes para actualizar');
      process.exit(0);
    }

    // Actualizar todos los pacientes - AGREGAR Andrea al array doctorIds
    const result = await Patient.updateMany(
      {
        $or: [
          { doctorIds: { $exists: false } },
          { doctorIds: null },
          { doctorIds: [] },
          { doctorIds: { $size: 0 } }
        ]
      },
      {
        $set: { doctorIds: [mongoose.Types.ObjectId(ANDREA_ID)] }
      }
    );

    console.log(`✅ Pacientes actualizados: ${result.modifiedCount}`);
    console.log(`📝 ID asignado: ${ANDREA_ID}`);

    // Verificar
    const updatedPatients = await Patient.find({ 
      doctorIds: mongoose.Types.ObjectId(ANDREA_ID) 
    });
    console.log(`🔍 Total de pacientes con doctorId de Andrea: ${updatedPatients.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar script
updatePatientsDoctor();