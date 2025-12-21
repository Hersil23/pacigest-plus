const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ============================================
// CREAR NUEVO MÉDICO/USUARIO
// ============================================
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      specialty,
      licenseNumber,
      role
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      specialty,
      licenseNumber,
      role: role || 'doctor'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UN USUARIO POR ID
// ============================================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};