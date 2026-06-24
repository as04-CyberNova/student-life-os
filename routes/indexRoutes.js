const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Primary consolidated dashboard landing
router.get('/', ensureAuth, indexController.getDashboard);

module.exports = router;
