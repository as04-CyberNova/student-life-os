const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Dashboard ledger page
router.get('/', ensureAuth, budgetController.getBudgetIndex);

// Personal transaction CRUD
router.post('/transaction', ensureAuth, budgetController.postTransaction);
router.delete('/transaction/:id', ensureAuth, budgetController.deleteTransaction);

// Roommate split actions
router.post('/split', ensureAuth, budgetController.postSplitDebt);
router.post('/split/settle', ensureAuth, budgetController.postSettleDebt);

module.exports = router;
