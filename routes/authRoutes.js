const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Sign up a new user
router.post('/signup', authController.signup);

// Login an existing user
router.post('/login', authController.login);

module.exports = router;
