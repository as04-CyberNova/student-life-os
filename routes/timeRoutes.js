const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Time dashboard
router.get('/', ensureAuth, timeController.getTimeIndex);

// Targets configuration
router.post('/setup', ensureAuth, timeController.postSetTargets);

// Actual log inputs
router.post('/log', ensureAuth, timeController.postLogHours);

module.exports = router;
