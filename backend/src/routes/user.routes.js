const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de usuarios
router.post('/', userController.createUser);           // Crear usuario
router.get('/', userController.getAllUsers);           // Obtener todos
router.get('/:id', userController.getUserById);        // Obtener uno por ID

module.exports = router;