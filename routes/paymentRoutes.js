const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a payment order
router.post('/pay', authMiddleware, paymentController.createOrder);

// Check payment status
router.get('/payment-status/:orderId', paymentController.paymentStatus);

module.exports = router;
