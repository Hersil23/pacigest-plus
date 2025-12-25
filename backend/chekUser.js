require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    const user = await User.findOne({ email: 'test998@gmail.com' })
      .select('+emailVerificationToken +emailVerificationExpires');
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('\n📋 Información del usuario:');
    console.log('Email:', user.email);
    console.log('UserId:', user._id);
    console.log('Token guardado:', user.emailVerificationToken);
    console.log('Token expira:', user.emailVerificationExpires);
    console.log('Email verificado:', user.emailVerified);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();