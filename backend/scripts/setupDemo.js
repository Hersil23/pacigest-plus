require('dotenv').config();
const mongoose = require('mongoose');
const { createDemoAccount } = require('../src/utils/createDemoAccount');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Ejecutar script
const run = async () => {
  await connectDB();
  await createDemoAccount();
  process.exit(0);
};

run();