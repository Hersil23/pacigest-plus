const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

// Todas las rutas protegidas
router.use(protect);

// Rutas de usuarios (solo doctores pueden acceder)
router.post('/', authorize('doctor'), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;