const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directoryController');
const { ensureAuth } = require('../middleware/authMiddleware');

router.get('/', ensureAuth, directoryController.getDirectoryIndex);
router.post('/', ensureAuth, directoryController.postContact);
router.post('/:id/delete', ensureAuth, directoryController.deleteContact);

module.exports = router;
