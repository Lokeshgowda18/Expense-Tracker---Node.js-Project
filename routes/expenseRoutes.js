const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Add a new expense
router.post('/expenses', authMiddleware, expenseController.addExpense);

// Get all expenses for a user
router.get('/expenses', authMiddleware, expenseController.getExpenses);

// Delete an expense
router.delete('/expenses/:id', authMiddleware, expenseController.deleteExpense);

// Edit an expense
router.put('/expenses/:id', authMiddleware, expenseController.editExpense);

module.exports = router;
