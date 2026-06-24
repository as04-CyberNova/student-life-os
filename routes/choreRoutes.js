const express = require('express');
const router = express.Router();
const choreController = require('../controllers/choreController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Chores page listing laundry and water logs
router.get('/', ensureAuth, choreController.getChoresIndex);

// Laundry endpoints
router.post('/laundry', ensureAuth, choreController.postLaundry);
router.post('/laundry/:id/return', ensureAuth, choreController.postReturnLaundry);

// Water can endpoints
router.post('/water/open', ensureAuth, choreController.postOpenWaterCan);

module.exports = router;
