const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { ensureAuth } = require('../middleware/authMiddleware');

router.get('/', ensureAuth, examController.getExamsIndex);
router.post('/', ensureAuth, examController.postExam);
router.post('/:id/status', ensureAuth, examController.postUpdateStatus);
router.post('/:id/delete', ensureAuth, examController.postDeleteExam);

module.exports = router;
